export type BcStatus = 'active' | 'sale' | 'inactive'

/** Jeden řádek exportu z Business Central. */
export type BcRow = {
  code: string
  name: string
  ean?: string
  unit?: string
  seriesCode?: string
  status: BcStatus
}

/** Stav produktu v DB, který porovnáváme s exportem. */
export type ExistingProduct = {
  id: number | string
  code: string
  name?: string | null
  ean?: string | null
  unit?: string | null
  bcSeriesCode?: string | null
  bcStatus?: string | null
  bcActive?: boolean | null
}

export type FieldChange = { field: keyof BcRow | 'bcActive'; from: string; to: string }

export type ImportDiff = {
  created: BcRow[]
  changed: { id: number | string; code: string; name: string; changes: FieldChange[]; row: BcRow }[]
  hidden: { id: number | string; code: string; name: string }[]
  unchangedCount: number
}

export type ParseResult = {
  rows: BcRow[]
  errors: string[]
  /** Které sloupce souboru jsme rozpoznali – zobrazuje se v adminu. */
  columns: Partial<Record<keyof BcRow, string>>
}
