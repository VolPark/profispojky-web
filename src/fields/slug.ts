import type { TextField } from 'payload'

import { adminsField } from '@/access/roles'

import { slugify } from '@/lib/slugify'

/** Slug pro URL – pokud ho redaktor nevyplní, vygeneruje se z `sourceField`. */
export const slugField = (
  sourceField = 'name',
  overrides: Pick<Partial<TextField>, 'validate' | 'admin'> & {
    /** Adresu existující stránky smí měnit jen Admin – změna rozbije odkazy a SEO. */
    lockForNonAdmins?: boolean
  } = {},
): TextField =>
  ({
    name: 'slug',
    label: 'Adresa (slug)',
    type: 'text',
    index: true,
    unique: true,
    admin: {
      position: 'sidebar',
      description: 'Část URL. Když necháte prázdné, vytvoří se z názvu.',
    },
    hooks: {
      beforeValidate: [
        ({ value, data }) => {
          if (typeof value === 'string' && value.trim()) return slugify(value)
          const source = data?.[sourceField]
          return typeof source === 'string' ? slugify(source) : value
        },
      ],
    },
    ...(overrides.lockForNonAdmins ? { access: { update: adminsField } } : {}),
    ...(overrides.validate ? { validate: overrides.validate } : {}),
    ...(overrides.admin ? { admin: overrides.admin } : {}),
  }) as TextField
