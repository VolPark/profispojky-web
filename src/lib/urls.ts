export const urls = {
  home: '/',
  products: '/produkty',
  division: (slug: string) => `/divize/${slug}`,
  series: (slug: string) => `/katalog/${slug}`,
  product: (code: string) => `/produkt/${encodeURIComponent(code)}`,
  search: (q?: string, typ?: string) => {
    const p = new URLSearchParams()
    if (q) p.set('q', q)
    if (typ) p.set('typ', typ)
    const s = p.toString()
    return `/katalog${s ? `?${s}` : ''}`
  },
  brands: '/znacky',
  library: '/knihovna',
  dealers: '/prodejni-sit',
  news: '/aktuality',
  newsDetail: (slug: string) => `/aktuality/${slug}`,
  contact: '/kontakt',
  page: (slug: string) => `/${slug}`,
}

/** URL pro cíl přesměrování typu „reference“. */
export const urlForDoc = (relationTo: string, doc: { slug?: string | null; code?: string | null }) => {
  switch (relationTo) {
    case 'pages':
      return doc.slug ? urls.page(doc.slug) : null
    case 'series':
      return doc.slug ? urls.series(doc.slug) : null
    case 'products':
      return doc.code ? urls.product(doc.code) : null
    case 'news':
      return doc.slug ? urls.newsDetail(doc.slug) : null
    case 'divisions':
      return doc.slug ? urls.division(doc.slug) : null
    default:
      return null
  }
}
