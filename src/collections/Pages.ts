import type { CollectionConfig } from 'payload'

import { admins, staff } from '@/access/roles'
import { slugField } from '@/fields/slug'
import { previewUrl } from '@/lib/preview'

/** Rezervované adresy – obsluhují je vlastní stránky webu. */
const RESERVED = ['produkty', 'divize', 'katalog', 'produkt', 'znacky', 'knihovna', 'prodejni-sit', 'aktuality', 'kontakt', 'admin', 'api', 'next']

export const Pages: CollectionConfig = {
  slug: 'pages',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  labels: { singular: 'Stránka', plural: 'Stránky' },
  admin: {
    group: 'Obsah',
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', '_status'],
    description: 'Textové stránky – O firmě, Pro partnery, obchodní podmínky, ochrana osobních údajů…',
    preview: (doc) => previewUrl(`/${doc.slug as string}`),
  },
  versions: { drafts: true, maxPerDoc: 20 },
  access: {
    read: ({ req }) => (req.user ? true : { _status: { equals: 'published' } }),
    create: staff,
    update: staff,
    delete: admins,
  },
  fields: [
    { name: 'title', label: 'Nadpis', type: 'text', required: true },
    slugField('title', {
      lockForNonAdmins: true,
      validate: (value: string | null | undefined) =>
        value && RESERVED.includes(value) ? `Adresa „${value}“ je vyhrazená pro jinou část webu.` : true,
    }),
    { name: 'eyebrow', label: 'Nadtitulek', type: 'text' },
    { name: 'lead', label: 'Úvodní text', type: 'textarea' },
    {
      name: 'layout',
      label: 'Obsah stránky',
      type: 'blocks',
      blocks: [
        {
          slug: 'content',
          labels: { singular: 'Text', plural: 'Texty' },
          fields: [
            { name: 'text', label: 'Text', type: 'richText', required: true },
            { name: 'image', label: 'Obrázek vedle textu', type: 'upload', relationTo: 'media' },
            { name: 'caption', label: 'Popisek obrázku', type: 'text' },
          ],
        },
        {
          slug: 'cards',
          labels: { singular: 'Karty', plural: 'Karty' },
          fields: [
            {
              name: 'items',
              label: 'Karty',
              type: 'array',
              minRows: 1,
              fields: [
                { name: 'title', label: 'Nadpis', type: 'text', required: true },
                { name: 'text', label: 'Text', type: 'textarea', required: true },
              ],
            },
          ],
        },
        {
          slug: 'gallery',
          labels: { singular: 'Galerie', plural: 'Galerie' },
          fields: [{ name: 'images', label: 'Obrázky', type: 'upload', relationTo: 'media', hasMany: true, required: true }],
        },
      ],
    },
  ],
}
