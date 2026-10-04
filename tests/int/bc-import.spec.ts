import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'

import { diffImport } from '@/lib/bc-import/diff'
import { attributesFromTable, normalizeStatus, parseBcFile, parseCsv, rowsFromTable } from '@/lib/bc-import/parse'
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

describe('atributy z BC (list „Atributy“)', () => {
  it('spojí hodnotu s jednotkou, u kót z výkresu jen hodnotu, desetinná čárka', () => {
    const { byCode, errors } = attributesFromTable([
      ['Kód', 'Atribut', 'Hodnota', 'Jednotka'],
      ['30000007', 'Rozměr trubky', '20', 'mm'],
      ['30000007', 'Závit', '1/2"', ''],
      ['30000007', 'A', '47.5', 'mm'],
      ['30000007', 'PN', '30', ''],
      ['30000007', 'E', '', 'mm'],
      ['30000007', 'A', '48', 'mm'],
    ])
    expect(byCode.get('30000007')).toEqual([
      { label: 'Rozměr trubky', value: '20 mm' },
      { label: 'Závit', value: '1/2"' },
      { label: 'A', value: '47,5' },
      { label: 'PN', value: '30' },
    ])
    expect(errors).toHaveLength(1)
    expect(errors[0]).toContain('vícekrát')
  })

  it('XLSX s listem Atributy: atributy u položek, volitelné sloupce, změna v náhledu', async () => {
    const wb = new ExcelJS.Workbook()
    wb.addWorksheet('Položky').addRows([
      ['Kód', 'Název', 'Tvar', 'Typ výrobku'],
      ['30000007', 'BA 20 x 1/2"', 'A', 'Svěrné spojky'],
      ['30000011', 'BA 25 x 1/2"', 'A', 'Svěrné spojky'],
    ])
    wb.addWorksheet('Atributy').addRows([
      ['Kód', 'Atribut', 'Hodnota', 'Jednotka'],
      ['30000007', 'Rozměr trubky', 20, 'mm'],
      ['99999999', 'A', 1, 'mm'],
    ])
    const res = await parseBcFile(Buffer.from(await wb.xlsx.writeBuffer()), 'export.xlsx')
    expect(res.attributeItems).toBe(1)
    expect(res.rows[0]).toMatchObject({ shape: 'A', productType: 'Svěrné spojky', attributes: [{ label: 'Rozměr trubky', value: '20 mm' }] })
    expect(res.rows[1].attributes).toEqual([])
    expect(res.errors.some((e) => e.includes('99999999'))).toBe(true)

    const diff = diffImport(
      [{ id: 1, code: '30000007', name: 'BA 20 x 1/2"', bcStatus: 'active', shape: 'A', productType: 'Svěrné spojky', dimensions: [] }],
      [res.rows[0]],
    )
    expect(diff.changed[0].changes).toEqual([{ field: 'attributes', from: '', to: 'Rozměr trubky: 20 mm' }])
  })

  it('soubor bez listu Atributy atributy nemění', () => {
    const diff = diffImport(
      [{ id: 1, code: '1', name: 'X', bcStatus: 'active', dimensions: [{ label: 'A', value: '1' }] }],
      [{ code: '1', name: 'X', status: 'active' }],
    )
    expect(diff.unchangedCount).toBe(1)
  })
})
