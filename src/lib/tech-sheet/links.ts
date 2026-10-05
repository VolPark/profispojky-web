import type { Series } from '@/payload-types'

import { urls } from '../urls'

type Item = { shape?: string | null; updatedAt?: string; dimensions?: unknown[] | null; techSheetIllustration?: unknown }

const stamp = (dates: (string | null | undefined)[]) => Math.max(...dates.map((t) => (t ? Date.parse(t) : 0))).toString(36)

/**
 * Odkazy na generované technické listy tvarů řady – list má každý tvar se zveřejněnými položkami
 * (ilustrace: výkres položky → výkres tvaru → fotka). `v` = poslední změna dat → nová adresa pro CDN.
 */
export function techSheetLinks(series: Pick<Series, 'slug' | 'shapes' | 'updatedAt'>, items: Item[]) {
  if (!series.slug) return []
  return (series.shapes ?? []).flatMap((s) => {
    const own = items.filter((i) => i.shape === s.code)
    if (!own.length) return []
    const v = stamp([
      series.updatedAt,
      ...own.map((i) => i.updatedAt),
      // výměna souboru ilustrace nemění řadu
      ...(s.sheets ?? []).map((x) => (typeof x.illustration === 'object' ? x.illustration.updatedAt : undefined)),
    ])
    // odkaz vede přes mezistránku s animací; přímá adresa PDF (pdf) zůstává pro sdílení
    const pdf = urls.techSheet(series.slug!, s.code, v)
    return [{ code: s.code, label: s.label, v, pdf, href: urls.pdfLoader(pdf) }]
  })
}

/**
 * Odkaz na technický list položky (list jejího tvaru se zvýrazněnou položkou, nebo jen položka) – má ho každá
 * položka. `drawing` = list obsahuje výkres; jen pak nahrazuje nahrané PDF technického listu.
 */
export function techSheetItemLink(
  series: Pick<Series, 'slug' | 'shapes' | 'updatedAt'>,
  product: Item & { code: string; subtitle?: string | null; name: string },
  variants: Item[],
) {
  const shape = techSheetLinks(series, variants).find((t) => t.code === product.shape)
  const v = shape?.v ?? stamp([series.updatedAt, product.updatedAt])
  const shapeDef = (series.shapes ?? []).find((s) => s.code === product.shape)
  const drawing = Boolean(product.techSheetIllustration || shapeDef?.sheets?.some((x) => x.columns?.trim()))
  const pdf = urls.techSheetItem(product.code, v)
  return { label: shape?.label ?? product.subtitle ?? product.name, pdf, href: urls.pdfLoader(pdf), drawing }
}
