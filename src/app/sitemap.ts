import type { MetadataRoute } from 'next'

import { getPayloadClient } from '@/lib/payload'
import { urls } from '@/lib/urls'

export const dynamic = 'force-dynamic'

/** Sitemap – hlavně stránky řad (dle SEO handoffu), divize, aktuality a textové stránky. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || ''
  const payload = await getPayloadClient()
  const [divisions, series, news, pages] = await Promise.all([
    payload.find({ collection: 'divisions', where: { status: { equals: 'active' } }, pagination: false, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({ collection: 'series', pagination: false, depth: 0, select: { slug: true, updatedAt: true } }),
    payload.find({
      collection: 'news',
      where: { and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }] },
      pagination: false,
      depth: 0,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({ collection: 'pages', where: { _status: { equals: 'published' } }, pagination: false, depth: 0, select: { slug: true, updatedAt: true } }),
  ])
  const entry = (path: string, lastModified?: string, priority = 0.5): MetadataRoute.Sitemap[number] => ({
    url: `${base}${path}`,
    lastModified,
    priority,
  })
  return [
    entry('/', undefined, 1),
    entry(urls.products, undefined, 0.8),
    entry(urls.brands),
    entry(urls.library, undefined, 0.7),
    entry(urls.dealers, undefined, 0.7),
    entry(urls.news),
    entry(urls.contact),
    ...divisions.docs.map((d) => entry(urls.division(d.slug!), d.updatedAt, 0.8)),
    ...series.docs.map((s) => entry(urls.series(s.slug!), s.updatedAt, 0.9)),
    ...news.docs.map((n) => entry(urls.newsDetail(n.slug!), n.updatedAt, 0.4)),
    ...pages.docs.map((p) => entry(urls.page(p.slug!), p.updatedAt, 0.4)),
  ]
}
