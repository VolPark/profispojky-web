import type { Brand, Media, Series } from '@/payload-types'

import { getPayloadClient } from '../payload'
import { slugify } from '../slugify'

/**
 * Data technického listu tvaru řady nebo položky – list má každá zveřejněná položka (bez atributů jen
 * katalogové číslo, fotka a parametry řady). Stejná struktura pro všechny typy produktů;
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
  /** Kód položky, pro kterou je list vygenerován (zvýrazněný řádek). */
  highlight?: string
  updatedAt: string
}

const parseColumns = (s: string) =>
  s
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean)

export const shapeSlug = (code: string) => slugify(code) || 'tvar' // stejně jako urls.techSheet

type ProductDoc = {
  code: string
  name: string
  subtitle?: string | null
  dimensions?: { label: string; value: string }[] | null
  techSheetIllustration?: number | Media | null
  images?: (number | Media)[] | null
  updatedAt: string
}
type ShapeDoc = NonNullable<Series['shapes']>[number]

const PRODUCT_SELECT = { code: true, name: true, subtitle: true, dimensions: true, techSheetIllustration: true, images: true, updatedAt: true } as const

/** Technický list tvaru řady (celá rodina rozměrů). */
export async function getTechSheet(seriesSlug: string, shapeParam: string): Promise<TechSheetData | null> {
  const payload = await getPayloadClient()
  const { docs } = await payload.find({ collection: 'series', where: { slug: { equals: seriesSlug } }, depth: 2, limit: 1 })
  const series = docs[0]
  const shape = series?.shapes?.find((s) => shapeSlug(s.code) === shapeParam)
  if (!series || !shape) return null
  const products = await payload.find({
    collection: 'products',
    where: { and: [{ isPublished: { equals: true } }, { series: { equals: series.id } }, { shape: { equals: shape.code } }] },
    select: PRODUCT_SELECT,
    sort: ['dimension', 'code'],
    depth: 1,
    limit: 500,
    overrideAccess: false,
  })
  return buildSheet(series, shape, products.docs as ProductDoc[])
}

/**
 * Technický list konkrétní položky: položka v tvaru → list celého tvaru se zvýrazněnou položkou,
 * položka bez tvaru → list jen této položky.
 */
export async function getProductTechSheet(code: string): Promise<TechSheetData | null> {
  const payload = await getPayloadClient()
  const found = await payload.find({
    collection: 'products',
    where: { and: [{ isPublished: { equals: true } }, { code: { equals: code } }] },
    select: { ...PRODUCT_SELECT, series: true, shape: true },
    depth: 1,
    limit: 1,
    overrideAccess: false,
  })
  const product = found.docs[0]
  const seriesId = product && (typeof product.series === 'object' ? product.series?.id : product.series)
  if (!product || !seriesId) return null
  const series = await payload.findByID({ collection: 'series', id: seriesId, depth: 2 })
  const shape = product.shape ? series.shapes?.find((s) => s.code === product.shape) : undefined
  if (shape) {
    const data = await getTechSheet(series.slug!, shapeSlug(shape.code))
    return data ? { ...data, highlight: code } : null
  }
  // titulek jako nadpis položky na webu: „název – popis“
  const label = product.subtitle ? `${product.name} – ${product.subtitle.toLowerCase()}` : product.name
  return buildSheet(series, { code: '', label }, [product as ProductDoc], code)
}

const media = (v: number | Media | null | undefined) => (v && typeof v === 'object' ? v : null)

function buildSheet(series: Series, shape: Pick<ShapeDoc, 'code' | 'label' | 'description' | 'sheets'>, products: ProductDoc[], highlight?: string): TechSheetData | null {
  // Ilustrace: vlastní výkres položky → výkres tvaru (podle kót) → fotka položky.
  const shapeBlocks: SheetBlock[] = (shape.sheets ?? []).map((s) => ({
    illustration: media(s.illustration),
    columns: parseColumns(s.columns ?? ''),
    note: s.note,
    ident: [],
    rows: [],
  }))
  const ownBlocks = new Map<number, SheetBlock>()
  let photoBlock: SheetBlock | null = null
  let updatedAt = series.updatedAt
  for (const p of products) {
    const values = Object.fromEntries((p.dimensions ?? []).map((d) => [d.label.trim(), d.value.trim()]))
    // výkres s největší shodou kót (při shodě první)
    const score = (b: SheetBlock) => b.columns.filter((c) => c in values).length - b.columns.filter((c) => !(c in values)).length
    const best = shapeBlocks.length ? shapeBlocks.reduce((a, b) => (score(b) > score(a) ? b : a)) : null
    const own = media(p.techSheetIllustration)
    let block = best
    if (own) {
      if (!ownBlocks.has(own.id)) ownBlocks.set(own.id, { illustration: own, columns: best?.columns ?? [], note: best?.note, ident: [], rows: [] })
      block = ownBlocks.get(own.id)!
      if (own.updatedAt > updatedAt) updatedAt = own.updatedAt
    }
    if (!block) {
      // bez výkresu: fotka (první položky bez výkresu), tabulka bez kót
      photoBlock ??= { illustration: media(p.images?.[0]), columns: [], ident: [], rows: [] }
      block = photoBlock
    }
    block.rows.push({ code: p.code, name: p.subtitle ? `${p.name} – ${p.subtitle}` : p.name, values })
    if (p.updatedAt > updatedAt) updatedAt = p.updatedAt
  }
  const blocks = [...shapeBlocks, ...ownBlocks.values(), ...(photoBlock ? [photoBlock] : [])]
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
    highlight,
    updatedAt,
  }
}
