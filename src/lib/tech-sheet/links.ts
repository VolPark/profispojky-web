import type { Series } from '@/payload-types'

import { urls } from '../urls'

type Item = { shape?: string | null; updatedAt?: string; dimensions?: unknown[] | null }

const stamp = (dates: (string | null | undefined)[]) => Math.max(...dates.map((t) => (t ? Date.parse(t) : 0))).toString(36)

/**
 * Odkazy na generované technické listy tvarů řady – list má každý tvar, jehož aspoň jedna položka
 * má atributy (ilustrace: výkres položky → výkres tvaru → fotka). `v` = poslední změna dat →
 * nová adresa pro CDN po každé změně.
 */
export function techSheetLinks(series: Pick<Series, 'slug' | 'shapes' | 'updatedAt'>, items: Item[]) {
  if (!series.slug) return []
  return (series.shapes ?? []).flatMap((s) => {
    const own = items.filter((i) => i.shape === s.code && i.dimensions?.length)
    if (!own.length) return []
    const v = stamp([
      series.updatedAt,
      ...own.map((i) => i.updatedAt),
      // výměna souboru ilustrace nemění řadu
      ...(s.sheets ?? []).map((x) => (typeof x.illustration === 'object' ? x.illustration.updatedAt : undefined)),
    ])
    return [{ code: s.code, label: s.label, v, href: urls.techSheet(series.slug!, s.code, v) }]
  })
}

/** Odkaz na technický list položky (list jejího tvaru se zvýrazněnou položkou, nebo jen položka). */
export function techSheetItemLink(
  series: Pick<Series, 'slug' | 'shapes' | 'updatedAt'>,
  product: Item & { code: string; subtitle?: string | null; name: string },
  variants: Item[],
) {
  if (!product.dimensions?.length) return null
  const shape = techSheetLinks(series, variants).find((t) => t.code === product.shape)
  const v = shape?.v ?? stamp([series.updatedAt, product.updatedAt])
  return { label: shape?.label ?? product.subtitle ?? product.name, href: urls.techSheetItem(product.code, v) }
}
