import type { TextField } from 'payload'

import { slugify } from '@/lib/slugify'

/** Slug pro URL – pokud ho redaktor nevyplní, vygeneruje se z `sourceField`. */
export const slugField = (
  sourceField = 'name',
  overrides: Pick<Partial<TextField>, 'validate' | 'admin'> = {},
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
    ...overrides,
  }) as TextField
