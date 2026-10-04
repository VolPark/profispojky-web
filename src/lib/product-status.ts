export type MissingContent = 'photo' | 'params' | 'series'

export const MISSING_LABELS: Record<MissingContent, string> = {
  photo: 'fotka',
  params: 'parametry',
  series: 'řada',
}

export type ProductStatusInput = {
  images?: unknown[] | null
  shape?: string | null
  dimension?: number | null
  thread?: string | null
  params?: { label?: string | null; value?: string | null }[] | null
  /** Technické atributy z BC. */
  dimensions?: { label?: string | null; value?: string | null }[] | null
  series?: unknown
  showOnWeb?: boolean | null
  bcActive?: boolean | null
  bcStatus?: string | null
}

/**
 * Položka se publikuje jen když:
 * - je aktivní v posledním importu z BC (není vyřazená),
 * - má zaškrtnuté „Zobrazit na webu“,
 * - má fotku, aspoň jeden technický parametr a přiřazenou řadu.
 * Jinak padá do fronty „Doplnit obsah“ (pokud chybí obsah).
 */
export const computeProductStatus = (p: ProductStatusInput) => {
  const missing: MissingContent[] = []
  if (!p.images || p.images.length === 0) missing.push('photo')
  const hasParams =
    Boolean(p.shape) ||
    typeof p.dimension === 'number' ||
    Boolean(p.thread) ||
    Boolean(p.params?.some((x) => x?.label && x?.value)) ||
    Boolean(p.dimensions?.some((x) => x?.label && x?.value))
  if (!hasParams) missing.push('params')
  if (!p.series) missing.push('series')

  const contentComplete = missing.length === 0
  const bcActive = p.bcActive !== false && p.bcStatus !== 'inactive'
  const isPublished = contentComplete && bcActive && p.showOnWeb !== false

  return { missing, contentComplete, isPublished }
}
