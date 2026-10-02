export const DOC_TYPES = [
  { value: 'katalog', label: 'Katalog', plural: 'Katalogy', icon: 'file' },
  { value: 'letak', label: 'Leták', plural: 'Letáky', icon: 'file' },
  { value: 'tl', label: 'Technický list', plural: 'Technické listy', icon: 'file' },
  { value: 'cert', label: 'Certifikát', plural: 'Certifikáty', icon: 'check' },
  { value: 'shoda', label: 'Prohlášení o shodě', plural: 'Prohlášení o shodě', icon: 'check' },
  { value: 'navod', label: 'Montážní návod', plural: 'Montážní návody', icon: 'tool' },
  { value: 'video', label: 'Video', plural: 'Videa', icon: 'play' },
  { value: 'jine', label: 'Jiný dokument', plural: 'Ostatní', icon: 'file' },
] as const

export type DocType = (typeof DOC_TYPES)[number]['value']

export const docTypeMeta = (t: string | null | undefined) => DOC_TYPES.find((d) => d.value === t) ?? DOC_TYPES[7]
