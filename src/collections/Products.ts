import type { CollectionConfig, FieldAccess } from 'payload'

import { admins, adminsField, catalogStaff, hiddenUnlessCatalog, isStaffUser } from '@/access/roles'
import { adminOnlyPermanentDelete } from '@/hooks/adminOnlyPermanentDelete'
import { computeProductStatus, MISSING_LABELS } from '@/lib/product-status'

const bcReadOnly = { readOnly: true }
const bcFieldAccess: { create: FieldAccess; update: FieldAccess } = { create: adminsField, update: adminsField }

export const Products: CollectionConfig = {
  slug: 'products',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  // Historie změn – každou úpravu lze vrátit (záložka Verze v adminu).
  versions: { maxPerDoc: 20 },
  labels: { singular: 'Produkt', plural: 'Produkty' },
  admin: {
    group: 'Katalog',
    useAsTitle: 'name',
    defaultColumns: ['code', 'name', 'series', 'bcStatus', 'isPublished', 'missing'],
    listSearchableFields: ['code', 'name', 'ean'],
    description:
      'Kód, název, EAN, MJ a stav přicházejí z importu z BC a nelze je měnit. Fotky, parametry a dokumenty doplňujete zde.',
    hidden: hiddenUnlessCatalog,
    pagination: { defaultLimit: 50 },
  },
  defaultSort: 'code',
  access: {
    read: ({ req }) => (isStaffUser(req.user) ? true : { isPublished: { equals: true } }),
    create: admins,
    update: catalogStaff,
    delete: catalogStaff,
  },
  hooks: {
    beforeDelete: [adminOnlyPermanentDelete],
    beforeChange: [
      ({ data, originalDoc }) => {
        const merged = { ...originalDoc, ...data }
        const { missing, contentComplete, isPublished } = computeProductStatus(merged)
        return { ...data, missing, contentComplete, isPublished }
      },
    ],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Obsah na webu',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'code', label: 'Kód (BC)', type: 'text', required: true, unique: true, index: true, admin: bcReadOnly, access: bcFieldAccess },
                { name: 'name', label: 'Název (BC)', type: 'text', required: true, admin: bcReadOnly, access: bcFieldAccess },
              ],
            },
            {
              name: 'subtitle',
              label: 'Popis položky',
              type: 'text',
              admin: { description: 'např. „Spojka s vnějším závitem“' },
            },
            {
              name: 'description',
              label: 'Popis produktu',
              type: 'textarea',
              admin: { description: 'Delší text na stránce položky. Odstavce oddělte prázdným řádkem.' },
            },
            { name: 'series', label: 'Řada', type: 'relationship', relationTo: 'series', index: true },
            {
              name: 'images',
              label: 'Fotky',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'První fotka je hlavní.' },
            },
            {
              type: 'row',
              fields: [
                { name: 'shape', label: 'Tvar (kód)', type: 'text', index: true, admin: { description: 'Kód z číselníku tvarů řady, např. A, O, IM.' } },
                { name: 'dimension', label: 'Rozměr', type: 'number', index: true, admin: { description: 'Číslo v jednotkách řady, např. 32 (mm).' } },
                { name: 'thread', label: 'Závit', type: 'text', admin: { description: 'např. 1/2"' } },
              ],
            },
            {
              name: 'productType',
              label: 'Typ výrobku',
              type: 'text',
              index: true,
              admin: {
                description:
                  'Pro rozcestník „Vyberte typ výrobku“ – typy se generují z hodnot tohoto pole (např. Svěrné spojky, Kulové kohouty).',
              },
            },
            {
              name: 'params',
              label: 'Další technické parametry',
              labels: { singular: 'Parametr', plural: 'Parametry' },
              type: 'array',
              admin: { description: 'Jen parametry specifické pro položku. Společné parametry se berou z řady. Prázdné se nezobrazí.' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Parametr', type: 'text', required: true },
                    { name: 'value', label: 'Hodnota', type: 'text', required: true },
                  ],
                },
              ],
            },
            {
              name: 'techSheetIllustration',
              label: 'Vlastní výkres pro technický list',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description:
                  'Jen když se položka liší od výkresu tvaru (Řada → Tvar → Technický list). Fotka + výkres s písmeny kót, JPG/PNG.',
              },
            },
            {
              name: 'dimensions',
              label: 'Kóty a rozměry',
              labels: { singular: 'Kóta', plural: 'Kóty' },
              type: 'array',
              admin: {
                description:
                  'Atributy pro technický list (PDF), cíl: z BC. Kóty = písmena z výkresu (A, B, Ch1, min…); ostatní (Rozměr trubky s jednotkou, Závit, PN, Pracovní rozsah…) jsou identifikace. Hodnoty stejné u všech položek tvaru se v listu ukážou jako parametry.',
                initCollapsed: true,
              },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'label', label: 'Kóta', type: 'text', required: true },
                    { name: 'value', label: 'Hodnota', type: 'text', required: true },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: 'Dokumenty',
          fields: [
            {
              name: 'documents',
              label: 'Dokumenty přiřazené k položce',
              type: 'join',
              collection: 'documents',
              on: 'products',
              admin: { description: 'Dokumenty přiřazujete v Knihovně dokumentů. U produktu se zobrazí i dokumenty jeho řady.' },
            },
          ],
        },
        {
          label: 'Data z BC',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'ean', label: 'EAN', type: 'text', admin: bcReadOnly, access: bcFieldAccess },
                { name: 'unit', label: 'MJ', type: 'text', admin: bcReadOnly, access: bcFieldAccess },
                { name: 'bcSeriesCode', label: 'Řada v BC', type: 'text', admin: bcReadOnly, access: bcFieldAccess },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bcStatus',
                  label: 'Stav v BC',
                  type: 'select',
                  defaultValue: 'active',
                  options: [
                    { label: 'Aktivní', value: 'active' },
                    { label: 'Výprodej', value: 'sale' },
                    { label: 'Neaktivní', value: 'inactive' },
                  ],
                  admin: bcReadOnly,
                  access: bcFieldAccess,
                },
                {
                  name: 'bcActive',
                  label: 'V posledním importu',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: { ...bcReadOnly, description: 'Položka, která v importu chyběla, se skryje (nesmaže).' },
                  access: bcFieldAccess,
                },
                { name: 'lastImportedAt', label: 'Naposledy v importu', type: 'date', admin: bcReadOnly, access: bcFieldAccess },
              ],
            },
          ],
        },
      ],
    },
    {
      name: 'showOnWeb',
      label: 'Zobrazit na webu',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
        description: 'Položka se zobrazí jen když má fotku, parametry a řadu a je aktivní v BC.',
      },
    },
    {
      name: 'isPublished',
      label: 'Na webu',
      type: 'checkbox',
      index: true,
      admin: { position: 'sidebar', readOnly: true },
    },
    { name: 'contentComplete', type: 'checkbox', index: true, admin: { hidden: true } },
    {
      name: 'missing',
      label: 'Chybí',
      type: 'select',
      hasMany: true,
      options: Object.entries(MISSING_LABELS).map(([value, label]) => ({ value, label })),
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
