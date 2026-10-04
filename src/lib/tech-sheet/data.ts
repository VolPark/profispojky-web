import type { Brand, Media, Series } from '@/payload-types'

import { getPayloadClient } from '../payload'
import { slugify } from '../slugify'

/**
 * Data technického listu jednoho tvaru řady. Stejná struktura pro všechny typy produktů;
 * hodnoty jen z atributů položky (pole „Kóty a rozměry“, cíl: atributy z BC):
 * - parametry: parametry řady + atributy, které mají všechny položky listu stejné,
 * - tabulka: katalogové číslo → identifikace (ostatní atributy) → kóty dle výkresu (písmena u výkresu).
 * List se skládá z „výkresů“ (provedení); položka patří k výkresu, jehož kóty má vyplněné.
 */
/** Obvyklé identifikační atributy – v tabulce jdou první v tomto pořadí, ostatní za nimi. */
export const IDENT_ORDER = ['DN', 'Rozměr trubky', 'Síla stěny trubky', 'Závit', 'Závit odbočky', 'PN']

export type SheetRow = { code: string; name: string; values: Record<string, string> }
export type SheetBlock = { illustration: Media | null; columns: string[]; note?: string | null; ident: string[]; rows: SheetRow[] }
export type TechSheetData = {
  series: Series
  brand: Brand | null
  shape: { code: string; label: string; description?: string | null }
  common: { label: string; value: string }[]
  blocks: SheetBlock[]
  updatedAt: string
}

const parseColumns = (s: string) =>
  s
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

export const shapeSlug = (code: string) => slugify(code) || 'tvar' // stejně jako urls.techSheet

export async function getTechSheet(seriesSlug: string, shapeParam: string): Promise<TechSheetData | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'series', where: { slug: { equals: seriesSlug } }, depth: 2, limit: 1 })
  const series = docs[0]
  const shape = series?.shapes?.find((s) => shapeSlug(s.code) === shapeParam)
  if (!series || !shape) return null

  const products = await payload.find({
    collection: 'products',
    where: { and: [{ isPublished: { equals: true } }, { series: { equals: series.id } }, { shape: { equals: shape.code } }] },
    select: { code: true, name: true, dimensions: true, techSheetIllustration: true, updatedAt: true },
    sort: ['dimension', 'code'],
    depth: 1,
    limit: 500,
    overrideAccess: false,
  })

  // Výchozí výkresy tvaru; položka s vlastním výkresem tvoří vlastní blok (sloupce podle nejbližšího výkresu tvaru).
  const shapeBlocks: SheetBlock[] = (shape.sheets ?? []).map((s) => ({
    illustration: typeof s.illustration === 'object' ? s.illustration : null,
    columns: parseColumns(s.columns ?? ''),
    note: s.note,
    ident: [],
    rows: [],
  }))
  const ownBlocks = new Map<number, SheetBlock>()
  let updatedAt = series.updatedAt
  for (const p of products.docs) {
    const values = Object.fromEntries((p.dimensions ?? []).map((d) => [d.label.trim(), d.value.trim()]))
    const keys = Object.keys(values)
    if (!keys.length) continue // bez atributů do listu nepatří
    // výkres s největší shodou kót (při shodě první)
    const score = (b: SheetBlock) => b.columns.filter((c) => c in values).length - b.columns.filter((c) => !(c in values)).length
    const best = shapeBlocks.length ? shapeBlocks.reduce((a, b) => (score(b) > score(a) ? b : a)) : null
    const own = typeof p.techSheetIllustration === 'object' ? p.techSheetIllustration : null
    let block = best
    if (own) {
      if (!ownBlocks.has(own.id)) ownBlocks.set(own.id, { illustration: own, columns: best?.columns ?? keys, note: best?.note, ident: [], rows: [] })
      block = ownBlocks.get(own.id)!
      if (own.updatedAt > updatedAt) updatedAt = own.updatedAt
    }
    if (!block) continue // tvar bez výkresu a položka bez vlastního
    block.rows.push({ code: p.code, name: p.name, values })
    if (p.updatedAt > updatedAt) updatedAt = p.updatedAt
  }
  const blocks = [...shapeBlocks, ...ownBlocks.values()]
  const filled = blocks.filter((b) => b.rows.length)
  if (!filled.length) return null
  // řazení podle DN, když ho položky mají (katalogový rozměr bývá nevyplněný); jinak pořadí z dotazu (rozměr, kód)
  const dn = (r: SheetRow) => parseFloat((r.values.DN ?? '').replace(',', '.'))
  for (const b of filled) b.rows.sort((a, c) => (isNaN(dn(a)) || isNaN(dn(c)) ? 0 : dn(a) - dn(c)))
  // Atributy stejné u všech položek listu (aspoň 2) → do parametrů; ostatní mimo kóty → identifikace.
  const rows = filled.flatMap((b) => b.rows)
  const labels = [...new Set(rows.flatMap((r) => Object.keys(r.values)))]
  const kotas = new Set(filled.flatMap((b) => b.columns))
  const common =
    rows.length < 2
      ? []
      : labels
          .filter((l) => !kotas.has(l) && rows.every((r) => r.values[l] === rows[0].values[l]))
          .map((l) => ({ label: l, value: rows[0].values[l] }))
  const commonSet = new Set(common.map((c) => c.label))
  const rank = (l: string) => (IDENT_ORDER.includes(l) ? IDENT_ORDER.indexOf(l) : IDENT_ORDER.length + labels.indexOf(l))
  for (const b of filled) {
    b.ident = labels
      .filter((l) => !kotas.has(l) && !commonSet.has(l) && b.rows.some((r) => r.values[l]))
      .sort((a, c) => rank(a) - rank(c))
  }
  return {
    series,
    brand: typeof series.brand === 'object' ? series.brand : null,
    shape: { code: shape.code, label: shape.label, description: shape.description },
    common,
    blocks: filled,
    updatedAt,
  }
}
