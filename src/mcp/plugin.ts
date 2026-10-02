import { mcpPlugin } from '@payloadcms/plugin-mcp'
import type { PayloadRequest } from 'payload'
import { z } from 'zod'

import { admins, hiddenUnlessAdmin } from '@/access/roles'
import { EXPIRY_WARNING_DAYS } from '@/lib/doc-expiry'

const text = (value: unknown) => ({ content: [{ type: 'text' as const, text: JSON.stringify(value, null, 2) }] })

const all = { find: true, create: true, update: true, delete: true }
const noDelete = { find: true, create: true, update: true, delete: false }

/**
 * MCP server pro dodavatele (SEBIT) – Claude Code / Claude Cowork se připojí na /api/mcp
 * s API klíčem z administrace (Nastavení → MCP klíče, vidí jen Admin).
 * Redaktoři klienta používají běžný admin na /admin.
 */
export const mcp = mcpPlugin({
  userCollection: 'users',
  collections: {
    news: { enabled: all, description: 'Aktuality na webu. _status draft/published, publishedAt v budoucnu = naplánováno.' },
    pages: { enabled: all, description: 'Textové stránky (O firmě, Pro partnery, právní texty). Obsah v blocích `layout`.' },
    divisions: { enabled: noDelete, description: 'Produktové divize (Litina, Mosaz, Plast…).' },
    brands: { enabled: noDelete, description: 'Zastoupené značky / výrobci.' },
    series: { enabled: noDelete, description: 'Produktové řady – popis, společné parametry, číselník tvarů.' },
    products: {
      enabled: { find: true, create: false, update: true, delete: false },
      description:
        'Položky katalogu. code/name/ean/unit/bcStatus přicházejí z BC importu – neměnit. Doplňuj images, shape, dimension, thread, productType, params, series.',
    },
    documents: { enabled: noDelete, description: 'Knihovna dokumentů (technické listy, certifikáty, návody, videa).' },
    partners: { enabled: all, description: 'Prodejní síť – partneři podle krajů.' },
    contacts: { enabled: all, description: 'Kontaktní osoby.' },
    redirects: { enabled: all, description: '301 přesměrování ze starých URL.' },
    media: { enabled: { find: true, create: false, update: true, delete: false }, description: 'Obrázky (jen čtení a úprava alt textu).' },
    'bc-imports': { enabled: { find: true }, description: 'Historie importů z Business Central.' },
  },
  globals: {
    homepage: { enabled: true, description: 'Obsah úvodní stránky.' },
    'site-settings': { enabled: true, description: 'Kontaktní údaje a patička.' },
  },
  overrideApiKeyCollection: (collection) => ({
    ...collection,
    labels: { singular: 'MCP klíč', plural: 'MCP klíče' },
    admin: { ...collection.admin, group: 'Nastavení', hidden: hiddenUnlessAdmin },
    access: { ...collection.access, create: admins, read: admins, update: admins, delete: admins },
  }),
  mcp: {
    serverOptions: {
      serverInfo: { name: 'profispojky-web', version: '1.0.0' },
      instructions:
        'Správa webu PROFI SPOJKY (katalogový web bez e-shopu). Texty piš česky. Nevymýšlej technické parametry ani čísla – chybí-li vstup, zeptej se. Kmenová data položek (kód, název, EAN, MJ, stav) jsou z BC a nemění se ručně.',
    },
    tools: [
      {
        name: 'contentQueue',
        description: 'Fronta „Doplnit obsah“: položky z BC, kterým chybí fotka, parametry nebo řada (na webu se nezobrazují).',
        parameters: { missing: z.enum(['photo', 'params', 'series']).optional(), limit: z.number().int().min(1).max(500).optional() },
        handler: async (args: Record<string, unknown>, req: PayloadRequest) => {
          const res = await req.payload.find({
            collection: 'products',
            where: {
              and: [
                { contentComplete: { equals: false } },
                { bcActive: { not_equals: false } },
                ...(args.missing ? [{ missing: { in: [args.missing as string] } }] : []),
              ],
            },
            limit: (args.limit as number) ?? 100,
            depth: 0,
            select: { code: true, name: true, bcSeriesCode: true, series: true, missing: true },
            req,
            overrideAccess: false,
          })
          return text({ total: res.totalDocs, items: res.docs })
        },
      },
      {
        name: 'expiringDocuments',
        description: `Dokumenty (certifikáty…), jejichž platnost vyprší do ${EXPIRY_WARNING_DAYS} dnů nebo už vypršela.`,
        parameters: { days: z.number().int().min(1).max(730).optional() },
        handler: async (args: Record<string, unknown>, req: PayloadRequest) => {
          const days = (args.days as number) ?? EXPIRY_WARNING_DAYS
          const res = await req.payload.find({
            collection: 'documents',
            where: { validUntil: { less_than_equal: new Date(Date.now() + days * 864e5).toISOString() } },
            sort: 'validUntil',
            pagination: false,
            depth: 0,
            select: { title: true, type: true, validUntil: true, issuedAt: true },
            req,
            overrideAccess: false,
          })
          return text(res.docs)
        },
      },
      {
        name: 'catalogStats',
        description: 'Souhrn katalogu: počty položek publikovaných / ve frontě / skrytých a poslední import z BC.',
        parameters: {},
        handler: async (_args: Record<string, unknown>, req: PayloadRequest) => {
          const count = (where: Record<string, unknown>) =>
            req.payload.count({ collection: 'products', where: where as never, req, overrideAccess: false }).then((r) => r.totalDocs)
          const [total, published, queue, hidden, lastImport] = await Promise.all([
            count({}),
            count({ isPublished: { equals: true } }),
            count({ and: [{ contentComplete: { equals: false } }, { bcActive: { not_equals: false } }] }),
            count({ bcActive: { equals: false } }),
            req.payload.find({
              collection: 'bc-imports',
              sort: '-createdAt',
              limit: 1,
              depth: 0,
              select: { filename: true, status: true, summary: true, createdAt: true, confirmedAt: true },
              req,
              overrideAccess: false,
            }),
          ])
          return text({ total, published, queue, hiddenByBc: hidden, lastImport: lastImport.docs[0] ?? null })
        },
      },
    ],
  },
})
