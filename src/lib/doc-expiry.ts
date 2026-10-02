export const EXPIRY_WARNING_DAYS = 60

export type ExpiryState = 'none' | 'ok' | 'expiring' | 'expired'

export const EXPIRY_LABELS: Record<ExpiryState, string> = {
  none: '–',
  ok: 'Platný',
  expiring: 'Brzy vyprší',
  expired: 'Vypršel',
}

export const expiryState = (validUntil: string | Date | null | undefined, now = new Date()): ExpiryState => {
  if (!validUntil) return 'none'
  const until = new Date(validUntil)
  if (Number.isNaN(until.getTime())) return 'none'
  if (until.getTime() < now.getTime()) return 'expired'
  const warnFrom = new Date(now.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000)
  return until.getTime() <= warnFrom.getTime() ? 'expiring' : 'ok'
}
