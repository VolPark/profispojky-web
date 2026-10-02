const TZ = 'Europe/Prague'

export const formatDate = (value: string | Date | null | undefined, withTime = false) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const date = new Intl.DateTimeFormat('cs-CZ', { day: 'numeric', month: 'numeric', year: 'numeric', timeZone: TZ }).format(d)
  if (!withTime) return date
  const time = new Intl.DateTimeFormat('cs-CZ', { hour: '2-digit', minute: '2-digit', timeZone: TZ }).format(d)
  return `${date} ${time}`
}

export const formatBytes = (bytes: number | null | undefined) => {
  if (!bytes) return ''
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} kB`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} MB`
}
