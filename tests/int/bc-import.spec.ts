import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'

import { diffImport } from '@/lib/bc-import/diff'
import { normalizeStatus, parseBcFile, parseCsv, rowsFromTable } from '@/lib/bc-import/parse'
import type { ExistingProduct } from '@/lib/bc-import/types'

describe('rowsFromTable', () => {
  it('rozpozná české záhlaví a přeskočí úvodní řádky exportu', () => {
    const res = rowsFromTable([
      ['Export položek', ''],
      ['', ''],
      ['Číslo', 'Popis', 'EAN', 'Základní měrná jednotka', 'Řada', 'Stav'],
      ['30000007', 'BA 20 × 1/2"', '8001234567890', 'KS', 'VALVOPAT', 'Výprodej'],
      ['30000011', 'BA 25 × 1/2"', '', 'KS', 'VALVOPAT', ''],
    ])
    expect(res.errors).toEqual([])
    expect(res.columns.code).toBe('Číslo')
    expect(res.rows).toEqual([
      { code: '30000007', name: 'BA 20 × 1/2"', ean: '8001234567890', unit: 'KS', seriesCode: 'VALVOPAT', status: 'sale' },
      { code: '30000011', name: 'BA 25 × 1/2"', unit: 'KS', seriesCode: 'VALVOPAT', status: 'active' },
    ])
  })

  it('hlásí duplicitní kód a chybějící název, prázdné řádky ignoruje', () => {
    const res = rowsFromTable([
      ['No.', 'Description'],
      ['1', 'A'],
      ['', ''],
      ['1', 'B'],
      ['2', ''],
    ])
    expect(res.rows).toHaveLength(1)
    expect(res.errors).toHaveLength(2)
    expect(res.errors[0]).toContain('podruhé')
    expect(res.errors[1]).toContain('nemá název')
  })

  it('bez sloupců Kód a Název vrátí srozumitelnou chybu', () => {
    const res = rowsFromTable([['Foo', 'Bar']])
    expect(res.rows).toEqual([])
    expect(res.errors[0]).toContain('Kód')
  })
})

describe('normalizeStatus', () => {
  it.each([
    ['', 'Stav', 'active'],
    ['Výprodej', 'Stav', 'sale'],
    ['Neaktivní', 'Stav', 'inactive'],
    ['Ano', 'Blokováno', 'inactive'],
    ['Ne', 'Blokováno', 'active'],
    ['ano', 'Výprodej', 'sale'],
  ])('%s / %s → %s', (value, header, expected) => {
    expect(normalizeStatus(value, header)).toBe(expected)
  })
})

describe('parseCsv', () => {
  it('zvládne středník, uvozovky a palce v názvu', () => {
    expect(parseCsv('Kód;Název\n1;"BA 20 × 1/2"""\r\n2;"a;b"\n')).toEqual([
      ['Kód', 'Název'],
      ['1', 'BA 20 × 1/2"'],
      ['2', 'a;b'],
    ])
  })
})

describe('parseBcFile', () => {
  it('načte XLSX', async () => {
    const wb = new ExcelJS.Workbook()
    const ws = wb.addWorksheet('Položky')
    ws.addRow(['Kód', 'Název', 'MJ'])
    ws.addRow([30000007, 'BA 20 × 1/2"', 'KS'])
    const buf = Buffer.from(await wb.xlsx.writeBuffer())
    const res = await parseBcFile(buf, 'export.xlsx')
    expect(res.rows).toEqual([{ code: '30000007', name: 'BA 20 × 1/2"', unit: 'KS', status: 'active' }])
  })

  it('odmítne nepodporovaný formát', async () => {
    const res = await parseBcFile(Buffer.from(''), 'export.xls')
    expect(res.errors[0]).toContain('XLSX')
  })
})

describe('diffImport', () => {
  const existing: ExistingProduct[] = [
    { id: 1, code: 'A', name: 'Stará', ean: null, unit: 'KS', bcSeriesCode: 'R', bcStatus: 'active', bcActive: true },
    { id: 2, code: 'B', name: 'Beze změny', unit: 'KS', bcSeriesCode: 'R', bcStatus: 'active', bcActive: true },
    { id: 3, code: 'C', name: 'Zmizí', bcActive: true },
    { id: 4, code: 'D', name: 'Vrací se', unit: 'KS', bcStatus: 'active', bcActive: false },
    { id: 5, code: 'E', name: 'Už skrytá', bcActive: false },
  ]

  it('rozdělí položky na nové, změněné, skryté a beze změny', () => {
    const diff = diffImport(existing, [
      { code: 'A', name: 'Nová', unit: 'KS', seriesCode: 'R', status: 'sale' },
      { code: 'B', name: 'Beze změny', unit: 'KS', seriesCode: 'R', status: 'active' },
      { code: 'D', name: 'Vrací se', unit: 'KS', status: 'active' },
      { code: 'N', name: 'Úplně nová', status: 'active' },
    ])
    expect(diff.created.map((r) => r.code)).toEqual(['N'])
    expect(diff.changed.map((c) => c.code)).toEqual(['A', 'D'])
    expect(diff.changed[0].changes).toEqual([
      { field: 'name', from: 'Stará', to: 'Nová' },
      { field: 'status', from: 'active', to: 'sale' },
    ])
    expect(diff.changed[1].changes).toEqual([{ field: 'bcActive', from: 'skryto', to: 'v importu' }])
    // C chybí v exportu → skryje se; E je už skrytá → nic
    expect(diff.hidden.map((h) => h.code)).toEqual(['C'])
    expect(diff.unchangedCount).toBe(1)
  })
})
