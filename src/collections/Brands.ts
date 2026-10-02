import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access/roles'
import { slugField } from '@/fields/slug'

export const Brands: CollectionConfig = {
  slug: 'brands',
  labels: { singular: 'Značka', plural: 'Značky' },
  admin: {
    group: 'Obsah',
    useAsTitle: 'name',
    defaultColumns: ['name', 'manufacturer', 'order'],
    description: 'Zastoupení výrobci. Divize značky se odvozují z jejích řad.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', label: 'Název', type: 'text', required: true },
    slugField('name'),
    { name: 'order', label: 'Pořadí', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    { name: 'manufacturer', label: 'Výrobce', type: 'text', admin: { description: 'např. Valvosanitaria Bugatti S.p.A.' } },
    { name: 'description', label: 'Popis', type: 'textarea', required: true },
    { name: 'logo', label: 'Logo', type: 'upload', relationTo: 'media' },
    { name: 'website', label: 'Web výrobce', type: 'text' },
    {
      name: 'series',
      label: 'Řady',
      type: 'join',
      collection: 'series',
      on: 'brand',
      admin: { defaultColumns: ['name', 'division'] },
    },
  ],
}
