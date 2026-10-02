export const NEWS_CATEGORIES = [
  { label: 'Novinka v sortimentu', value: 'novinka' },
  { label: 'Veletrh', value: 'veletrh' },
  { label: 'Školení', value: 'skoleni' },
  { label: 'Informace', value: 'informace' },
]

export const newsCategoryLabel = (v?: string | null) => NEWS_CATEGORIES.find((c) => c.value === v)?.label
