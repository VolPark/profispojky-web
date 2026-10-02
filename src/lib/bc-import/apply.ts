import type { Payload, PayloadRequest } from 'payload'

import { diffImport } from './diff'
import type { BcRow, ExistingProduct, ImportDiff } from './types'

export const loadExistingProducts = async (payload: Payload, req?: PayloadRequest): Promise<ExistingProduct[]> => {
  const res = await payload.find({
    collection: 'products',
    pagination: false,
    depth: 0,
    req,
    overrideAccess: true,
    select: { code: true, name: true, ean: true, unit: true, bcSeriesCode: true, bcStatus: true, bcActive: true },
  })
  return res.docs as unknown as ExistingProduct[]
}

export const computeDiff = async (payload: Payload, rows: BcRow[], req?: PayloadRequest) =>
  diffImport(await loadExistingProducts(payload, req), rows)

export const diffSummary = (diff: ImportDiff) => ({
  created: diff.created.length,
  changed: diff.changed.length,
  hidden: diff.hidden.length,
  unchanged: diff.unchangedCount,
})

/**
 * Zapíše import do katalogu. Diff se přepočítá proti aktuálnímu stavu,
 * aby potvrzení starého náhledu nepřepsalo mezitím provedené změny.
 */
export const applyImport = async (payload: Payload, rows: BcRow[], req: PayloadRequest) => {
  const diff = await computeDiff(payload, rows, req)
  const now = new Date().toISOString()

  const seriesCodes = [...new Set(rows.map((r) => r.seriesCode).filter(Boolean))] as string[]
  const seriesByCode = new Map<string, number | string>()
  if (seriesCodes.length) {
    const s = await payload.find({
      collection: 'series',
      where: { bcCode: { in: seriesCodes } },
      pagination: false,
      depth: 0,
      req,
      overrideAccess: true,
      select: { bcCode: true },
    })
    s.docs.forEach((d) => d.bcCode && seriesByCode.set(d.bcCode, d.id))
  }

  for (const row of diff.created) {
    await payload.create({
      collection: 'products',
      req,
      overrideAccess: true,
      data: {
        code: row.code,
        name: row.name,
        ean: row.ean,
        unit: row.unit,
        bcSeriesCode: row.seriesCode,
        bcStatus: row.status,
        bcActive: true,
        lastImportedAt: now,
        showOnWeb: true,
        series: row.seriesCode ? (seriesByCode.get(row.seriesCode) as number | undefined) : undefined,
      },
    })
  }

  for (const ch of diff.changed) {
    const { row } = ch
    await payload.update({
      collection: 'products',
      id: ch.id,
      req,
      overrideAccess: true,
      data: {
        name: row.name,
        ean: row.ean ?? null,
        unit: row.unit ?? null,
        bcSeriesCode: row.seriesCode ?? null,
        bcStatus: row.status,
        bcActive: true,
        lastImportedAt: now,
      },
    })
  }

  for (const h of diff.hidden) {
    await payload.update({ collection: 'products', id: h.id, req, overrideAccess: true, data: { bcActive: false } })
  }

  return diff
}
