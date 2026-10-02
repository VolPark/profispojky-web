import { getPayloadClient } from './payload'

/**
 * Seznamy stránek pro předgenerování při buildu. Všechny stránky tak jsou v ISR cache
 * hned po nasazení a při výpadku DB se zobrazí i ty, které ještě nikdo nenavštívil.
 * Nové položky přidané v adminu se vygenerují při první návštěvě.
 */
const slugs = async (collection: 'divisions' | 'series' | 'news' | 'pages', where = {}) => {
  const payload = await getPayloadClient()
  const res = await payload.find({ collection, where, pagination: false, depth: 0, select: { slug: true } })
  return res.docs.map((d) => d.slug).filter((s): s is string => Boolean(s))
}

export const divisionParams = async () =>
  (await slugs('divisions', { status: { equals: 'active' } })).map((slug) => ({ slug }))

export const seriesParams = async () => (await slugs('series')).map((slug) => ({ slug }))

export const newsParams = async () =>
  (
    await slugs('news', {
      and: [{ _status: { equals: 'published' } }, { publishedAt: { less_than_equal: new Date().toISOString() } }],
    })
  ).map((slug) => ({ slug }))

export const pageParams = async () =>
  (await slugs('pages', { _status: { equals: 'published' } })).map((slug) => ({ slug: [slug] }))

export const productParams = async () => {
  const payload = await getPayloadClient()
  const res = await payload.find({
    collection: 'products',
    where: { isPublished: { equals: true } },
    pagination: false,
    depth: 0,
    select: { code: true },
  })
  return res.docs.map((d) => ({ code: d.code }))
}
