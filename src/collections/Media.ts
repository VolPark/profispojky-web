import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Obrázek', plural: 'Obrázky' },
  admin: { group: 'Obsah', useAsTitle: 'alt' },
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    {
      name: 'alt',
      label: 'Popis obrázku (alt)',
      type: 'text',
      required: true,
      admin: { description: 'Krátký popis pro nevidomé a vyhledávače, např. „Mosazná svěrná spojka BA 32“.' },
    },
  ],
  upload: {
    mimeTypes: ['image/*'],
    imageSizes: [
      { name: 'thumb', width: 160, height: 160, fit: 'contain', background: '#ffffff' },
      { name: 'card', width: 720 },
      { name: 'large', width: 1600 },
    ],
    adminThumbnail: 'thumb',
  },
}
