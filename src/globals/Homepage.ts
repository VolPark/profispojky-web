import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access/roles'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  versions: { max: 20 },
  label: 'Úvodní stránka',
  admin: { group: 'Obsah' },
  access: { read: anyone, update: staff },
  fields: [
    {
      type: 'collapsible',
      label: 'Hlavní blok',
      fields: [
        { name: 'eyebrow', label: 'Nadtitulek', type: 'text' },
        {
          name: 'title',
          label: 'Nadpis',
          type: 'text',
          required: true,
          admin: { description: 'Část nadpisu v *hvězdičkách* se zvýrazní barvou, např. „Spojky a armatury pro *vodu, plyn a topení*“.' },
        },
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
          admin: { description: 'Nepoužívá se – pás produktů pod úvodem se skládá z fotek řad.' },
        },
        { name: 'featuredSeries', label: 'Zvýrazněná řada', type: 'relationship', relationTo: 'series' },
        { name: 'featuredText', label: 'Text u zvýrazněné řady', type: 'text' },
      ],
    },
    {
      type: 'collapsible',
      label: 'Kdo jsme (blok s fotkou)',
      fields: [
        {
          name: 'storyImage',
          label: 'Fotka',
          type: 'upload',
          relationTo: 'media',
          admin: { description: 'Fotka firmy – sklad, stánek na veletrhu, tým. Na šířku.' },
        },
        {
          name: 'pillars',
          label: 'Co děláme',
          labels: { singular: 'Bod', plural: 'Body' },
          type: 'array',
          maxRows: 4,
          fields: [
            { name: 'title', label: 'Nadpis', type: 'text', required: true },
            { name: 'text', label: 'Text', type: 'textarea', required: true },
          ],
        },
      ],
    },
    {
      name: 'usps',
      label: 'Výhody (nepoužívá se – nahradil je blok Kdo jsme)',
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
