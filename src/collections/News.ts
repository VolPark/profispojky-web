import type { CollectionConfig, Where } from 'payload'

import { staff } from '@/access/roles'
import { adminOnlyPermanentDelete } from '@/hooks/adminOnlyPermanentDelete'
import { slugField } from '@/fields/slug'
import { NEWS_CATEGORIES } from '@/lib/news'
import { previewUrl } from '@/lib/preview'

export const News: CollectionConfig = {
  slug: 'news',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  hooks: { beforeDelete: [adminOnlyPermanentDelete] },
  labels: { singular: 'Aktualita', plural: 'Aktuality' },
  admin: {
    group: 'Obsah',
    useAsTitle: 'title',
    defaultColumns: ['title', 'publishedAt', 'state', 'category'],
    description:
      'Koncept = rozpracováno. Publikováno s datem v budoucnu = Naplánováno – na webu se objeví v daný den a hodinu.',
    preview: (doc) => previewUrl(`/aktuality/${doc.slug as string}`),
  },
  defaultSort: '-publishedAt',
  versions: { drafts: { autosave: { interval: 2000 } }, maxPerDoc: 30 },
  access: {
    // Veřejnost vidí jen publikované a ty, jejichž datum už nastalo.
    read: ({ req }) =>
      req.user
        ? true
        : ({
            and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }],
          } as Where),
    create: staff,
    update: staff,
    delete: staff,
  },
  fields: [
    { name: 'title', label: 'Titulek', type: 'text', required: true },
    slugField('title'),
    {
      name: 'publishedAt',
      label: 'Datum publikace',
      type: 'date',
      required: true,
      index: true,
      defaultValue: () => new Date().toISOString(),
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayAndTime', displayFormat: 'd. M. yyyy HH:mm' },
        description: 'Datum v budoucnu = článek se zveřejní automaticky v tento čas.',
      },
    },
    {
      name: 'state',
      label: 'Stav',
      type: 'text',
      virtual: true,
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        afterRead: [
          ({ siblingData }) => {
            if (siblingData?._status !== 'published') return 'Koncept'
            const at = siblingData?.publishedAt ? new Date(siblingData.publishedAt as string) : null
            return at && at.getTime() > Date.now() ? 'Naplánováno' : 'Publikováno'
          },
        ],
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'category', label: 'Štítek', type: 'select', options: NEWS_CATEGORIES, defaultValue: 'novinka' },
        { name: 'division', label: 'Divize', type: 'relationship', relationTo: 'divisions' },
      ],
    },
    { name: 'perex', label: 'Perex', type: 'textarea', required: true, admin: { description: '1–2 věty do výpisu a na úvodní stránku.' } },
    { name: 'image', label: 'Obrázek', type: 'upload', relationTo: 'media' },
    { name: 'body', label: 'Text', type: 'richText' },
    {
      name: 'attachments',
      label: 'Přílohy',
      type: 'relationship',
      relationTo: 'documents',
      hasMany: true,
      admin: { description: 'např. fotoreport nebo leták v PDF' },
    },
  ],
}
