import type { Brand, Media, Series } from '@/payload-types'

import { getPayloadClient } from '../payload'
import { slugify } from '../slugify'

/**
 * Data technického listu jednoho tvaru řady. List se skládá z „výkresů“ (provedení) –
 * každý má ilustraci a vlastní sloupce kót; položka patří k výkresu, jehož kóty má vyplněné.
 */
export type SheetRow = { code: string; name: string; dimension: string; thread: string; values: Record<string, string> }
export type SheetBlock = { illustration: Media | null; columns: string[]; rows: SheetRow[] }
export type TechSheetData = {
  series: Series
  brand: Brand | null
  shape: { code: string; label: string; description?: string | null }
  blocks: SheetBlock[]
  hasThread: boolean
  updatedAt: string
}

const parseColumns = (s: string) =>
  s
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

const fmtNumber = (n: number | null | undefined) => (n == null ? '' : String(n).replace('.', ','))

export const shapeSlug = (code: string) => slugify(code) || 'tvar' // stejně jako urls.techSheet

export async function getTechSheet(seriesSlug: string, shapeParam: string): Promise<TechSheetData | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'series', where: { slug: { equals: seriesSlug } }, depth: 2, limit: 1 })
  const series = docs[0]
  const shape = series?.shapes?.find((s) => shapeSlug(s.code) === shapeParam)
  if (!series || !shape?.sheets?.length) return null

  const products = await payload.find({
    collection: 'products',
    where: { and: [{ isPublished: { equals: true } }, { series: { equals: series.id } }, { shape: { equals: shape.code } }] },
    select: { code: true, name: true, dimension: true, thread: true, dimensions: true, updatedAt: true },
    sort: ['dimension', 'code'],
    depth: 0,
    limit: 500,
    overrideAccess: false,
  })

  const blocks: SheetBlock[] = shape.sheets.map((s) => ({
    illustration: typeof s.illustration === 'object' ? s.illustration : null,
    columns: parseColumns(s.columns),
    rows: [],
  }))
  let updatedAt = series.updatedAt
  for (const p of products.docs) {
    const values = Object.fromEntries((p.dimensions ?? []).map((d) => [d.label.trim(), d.value.trim()]))
    const keys = Object.keys(values)
    if (!keys.length) continue // bez kót do listu nepatří
    // výkres s největší shodou kót (při shodě první)
    const score = (b: SheetBlock) => b.columns.filter((c) => c in values).length - b.columns.filter((c) => !(c in values)).length
    const best = blocks.reduce((a, b) => (score(b) > score(a) ? b : a))
    best.rows.push({ code: p.code, name: p.name, dimension: fmtNumber(p.dimension), thread: p.thread ?? '', values })
    if (p.updatedAt > updatedAt) updatedAt = p.updatedAt
  }
  const filled = blocks.filter((b) => b.rows.length)
  if (!filled.length) return null
  return {
    series,
    brand: typeof series.brand === 'object' ? series.brand : null,
    shape: { code: shape.code, label: shape.label, description: shape.description },
    blocks: filled,
    hasThread: filled.some((b) => b.rows.some((r) => r.thread)),
    updatedAt,
  }
}

/** Tvary řady, pro které existuje technický list (má výkres) – pro odkazy na webu. */
export const shapesWithSheet = (series: Pick<Series, 'shapes'>) =>
  new Set((series.shapes ?? []).filter((s) => s.sheets?.length).map((s) => s.code))
