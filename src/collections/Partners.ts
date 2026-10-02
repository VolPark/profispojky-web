import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access/roles'
import { adminOnlyPermanentDelete } from '@/hooks/adminOnlyPermanentDelete'
import { REGIONS } from '@/lib/regions'

export const Partners: CollectionConfig = {
  slug: 'partners',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  hooks: { beforeDelete: [adminOnlyPermanentDelete] },
  // Historie změn – každou úpravu lze vrátit (záložka Verze v adminu).
  versions: { maxPerDoc: 20 },
  labels: { singular: 'Prodejní místo', plural: 'Prodejní síť' },
  admin: {
    group: 'Obsah',
    useAsTitle: 'name',
    defaultColumns: ['name', 'address', 'region'],
    listSearchableFields: ['name', 'address'],
    pagination: { defaultLimit: 50 },
  },
  defaultSort: 'name',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', label: 'Název', type: 'text', required: true },
    { name: 'address', label: 'Adresa', type: 'text', required: true, admin: { description: 'Ulice č., PSČ Obec' } },
    {
      name: 'region',
      label: 'Kraj',
      type: 'select',
      required: true,
      index: true,
      options: REGIONS.map((r) => ({ value: r.id, label: `${r.name} (${r.country === 'SK' ? 'SK' : 'ČR'})` })),
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Telefon', type: 'text' },
        { name: 'web', label: 'Web', type: 'text' },
      ],
    },
  ],
}
