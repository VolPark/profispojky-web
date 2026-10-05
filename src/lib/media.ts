import type { Media } from '@/payload-types'

type MaybeMedia = Media | number | string | null | undefined

/** Veřejná adresa úložiště Vercel Blob → stejná cesta pod doménou webu. */
const BLOB_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i

/**
 * Soubory z úložiště se na webu odkazují přes vlastní doménu (`/uloziste/…`, rewrite v next.config.ts),
 * ne přímo na *.blob.vercel-storage.com – firemní sítě a proxy doménu úložiště často blokují.
 */
export const siteFileUrl = (url: string) => url.replace(BLOB_HOST, '/uloziste/')

export const asMedia = (m: MaybeMedia): Media | null => (m && typeof m === 'object' ? m : null)

export const mediaUrl = (m: MaybeMedia, size?: 'thumb' | 'card' | 'large'): string | null => {
  const media = asMedia(m)
  if (!media) return null
  const sized = size ? media.sizes?.[size]?.url : null
  const url = sized || media.url
  return url ? siteFileUrl(url) : null
}

export const mediaAlt = (m: MaybeMedia, fallback = '') => asMedia(m)?.alt ?? fallback
