import { ValidationError, type CollectionConfig } from 'payload'

import { anyone, catalogStaff, hiddenUnlessCatalog } from '@/access/roles'
import { sourceUrlField } from '@/fields/sourceUrl'
import { isLegacySiteUrl } from '@/lib/video'
import { adminOnlyPermanentDelete } from '@/hooks/adminOnlyPermanentDelete'
import { EXPIRY_LABELS, expiryState } from '@/lib/doc-expiry'
import { DOC_TYPES } from '@/lib/doc-types'

export const Documents: CollectionConfig = {
  slug: 'documents',
  // Smazané jde do koše a dá se obnovit (admin → Koš, nebo přes MCP).
  trash: true,
  // Historie změn – každou úpravu lze vrátit (záložka Verze v adminu).
  versions: { maxPerDoc: 20 },
  labels: { singular: 'Dokument', plural: 'Knihovna dokumentů' },
  admin: {
    group: 'Katalog',
    useAsTitle: 'title',
    defaultColumns: ['title', 'type', 'validUntil', 'expiry', 'showInLibrary'],
    description:
      'Technické listy, certifikáty, prohlášení o shodě, návody a videa. Přiřaďte je k řadám nebo produktům – zobrazí se u nich na webu.',
    hidden: hiddenUnlessCatalog,
  },
  defaultSort: '-issuedAt',
  access: { read: anyone, create: catalogStaff, update: catalogStaff, delete: catalogStaff },
  upload: {
    filesRequiredOnCreate: false,
    mimeTypes: ['application/pdf', 'image/*', 'application/zip', 'application/vnd.openxmlformats-officedocument.*'],
  },
  hooks: {
    beforeDelete: [adminOnlyPermanentDelete],
    beforeValidate: [
      ({ data, req, originalDoc }) => {
        const hasFile = Boolean(req.file || originalDoc?.filename || data?.filename)
        if (!hasFile && !data?.externalUrl) {
          throw new Error('Nahrajte soubor, nebo vyplňte odkaz (u videa).')
        }
        // Kontroluje se jen nově zadaný odkaz z administrace (seed a převod ze starého webu běží bez uživatele).
        if (req.user && data?.externalUrl !== originalDoc?.externalUrl && isLegacySiteUrl(data?.externalUrl)) {
          throw new ValidationError({
            errors: [
              {
                path: 'externalUrl',
                message: 'Odkaz vede na starý web profispojky.cz, který tento web nahradí – soubor místo toho nahrajte.',
              },
            ],
          })
        }
        return data
      },
    ],
  },
  fields: [
    { name: 'title', label: 'Název', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'type', label: 'Typ', type: 'select', required: true, options: DOC_TYPES.map(({ value, label }) => ({ value, label })) },
        { name: 'edition', label: 'Vydání', type: 'text', admin: { description: 'např. 2026/03' } },
      ],
    },
    {
      name: 'externalUrl',
      label: 'Odkaz',
      type: 'text',
      admin: { description: 'Pro videa (YouTube…) nebo dokument uložený jinde. U nahraného souboru nechte prázdné.' },
    },
    {
      type: 'row',
      fields: [
        { name: 'issuedAt', label: 'Vydáno', type: 'date', admin: { date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' } } },
        {
          name: 'validUntil',
          label: 'Platné do',
          type: 'date',
          index: true,
          admin: {
            date: { pickerAppearance: 'dayOnly', displayFormat: 'd. M. yyyy' },
            description: 'U certifikátů – 60 dní před koncem platnosti se dokument objeví v upozornění na nástěnce.',
          },
        },
      ],
    },
    {
      name: 'expiry',
      label: 'Platnost',
      type: 'text',
      virtual: true,
      admin: { readOnly: true, hidden: false },
      hooks: {
        afterRead: [({ siblingData }) => EXPIRY_LABELS[expiryState(siblingData?.validUntil)]],
      },
    },
    {
      type: 'collapsible',
      label: 'Přiřazení',
      fields: [
        { name: 'series', label: 'Řady', type: 'relationship', relationTo: 'series', hasMany: true, index: true },
        { name: 'products', label: 'Produkty', type: 'relationship', relationTo: 'products', hasMany: true, index: true },
        {
          type: 'row',
          fields: [
            { name: 'divisions', label: 'Divize', type: 'relationship', relationTo: 'divisions', hasMany: true, admin: { description: 'Prázdné = všechny divize' } },
            { name: 'brands', label: 'Značky', type: 'relationship', relationTo: 'brands', hasMany: true },
          ],
        },
      ],
    },
    {
      name: 'showInLibrary',
      label: 'Zobrazit v Knihovně médií',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    sourceUrlField,
    {
      name: 'featured',
      label: 'Hlavní katalog (zvýraznit nahoře)',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar' },
    },
  ],
}
