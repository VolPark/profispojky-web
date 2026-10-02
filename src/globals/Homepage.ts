import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access/roles'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: 'Úvodní stránka',
  admin: { group: 'Obsah' },
  access: { read: anyone, update: staff },
  fields: [
    {
      type: 'collapsible',
      label: 'Hlavní blok',
      fields: [
        { name: 'eyebrow', label: 'Nadtitulek', type: 'text' },
        { name: 'title', label: 'Nadpis', type: 'text', required: true },
        { name: 'lead', label: 'Úvodní text', type: 'textarea' },
        {
          name: 'stats',
          label: 'Čísla',
          type: 'array',
          maxRows: 4,
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'value', label: 'Číslo', type: 'text', required: true },
                { name: 'label', label: 'Popis', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          name: 'heroImages',
          label: 'Fotky v hlavním bloku',
          type: 'upload',
          relationTo: 'media',
          hasMany: true,
          maxRows: 3,
        },
        { name: 'featuredSeries', label: 'Zvýrazněná řada', type: 'relationship', relationTo: 'series' },
        { name: 'featuredText', label: 'Text u zvýrazněné řady', type: 'text' },
      ],
    },
    {
      name: 'usps',
      label: 'Výhody (pruh pod divizemi)',
      type: 'array',
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'icon',
              label: 'Ikona',
              type: 'select',
              defaultValue: 'check',
              options: ['clock', 'file', 'pin', 'tool', 'check', 'phone', 'box'].map((v) => ({ label: v, value: v })),
            },
            { name: 'text', label: 'Text', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
