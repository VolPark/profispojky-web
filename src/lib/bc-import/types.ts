export type BcStatus = 'active' | 'sale' | 'inactive'

/** Jeden řádek exportu z Business Central. */
export type BcRow = {
  code: string
  name: string
  ean?: string
  unit?: string
  seriesCode?: string
  status: BcStatus
  // Volitelné – jen když je soubor obsahuje (sloupec / list „Atributy“); jinak import pole nemění.
  subtitle?: string
  shape?: string
  productType?: string
  description?: string
  /** Technické atributy (list „Atributy“): identifikace i kóty dle výkresu. */
  attributes?: BcAttribute[]
}

export type BcAttribute = { label: string; value: string }

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
  subtitle?: string | null
  shape?: string | null
  productType?: string | null
  description?: string | null
  dimensions?: { label: string; value: string }[] | null
}

export type FieldChange = { field: keyof BcRow | 'bcActive'; from: string; to: string }

/** Atributy jako text pro porovnání a náhled („A: 47,5 · E: 15“). */
export const attributesText = (a: BcAttribute[] | null | undefined) => (a ?? []).map((x) => `${x.label}: ${x.value}`).join(' · ')

export type ImportDiff = {
  created: BcRow[]
  changed: { id: number | string; code: string; name: string; changes: FieldChange[]; row: BcRow }[]
  hidden: { id: number | string; code: string; name: string }[]
  unchangedCount: number
}

export type ParseResult = {
  rows: BcRow[]
  errors: string[]
  /** Počet položek s atributy (list „Atributy“), undefined = soubor list nemá. */
  attributeItems?: number
  /** Které sloupce souboru jsme rozpoznali – zobrazuje se v adminu. */
  columns: Partial<Record<keyof BcRow, string>>
}
