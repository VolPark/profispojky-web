import { APIError, commitTransaction, initTransaction, killTransaction, type CollectionConfig } from 'payload'

import { admins, catalogStaff, hiddenUnlessCatalog, isCatalogUser } from '@/access/roles'
import { applyImport, computeDiff, diffSummary } from '@/lib/bc-import/apply'
import { parseBcFile } from '@/lib/bc-import/parse'
import type { BcRow } from '@/lib/bc-import/types'

export const BcImports: CollectionConfig = {
  slug: 'bc-imports',
  labels: { singular: 'Import z BC', plural: 'Import z BC' },
  admin: {
    group: 'Katalog',
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'status', 'createdAt', 'uploadedBy'],
    description:
      'Nahrajte export položek z Business Central (XLSX nebo CSV). XLSX může mít list „Atributy“ (Kód · Atribut · Hodnota · Jednotka) – z něj se plní technické atributy a technický list. Uvidíte, co je nové, co se změnilo a co se skryje. Změny se zapíšou až po kliknutí na Potvrdit.',
    hidden: hiddenUnlessCatalog,
  },
  defaultSort: '-createdAt',
  access: {
    read: catalogStaff,
    create: catalogStaff,
    update: () => false,
    delete: admins,
  },
  upload: {
    // Soubor se jen načte a rozparsuje; uchovávají se řádky (pole `rows`), ne samotný soubor.
    disableLocalStorage: true,
    mimeTypes: [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/csv',
      'application/vnd.ms-excel',
    ],
  },
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        if (operation !== 'create') return data
        if (!req.file) throw new APIError('Nahrajte soubor s exportem z BC.', 400)
        const parsed = await parseBcFile(req.file.data, req.file.name)
        if (!parsed.rows.length) {
          return { ...data, status: 'failed', errors: parsed.errors, columns: parsed.columns, uploadedBy: req.user?.id }
        }
        const diff = await computeDiff(req.payload, parsed.rows, req)
        return {
          ...data,
          status: 'draft',
          rows: parsed.rows,
          diff,
          summary: diffSummary(diff),
          errors: parsed.errors,
          columns: parsed.columns,
          uploadedBy: req.user?.id,
        }
      },
    ],
    afterChange: [
      async ({ doc, operation, req }) => {
        if (operation !== 'create' || doc.status !== 'draft') return doc
        // Starší nepotvrzené náhledy už neplatí.
        await req.payload.update({
          collection: 'bc-imports',
          where: { and: [{ status: { equals: 'draft' } }, { id: { not_equals: doc.id } }] },
          data: { status: 'superseded' },
          req,
          overrideAccess: true,
        })
        return doc
      },
    ],
  },
  endpoints: [
    {
      path: '/:id/confirm',
      method: 'post',
      handler: async (req) => {
        if (!isCatalogUser(req.user)) return Response.json({ error: 'Nemáte oprávnění k importu.' }, { status: 403 })
        const id = req.routeParams?.id as string
        const doc = await req.payload.findByID({ collection: 'bc-imports', id, depth: 0, overrideAccess: true })
        if (doc.status !== 'draft') {
          return Response.json({ error: 'Tento import už nelze potvrdit (byl potvrzen nebo nahrazen novějším).' }, { status: 409 })
        }
        const shouldCommit = await initTransaction(req)
        try {
          const diff = await applyImport(req.payload, (doc.rows ?? []) as BcRow[], req)
          await req.payload.update({
            collection: 'bc-imports',
            id,
            req,
            overrideAccess: true,
            data: {
              status: 'confirmed',
              confirmedAt: new Date().toISOString(),
              confirmedBy: req.user?.id,
              diff,
              summary: diffSummary(diff),
            },
          })
          if (shouldCommit) await commitTransaction(req)
          return Response.json({ ok: true, summary: diffSummary(diff) })
        } catch (err) {
          await killTransaction(req)
          req.payload.logger.error({ err, msg: 'BC import failed' })
          const { sendAlert } = await import('@/lib/alert')
          await sendAlert({
            title: 'Import z BC selhal',
            key: `bc-import|${id}`,
            impact: 'Potvrzení importu se nezapsalo – katalog na webu zůstal beze změny (transakce byla vrácena).',
            details: { Import: String(doc.filename ?? id), Uživatel: req.user && 'email' in req.user ? String(req.user.email) : undefined, Chyba: err instanceof Error ? err.message.slice(0, 1000) : String(err) },
          })
          return Response.json({ error: 'Import se nepodařilo zapsat. Nic se nezměnilo.' }, { status: 500 })
        }
      },
    },
  ],
  fields: [
    {
      name: 'review',
      type: 'ui',
      admin: { components: { Field: '/components/admin/ImportReview#ImportReview' } },
    },
    {
      name: 'status',
      label: 'Stav',
      type: 'select',
      defaultValue: 'draft',
      options: [
        { label: 'Čeká na potvrzení', value: 'draft' },
        { label: 'Potvrzeno', value: 'confirmed' },
        { label: 'Nahrazeno novějším', value: 'superseded' },
        { label: 'Chyba souboru', value: 'failed' },
      ],
      admin: { readOnly: true, position: 'sidebar' },
    },
    {
      name: 'summary',
      label: 'Souhrn',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'created', type: 'number' },
        { name: 'changed', type: 'number' },
        { name: 'hidden', type: 'number' },
        { name: 'unchanged', type: 'number' },
      ],
    },
    { name: 'diff', type: 'json', admin: { hidden: true } },
    { name: 'rows', type: 'json', admin: { hidden: true } },
    { name: 'errors', type: 'json', admin: { hidden: true } },
    { name: 'columns', type: 'json', admin: { hidden: true } },
    { name: 'uploadedBy', label: 'Nahrál', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'confirmedBy', label: 'Potvrdil', type: 'relationship', relationTo: 'users', admin: { readOnly: true, position: 'sidebar' } },
    { name: 'confirmedAt', label: 'Potvrzeno', type: 'date', admin: { readOnly: true, position: 'sidebar' } },
  ],
}
