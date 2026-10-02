import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access/roles'
import { adminOnlyPermanentDelete } from '@/hooks/adminOnlyPermanentDelete'

export const Contacts: CollectionConfig = {
  slug: 'contacts',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  hooks: { beforeDelete: [adminOnlyPermanentDelete] },
  // Historie změn – každou úpravu lze vrátit (záložka Verze v adminu).
  versions: { maxPerDoc: 20 },
  labels: { singular: 'Kontaktní osoba', plural: 'Kontakty' },
  admin: { group: 'Obsah', useAsTitle: 'name', defaultColumns: ['name', 'role', 'phone', 'email', 'order'] },
  defaultSort: 'order',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', label: 'Jméno', type: 'text', required: true },
    { name: 'role', label: 'Pozice', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Telefon', type: 'text' },
        { name: 'email', label: 'E-mail', type: 'email' },
      ],
    },
    { name: 'photo', label: 'Fotka', type: 'upload', relationTo: 'media' },
    { name: 'order', label: 'Pořadí', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
  ],
}
