import crypto from 'crypto'
import { APIError, ValidationError, type CollectionConfig } from 'payload'

import { admins, adminsField, hiddenUnlessAdmin, isAdminUser, ROLES } from '@/access/roles'
import { authEmailHTML, authEmailSubject } from '@/email/auth-emails'

const MIN_PASSWORD_LENGTH = 10
const INVITE_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uživatel', plural: 'Uživatelé' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Nastavení',
    hidden: hiddenUnlessAdmin,
    description:
      'Nový účet: vyplňte e-mail, jméno a roli, heslo zadejte libovolné dočasné. Uživateli hned přijde e-mail, kde si nastaví vlastní heslo.',
  },
  auth: {
    // Po 5 špatných pokusech se účet na 10 minut zamkne (odemknout může i Admin).
    maxLoginAttempts: 5,
    lockTime: 10 * 60 * 1000,
    // Přihlášení platí 8 hodin (pracovní den).
    tokenExpiration: 8 * 60 * 60,
    forgotPassword: {
      expiration: 60 * 60 * 1000,
      generateEmailSubject: authEmailSubject,
      generateEmailHTML: authEmailHTML,
    },
  },
  access: {
    // Každý vidí a upravuje jen svůj profil (jméno, heslo), admin všechny.
    read: ({ req }) => (isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    update: ({ req }) => (isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: admins,
    delete: admins,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (typeof data?.password === 'string' && data.password.length < MIN_PASSWORD_LENGTH) {
          throw new ValidationError({
            errors: [{ message: `Heslo musí mít aspoň ${MIN_PASSWORD_LENGTH} znaků.`, path: 'password' }],
          })
        }
        return data
      },
    ],
    beforeChange: [
      ({ data, operation, originalDoc, req }) => {
        // Admin si nemůže sám odebrat roli Admin – web by mohl zůstat bez správce.
        if (operation === 'update' && req.user?.id === originalDoc?.id && originalDoc?.role === 'admin' && data.role && data.role !== 'admin') {
          throw new APIError('Vlastní roli Admin si odebrat nemůžete. Požádejte jiného admina.', 400)
        }
        return data
      },
    ],
    beforeDelete: [
      ({ id, req }) => {
        if (req.user?.id === id) throw new APIError('Vlastní účet smazat nemůžete.', 400)
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        // Pozvánka: nový uživatel dostane e-mail s odkazem na nastavení vlastního hesla.
        // Token se zapisuje ve stejné transakci jako založení účtu (payload.forgotPassword
        // by nového uživatele uvnitř transakce nenašel a e-mail by potichu neodešel).
        if (operation !== 'create' || req.context?.skipInvite) return doc
        const token = crypto.randomBytes(20).toString('hex')
        await req.payload.db.updateOne({
          collection: 'users',
          id: doc.id,
          data: { resetPasswordToken: token, resetPasswordExpiration: new Date(Date.now() + INVITE_EXPIRATION_MS).toISOString() },
          req,
        })
        const inviteReq = { ...req, context: { ...req.context, invite: true } } as typeof req
        await req.payload.sendEmail({
          to: doc.email,
          subject: authEmailSubject({ req: inviteReq }),
          html: authEmailHTML({ req: inviteReq, token, user: doc }),
        })
        return doc
      },
    ],
  },
  fields: [
    { name: 'name', label: 'Jméno', type: 'text', required: true },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [...ROLES],
      saveToJWT: true,
      access: { update: adminsField, create: adminsField },
      admin: {
        description: 'Editor: aktuality a texty. Správce katalogu: navíc produkty, řady, dokumenty a import z BC. Admin: vše včetně uživatelů.',
      },
    },
  ],
}
