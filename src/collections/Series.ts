import type { CollectionConfig } from 'payload'

import { admins, anyone, catalogStaff, hiddenUnlessCatalog } from '@/access/roles'
import { slugField } from '@/fields/slug'

export const Series: CollectionConfig = {
  slug: 'series',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  // Historie změn – každou úpravu lze vrátit (záložka Verze v adminu).
  versions: { maxPerDoc: 20 },
  labels: { singular: 'Řada', plural: 'Řady' },
  admin: {
    group: 'Katalog',
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'division', 'bcCode'],
    description: 'Popis řady a společné parametry (PN, těsnění, normy) se vyplňují jednou za celou řadu.',
    hidden: hiddenUnlessCatalog,
  },
  defaultSort: 'order',
  access: { read: anyone, create: catalogStaff, update: catalogStaff, delete: admins },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', label: 'Název řady', type: 'text', required: true },
        {
          name: 'bcCode',
          label: 'Kód řady v BC',
          type: 'text',
          index: true,
          admin: { description: 'Podle tohoto kódu import přiřadí nové položky k řadě.' },
        },
      ],
    },
    slugField('name', { lockForNonAdmins: true }),
    { name: 'order', label: 'Pořadí v divizi', type: 'number', defaultValue: 10, admin: { position: 'sidebar' } },
    {
      type: 'row',
      fields: [
        { name: 'division', label: 'Divize', type: 'relationship', relationTo: 'divisions', required: true },
        { name: 'brand', label: 'Značka', type: 'relationship', relationTo: 'brands', required: true },
      ],
    },
    {
      name: 'summary',
      label: 'Krátký popis',
      type: 'text',
      required: true,
      admin: { description: 'Zobrazí se v seznamu řad, např. „Svěrné spojky pro PE trubky 20–110 mm · voda, plyn“.' },
    },
    {
      name: 'title',
      label: 'Nadpis stránky řady',
      type: 'text',
      admin: { description: 'např. „Valvopat – mosazné svěrné spojky pro PE trubky 20–110 mm“. Když chybí, použije se název.' },
    },
    { name: 'lead', label: 'Úvodní věta', type: 'textarea' },
    { name: 'description', label: 'Popis řady', type: 'richText' },
    { name: 'media', label: 'Média (štítek)', type: 'text', admin: { description: 'např. „Voda · Plyn“' } },
    { name: 'image', label: 'Obrázek řady', type: 'upload', relationTo: 'media' },
    {
      type: 'collapsible',
      label: 'Společné parametry řady',
      fields: [
        {
          name: 'commonParams',
          label: 'Parametry',
          labels: { singular: 'Parametr', plural: 'Parametry' },
          type: 'array',
          admin: {
            description:
              'Platí pro všechny položky řady – PN, těsnění, normy, médium, teplota, materiál… Zvýrazněné se ukážou v souhrnu u produktu.',
          },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'label', label: 'Parametr', type: 'text', required: true },
                { name: 'value', label: 'Hodnota', type: 'text', required: true },
                { name: 'highlight', label: 'Zvýraznit', type: 'checkbox', defaultValue: false },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Nastavení katalogu a filtrů',
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'dimensionLabel', label: 'Popisek rozměru', type: 'text', defaultValue: 'Rozměr PE trubky' },
            { name: 'dimensionUnit', label: 'Jednotka rozměru', type: 'text', defaultValue: 'mm' },
            { name: 'threadLabel', label: 'Popisek závitu', type: 'text', defaultValue: 'Závit' },
          ],
        },
        {
          name: 'shapes',
          label: 'Tvary',
          labels: { singular: 'Tvar', plural: 'Tvary' },
          type: 'array',
          admin: { description: 'Číselník tvarů pro filtr, např. A = vnější závit.' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'code', label: 'Kód', type: 'text', required: true },
                { name: 'label', label: 'Krátký název', type: 'text', required: true },
                { name: 'description', label: 'Dlouhý popis', type: 'text' },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'products',
      label: 'Položky řady',
      type: 'join',
      collection: 'products',
      on: 'series',
      admin: { defaultColumns: ['code', 'name', 'isPublished'] },
    },
    {
      name: 'documents',
      label: 'Dokumenty',
      type: 'join',
      collection: 'documents',
      on: 'series',
    },
  ],
}
