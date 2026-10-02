import ExcelJS from 'exceljs'

import type { BcRow, BcStatus, ParseResult } from './types'

/**
 * Rozpoznávané názvy sloupců exportu z BC (bez diakritiky, malými písmeny).
 * Předpoklad: export položek z BC v češtině nebo angličtině – přesný formát doladíme podle reálného souboru.
 */
const COLUMN_ALIASES: Record<keyof BcRow, string[]> = {
  code: ['kod', 'kod polozky', 'cislo', 'cislo polozky', 'c.', 'c', 'no.', 'no', 'item no.', 'item no', 'objednaci cislo'],
  name: ['nazev', 'popis', 'nazev polozky', 'description', 'name'],
  ean: ['ean', 'gtin', 'carovy kod', 'ean kod', 'barcode'],
  unit: ['mj', 'merna jednotka', 'zakladni merna jednotka', 'zakl. mj', 'base unit of measure', 'unit'],
  seriesCode: ['rada', 'kod rady', 'produktova rada', 'skupina', 'series', 'item category code', 'kod kategorie zbozi'],
  status: ['stav', 'status', 'vyprodej', 'blokovano', 'blocked', 'aktivni'],
}

const norm = (s: unknown) =>
  String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const cellText = (v: unknown): string => {
  if (v === null || v === undefined) return ''
  if (typeof v === 'object') {
    const o = v as { text?: string; result?: unknown; richText?: { text: string }[] }
    if (o.richText) return o.richText.map((r) => r.text).join('').trim()
    if (o.text !== undefined) return String(o.text).trim()
    if (o.result !== undefined) return String(o.result).trim()
  }
  return String(v).trim()
}

export const normalizeStatus = (raw: string, header: string): BcStatus => {
  const v = norm(raw)
  const h = norm(header)
  if (!v) return 'active'
  if (/vyprodej|doprodej|sale|clearance/.test(v)) return 'sale'
  if (/neaktiv|inactive|blok|vyrazen|ukoncen|zrusen/.test(v)) return 'inactive'
  // Sloupec typu „Blokováno: Ano/Ne“
  const yes = /^(ano|yes|true|1|x)$/.test(v)
  if (/blok|blocked/.test(h)) return yes ? 'inactive' : 'active'
  if (/vyprodej/.test(h)) return yes ? 'sale' : 'active'
  if (/aktivni/.test(h)) return yes ? 'active' : 'inactive'
  return 'active'
}

/** Najde mapování sloupců v řádku záhlaví. */
export const mapHeader = (header: string[]) => {
  const map: Partial<Record<keyof BcRow, number>> = {}
  header.forEach((h, idx) => {
    const n = norm(h)
    ;(Object.keys(COLUMN_ALIASES) as (keyof BcRow)[]).forEach((key) => {
      if (map[key] === undefined && COLUMN_ALIASES[key].includes(n)) map[key] = idx
    })
  })
  return map
}

/** Převod tabulky (pole řádků) na položky BC. Záhlaví se hledá v prvních 10 řádcích. */
export const rowsFromTable = (table: string[][]): ParseResult => {
  const errors: string[] = []
  const headerIdx = table.slice(0, 10).findIndex((r) => {
    const m = mapHeader(r)
    return m.code !== undefined && m.name !== undefined
  })
  if (headerIdx === -1) {
    return {
      rows: [],
      columns: {},
      errors: ['Nenašli jsme záhlaví se sloupci „Kód“ a „Název“. Zkontrolujte, že jde o export položek z BC.'],
    }
  }
  const header = table[headerIdx]
  const map = mapHeader(header)
  const columns: ParseResult['columns'] = {}
  ;(Object.keys(map) as (keyof BcRow)[]).forEach((k) => (columns[k] = header[map[k] as number]))

  const seen = new Map<string, number>()
  const rows: BcRow[] = []
  table.slice(headerIdx + 1).forEach((r, i) => {
    const line = headerIdx + i + 2
    const get = (k: keyof BcRow) => (map[k] === undefined ? '' : (r[map[k] as number] ?? '').trim())
    const code = get('code')
    if (!code && r.every((c) => !String(c ?? '').trim())) return
    if (!code) {
      errors.push(`Řádek ${line}: chybí kód položky – řádek přeskočen.`)
      return
    }
    const name = get('name')
    if (!name) {
      errors.push(`Řádek ${line}: položka ${code} nemá název – řádek přeskočen.`)
      return
    }
    if (seen.has(code)) {
      errors.push(`Řádek ${line}: kód ${code} je v souboru podruhé (poprvé na řádku ${seen.get(code)}) – použit první výskyt.`)
      return
    }
    seen.set(code, line)
    const row: BcRow = {
      code,
      name,
      status: map.status === undefined ? 'active' : normalizeStatus(get('status'), header[map.status]),
    }
    const ean = get('ean')
    const unit = get('unit')
    const seriesCode = get('seriesCode')
    if (ean) row.ean = ean
    if (unit) row.unit = unit
    if (seriesCode) row.seriesCode = seriesCode
    rows.push(row)
  })
  return { rows, errors, columns }
}

/** Jednoduchý CSV parser (oddělovač ; nebo , – podle záhlaví, uvozovky dle RFC 4180). */
export const parseCsv = (text: string): string[][] => {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  const sep = (firstLine.match(/;/g)?.length ?? 0) >= (firstLine.match(/,/g)?.length ?? 0) ? ';' : ','
  const out: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (c === '"') quoted = false
      else cell += c
    } else if (c === '"') quoted = true
    else if (c === sep) {
      row.push(cell)
      cell = ''
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      out.push(row)
      row = []
      cell = ''
    } else cell += c
  }
  if (cell || row.length) {
    row.push(cell)
    out.push(row)
  }
  return out
}

export const parseBcFile = async (data: Buffer, filename: string): Promise<ParseResult> => {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.csv')) {
    const text = data.toString('utf8').replace(/^﻿/, '')
    return rowsFromTable(parseCsv(text))
  }
  if (!lower.endsWith('.xlsx')) {
    return { rows: [], columns: {}, errors: ['Podporované formáty jsou XLSX a CSV.'] }
  }
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.load(data as unknown as ArrayBuffer)
  const ws = wb.worksheets[0]
  if (!ws) return { rows: [], columns: {}, errors: ['Soubor neobsahuje žádný list.'] }
  const table: string[][] = []
  ws.eachRow({ includeEmpty: true }, (r) => {
    const values = r.values as unknown[]
    // ExcelJS indexuje sloupce od 1
    table.push(values.slice(1).map(cellText))
  })
  return rowsFromTable(table)
}
