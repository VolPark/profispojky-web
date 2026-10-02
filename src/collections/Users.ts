import type { CollectionConfig } from 'payload'

import { admins, adminsField, hiddenUnlessAdmin, isAdminUser, ROLES } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Uživatel', plural: 'Uživatelé' },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
    group: 'Nastavení',
    hidden: hiddenUnlessAdmin,
  },
  auth: true,
  access: {
    // Každý vidí a upravuje jen svůj profil, admin všechny.
    read: ({ req }) => (isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    update: ({ req }) => (isAdminUser(req.user) ? true : req.user ? { id: { equals: req.user.id } } : false),
    create: admins,
    delete: admins,
  },
  fields: [
    { name: 'name', label: 'Jméno', type: 'text' },
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
        description:
          'Editor: aktuality a texty. Správce katalogu: navíc produkty, řady, dokumenty a import z BC. Admin: vše.',
      },
    },
  ],
}
