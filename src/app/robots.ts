import type { MetadataRoute } from 'next'

import { serverUrl } from '@/lib/preview'

export const dynamic = 'force-dynamic'

export default function robots(): MetadataRoute.Robots {
  const base = serverUrl()
  // Do spuštění ostré domény (ALLOW_INDEXING=true) web neindexujeme.
  if (process.env.ALLOW_INDEXING !== 'true') return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api', '/next'] },
    sitemap: base ? `${base}/sitemap.xml` : undefined,
  }
}
