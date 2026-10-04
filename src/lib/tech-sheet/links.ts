import type { Series } from '@/payload-types'

import { urls } from '../urls'

type Item = { shape?: string | null; updatedAt?: string; dimensions?: unknown[] | null; techSheetIllustration?: unknown }

/**
 * Odkazy na generované technické listy tvarů řady. List existuje, když aspoň jedna položka tvaru
 * má kóty a výkres (výchozí u tvaru, nebo vlastní u položky). `v` = poslední změna dat → nová adresa pro CDN po každé změně.
 */
export function techSheetLinks(series: Pick<Series, 'slug' | 'shapes' | 'updatedAt'>, items: Item[]) {
  if (!series.slug) return []
  return (series.shapes ?? [])
    .flatMap((s) => {
      const own = items.filter((i) => i.shape === s.code && i.dimensions?.length && (s.sheets?.length || i.techSheetIllustration))
      if (!own.length) return []
      const stamps = [
        series.updatedAt,
        ...own.map((i) => i.updatedAt),
        // výměna souboru ilustrace nemění řadu
        ...(s.sheets ?? []).map((x) => (typeof x.illustration === 'object' ? x.illustration.updatedAt : undefined)),
      ]
      const last = Math.max(...stamps.map((t) => (t ? Date.parse(t) : 0)))
      return [{ code: s.code, label: s.label, href: urls.techSheet(series.slug!, s.code, last.toString(36)) }]
    })
}
