import type { BcRow, ExistingProduct, FieldChange, ImportDiff } from './types'

const COMPARED: { row: keyof BcRow; product: keyof ExistingProduct }[] = [
  { row: 'name', product: 'name' },
  { row: 'ean', product: 'ean' },
  { row: 'unit', product: 'unit' },
  { row: 'seriesCode', product: 'bcSeriesCode' },
  { row: 'status', product: 'bcStatus' },
]

const str = (v: unknown) => (v === null || v === undefined ? '' : String(v))

/**
 * Porovná export z BC se stavem webu:
 * - created: kód v exportu, na webu není,
 * - changed: liší se některé pole z BC, nebo se položka vrací (byla skrytá),
 * - hidden: položka na webu je, v exportu chybí → skryje se (nemaže se, obsah zůstane).
 */
export const diffImport = (existing: ExistingProduct[], rows: BcRow[]): ImportDiff => {
  const byCode = new Map(existing.map((p) => [p.code, p]))
  const inFile = new Set(rows.map((r) => r.code))
  const diff: ImportDiff = { created: [], changed: [], hidden: [], unchangedCount: 0 }

  for (const row of rows) {
    const p = byCode.get(row.code)
    if (!p) {
      diff.created.push(row)
      continue
    }
    const changes: FieldChange[] = []
    for (const { row: rk, product: pk } of COMPARED) {
      const from = str(p[pk])
      const to = str(row[rk])
      // Prázdný stav v DB = výchozí „active“
      if (rk === 'status' && !from && to === 'active') continue
      if (from !== to) changes.push({ field: rk, from, to })
    }
    if (p.bcActive === false) changes.push({ field: 'bcActive', from: 'skryto', to: 'v importu' })
    if (changes.length) diff.changed.push({ id: p.id, code: p.code, name: row.name, changes, row })
    else diff.unchangedCount++
  }

  for (const p of existing) {
    if (!inFile.has(p.code) && p.bcActive !== false) diff.hidden.push({ id: p.id, code: p.code, name: str(p.name) })
  }
  return diff
}
