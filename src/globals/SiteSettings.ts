import type { GlobalConfig } from 'payload'

import { anyone, staff } from '@/access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  versions: { max: 20 },
  label: 'Kontaktní údaje a patička',
  admin: { group: 'Nastavení' },
  access: { read: anyone, update: staff },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'phone', label: 'Hlavní telefon', type: 'text', required: true, defaultValue: '+420 274 776 066' },
        { name: 'phone2', label: 'Druhý telefon', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'email', label: 'E-mail pro objednávky', type: 'email', required: true, defaultValue: 'objednavky@profispojky.cz' },
        { name: 'email2', label: 'Obecný e-mail', type: 'email' },
      ],
    },
    { name: 'hours', label: 'Provozní doba', type: 'text', defaultValue: 'Po–Pá 8:00–15:30' },
    {
      type: 'row',
      fields: [
        { name: 'warehouseStreet', label: 'Sklad – ulice', type: 'text', defaultValue: 'Krajní 801' },
        { name: 'warehouseCity', label: 'Sklad – PSČ a obec', type: 'text', defaultValue: '252 42 Jesenice' },
      ],
    },
    { name: 'companyName', label: 'Obchodní firma', type: 'text', defaultValue: 'PROFI SPOJKY s.r.o.' },
    { name: 'seat', label: 'Sídlo', type: 'text', defaultValue: 'Hostivařská 497/34, 102 00 Praha 10 – Hostivař' },
    {
      type: 'row',
      fields: [
        { name: 'ico', label: 'IČ', type: 'text', defaultValue: '21111651' },
        { name: 'dic', label: 'DIČ', type: 'text', defaultValue: 'CZ21111651' },
      ],
    },
    { name: 'registry', label: 'Zápis v OR', type: 'text' },
    {
      name: 'footerLinks',
      label: 'Odkazy v patičce dole',
      type: 'array',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', label: 'Text', type: 'text', required: true },
            { name: 'url', label: 'Adresa', type: 'text', required: true },
          ],
        },
      ],
    },
  ],
}
