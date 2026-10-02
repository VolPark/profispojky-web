import type { CollectionConfig } from 'payload'

import { anyone, staff } from '@/access/roles'
import { slugField } from '@/fields/slug'

export const Divisions: CollectionConfig = {
  slug: 'divisions',
  labels: { singular: 'Divize', plural: 'Divize' },
  admin: {
    group: 'Obsah',
    useAsTitle: 'name',
    defaultColumns: ['name', 'status', 'order'],
    description: 'Produktové divize podle materiálu. Novou divizi můžete založit sami.',
  },
  defaultSort: 'order',
  access: { read: anyone, create: staff, update: staff, delete: staff },
  fields: [
    { name: 'name', label: 'Název', type: 'text', required: true },
    slugField('name'),
    {
      name: 'status',
      label: 'Stav',
      type: 'select',
      defaultValue: 'active',
      options: [
        { label: 'Aktivní', value: 'active' },
        { label: 'Připravujeme (karta bez odkazu)', value: 'upcoming' },
        { label: 'Skrytá', value: 'hidden' },
      ],
      admin: { position: 'sidebar' },
    },
    {
      name: 'order',
      label: 'Pořadí',
      type: 'number',
      defaultValue: 10,
      admin: { position: 'sidebar' },
    },
    {
      name: 'perex',
      label: 'Perex',
      type: 'textarea',
      required: true,
      admin: { description: 'Jedna až dvě věty – zobrazí se na kartě divize a pod nadpisem.' },
    },
    { name: 'image', label: 'Hlavní obrázek', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Text divize', type: 'richText' },
    {
      name: 'catalogDocument',
      label: 'Katalog divize (PDF)',
      type: 'relationship',
      relationTo: 'documents',
    },
  ],
}
