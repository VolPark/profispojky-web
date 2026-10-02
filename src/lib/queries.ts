import { draftMode } from 'next/headers'
import type { Where } from 'payload'
import { cache } from 'react'

import type { Brand, Division, Document, News, Page, Product, Series } from '@/payload-types'

import { getPayloadClient } from './payload'
import { REGIONS } from './regions'

export const rel = <T extends object>(v: T | number | string | null | undefined): T | null =>
  v && typeof v === 'object' ? v : null

/* ---------- globály ---------- */

export const getSettings = cache(async () => (await getPayloadClient()).findGlobal({ slug: 'site-settings', depth: 0 }))
export const getHomepage = cache(async () => (await getPayloadClient()).findGlobal({ slug: 'homepage', depth: 2 }))

/* ---------- divize, značky, řady ---------- */

export const getDivisions = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'divisions',
    where: { status: { not_equals: 'hidden' } },
    sort: 'order',
    depth: 1,
    pagination: false,
  })
  return res.docs
})

export const getDivision = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'divisions',
    where: { and: [{ slug: { equals: slug } }, { status: { equals: 'active' } }] },
    depth: 2,
    limit: 1,
  })
  return res.docs[0] ?? null
})

export const getAllSeries = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'series', sort: 'order', depth: 1, pagination: false })
  return res.docs
})

/** Řady divize seskupené podle značky (pořadí značek dle jejich `order`). */
export const getDivisionBrands = cache(async (divisionId: number) => {
  const all = await getAllSeries()
  const groups = new Map<number, { brand: Brand; series: Series[] }>()
  for (const s of all) {
    const division = rel<Division>(s.division)
    const brand = rel<Brand>(s.brand)
    if (!brand || division?.id !== divisionId) continue
    if (!groups.has(brand.id)) groups.set(brand.id, { brand, series: [] })
    groups.get(brand.id)!.series.push(s)
  }
  return [...groups.values()].sort((a, b) => (a.brand.order ?? 0) - (b.brand.order ?? 0))
})

/** Značky a divize, ve kterých mají řady – pro stránku Značky a chipy na kartách divizí. */
export const getBrandsOverview = cache(async () => {
  const [all, payload] = await Promise.all([getAllSeries(), getPayloadClient()])
  const brands = await payload.find({ collection: 'brands', sort: 'order', depth: 0, pagination: false })
  return brands.docs.map((brand) => {
    const series = all.filter((s) => rel<Brand>(s.brand)?.id === brand.id)
    const divisions = [...new Map(series.map((s) => rel<Division>(s.division)).filter(Boolean).map((d) => [d!.id, d!])).values()]
    return { brand, seriesCount: series.length, divisions }
  })
})

export const getSeries = cache(async (slug: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'series', where: { slug: { equals: slug } }, depth: 2, limit: 1 })
  return res.docs[0] ?? null
})

/* ---------- produkty ---------- */

const PUBLISHED: Where = { isPublished: { equals: true } }

export const getSeriesProducts = cache(async (seriesId: number) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { series: { equals: seriesId } }] },
    sort: 'code',
    depth: 1,
    pagination: false,
    overrideAccess: false,
  })
  return res.docs
})

export const getProduct = cache(async (code: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { code: { equals: code } }] },
    depth: 3,
    limit: 1,
    overrideAccess: false,
  })
  return res.docs[0] ?? null
})

export const searchProducts = cache(async (q: string, type: string) => {
  const payload = await getPayloadClient()
  const and: Where[] = [PUBLISHED]
  if (type) and.push({ productType: { equals: type } })
  if (q) {
    and.push({
      or: [{ code: { like: q } }, { name: { like: q } }, { subtitle: { like: q } }, { ean: { equals: q } }],
    })
  }
  const res = await payload.find({
    collection: 'products',
    where: { and },
    sort: 'code',
    depth: 1,
    limit: 200,
    overrideAccess: false,
  })
  return res
})

/** Typy výrobků se generují z hodnot atributu „Typ výrobku“ publikovaných položek. */
export const getProductTypes = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { and: [PUBLISHED, { productType: { exists: true } }] },
    select: { productType: true },
    pagination: false,
    depth: 0,
    overrideAccess: false,
  })
  const counts = new Map<string, number>()
  res.docs.forEach((p) => p.productType && counts.set(p.productType, (counts.get(p.productType) ?? 0) + 1))
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([name]) => name)
})

/* ---------- dokumenty ---------- */

export const documentUrl = (d: Pick<Document, 'externalUrl' | 'url'>) => d.externalUrl || d.url || '#'

export const getLibrary = cache(async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'documents',
    where: { showInLibrary: { equals: true } },
    sort: '-featured,title',
    depth: 1,
    pagination: false,
  })
  return res.docs
})

export const getDocumentsFor = cache(async (opts: { seriesId?: number; productId?: number }) => {
  const payload = await getPayloadClient()
  const or: Where[] = []
  if (opts.seriesId) or.push({ series: { contains: opts.seriesId } })
  if (opts.productId) or.push({ products: { contains: opts.productId } })
  if (!or.length) return []
  const res = await payload.find({ collection: 'documents', where: { or }, sort: 'type', depth: 0, pagination: false })
  return res.docs
})

/* ---------- aktuality, stránky ---------- */

export const getNewsList = cache(async (limit = 50) => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'news',
    sort: '-publishedAt',
    depth: 1,
    limit,
    overrideAccess: false,
    where: { and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }] },
  })
  return res.docs
})

export const getNews = async (slug: string): Promise<News | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'news',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    overrideAccess: draft,
  })
  return res.docs[0] ?? null
}

export const getPage = async (slug: string): Promise<Page | null> => {
  const { isEnabled: draft } = await draftMode()
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
    draft,
    overrideAccess: draft,
  })
  return res.docs[0] ?? null
}

/* ---------- prodejní síť, kontakty ---------- */

export type DealerRegion = { id: string; name: string; c: string; p: [string, string][] }

export const getDealerRegions = cache(async (): Promise<DealerRegion[]> => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'partners', sort: 'name', depth: 0, pagination: false })
  return REGIONS.map((r) => ({
    id: r.id,
    name: r.name,
    c: r.country,
    p: res.docs.filter((d) => d.region === r.id).map((d) => [d.name, d.address] as [string, string]),
  }))
})

export const getContacts = cache(async () => {
  const payload = await getPayloadClient()
  return (await payload.find({ collection: 'contacts', sort: 'order', depth: 1, pagination: false })).docs
})

/* ---------- přesměrování ---------- */

export const findRedirect = async (from: string) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection: 'redirects', where: { from: { equals: from } }, depth: 1, limit: 1 })
  return res.docs[0] ?? null
}

export type { Product }

export const getBrandsByDivision = cache(async () => {
  const overview = await getBrandsOverview()
  const map = new Map<number, Brand[]>()
  overview.forEach(({ brand, divisions }) =>
    divisions.forEach((d) => {
      if (!map.has(d.id)) map.set(d.id, [])
      map.get(d.id)!.push(brand)
    }),
  )
  return map
})
