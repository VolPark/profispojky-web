import type { TextField } from 'payload'

import { adminsField } from '@/access/roles'

/**
 * Původní adresa souboru na starém webu profispojky.cz – podle ní se pozná, co už bylo
 * převzato (opakovaný import nic nezduplikuje), a vede na ni mapa přesměrování 301.
 */
export const sourceUrlField: TextField = {
  name: 'sourceUrl',
  label: 'Převzato ze starého webu',
  type: 'text',
  index: true,
  access: { create: adminsField, update: adminsField },
  admin: { position: 'sidebar', readOnly: true, condition: (data) => Boolean(data?.sourceUrl) },
}
