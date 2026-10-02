import type { Media } from '@/payload-types'

type MaybeMedia = Media | number | string | null | undefined

export const asMedia = (m: MaybeMedia): Media | null => (m && typeof m === 'object' ? m : null)

export const mediaUrl = (m: MaybeMedia, size?: 'thumb' | 'card' | 'large'): string | null => {
  const media = asMedia(m)
  if (!media) return null
  const sized = size ? media.sizes?.[size]?.url : null
  return sized || media.url || null
}

export const mediaAlt = (m: MaybeMedia, fallback = '') => asMedia(m)?.alt ?? fallback
