/**
 * Upozornění dodavateli (SEBIT) e-mailem s vysokou prioritou přes Resend.
 * Bez RESEND_API_KEY / ALERT_EMAIL_TO (lokálně) se jen zaloguje.
 *
 * Omezení: stejná chyba max. 1× za 30 min a celkem max. 10 mailů za hodinu
 * (na instanci serverless funkce) – opakovaná chyba nezahltí schránku.
 */
const SAME_ERROR_WINDOW_MS = 30 * 60 * 1000
const HOURLY_LIMIT = 10
const lastSent = new Map<string, number>()
const sentAt: number[] = []

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!)

export type Alert = {
  /** Krátký popis do předmětu. */
  title: string
  /** Klíč pro omezení opakování – stejný klíč = stejná chyba. */
  key: string
  /** Řádky „název: hodnota“ do těla mailu. */
  details: Record<string, string | undefined>
  /** Věta o dopadu na návštěvníky. */
  impact: string
}

const shouldSend = (key: string) => {
  const now = Date.now()
  if ((lastSent.get(key) ?? 0) > now - SAME_ERROR_WINDOW_MS) return false
  while (sentAt.length && sentAt[0] < now - 60 * 60 * 1000) sentAt.shift()
  if (sentAt.length >= HOURLY_LIMIT) return false
  lastSent.set(key, now)
  sentAt.push(now)
  return true
}

export const sendAlert = async (alert: Alert) => {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.ALERT_EMAIL_TO
  console.error(`[ALERT] ${alert.title}`, alert.details)
  if (!apiKey || !to || !shouldSend(alert.key)) return

  const env = process.env.VERCEL_ENV ?? 'local'
  const details: Record<string, string | undefined> = {
    ...alert.details,
    Prostředí: env,
    Deploy: process.env.VERCEL_URL,
    Commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    Čas: new Date().toISOString(),
  }
  const rows = Object.entries(details).filter(([, v]) => v)
  const text = [
    alert.impact,
    '',
    ...rows.map(([k, v]) => `${k}: ${v}`),
    '',
    'Logy: Vercel → profispojky-web → Logs (nebo požádejte Claude Code: „zkontroluj chyby profispojky webu“).',
    '',
    '—',
    'Automatické upozornění webu profispojky.cz',
  ].join('\n')
  const html = `<div style="font-family:Inter,-apple-system,'Segoe UI',sans-serif;font-size:16px;color:#111827;line-height:1.625;max-width:640px">
<h2 style="color:#002B5C;font-size:20px;margin:0 0 12px">${esc(alert.title)}</h2>
<p style="margin:0 0 16px">${esc(alert.impact)}</p>
<table style="border-collapse:collapse;font-size:14px">${rows
    .map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;font-family:ui-monospace,monospace;word-break:break-all">${esc(v!)}</td></tr>`)
    .join('')}</table>
<p style="margin:16px 0 0;font-size:14px">Logy: Vercel → profispojky-web → Logs, nebo požádejte Claude Code „zkontroluj chyby profispojky webu“.</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:32px"><tr><td style="border-left:3px solid #C6FF00;background-color:#002B5C;border-radius:0 8px 8px 0;padding:12px 16px;font-size:12px;line-height:1.6;color:#d6dfec"><strong style="color:#ffffff;font-weight:600">Automatické upozornění webu profispojky.cz</strong><br>Odesláno monitoringem webu. Na tento e-mail neodpovídejte.</td></tr></table>
</div>`

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.ALERT_EMAIL_FROM || 'Monitoring webu PROFI SPOJKY <asistent@ai.sebit.cz>',
        to: to.split(',').map((s) => s.trim()),
        subject: `[PROFI SPOJKY ${env}] ${alert.title}`.slice(0, 200),
        text,
        html,
        headers: { 'X-Priority': '1 (Highest)', 'X-MSMail-Priority': 'High', Importance: 'high' },
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch (err) {
    console.error('[ALERT] e-mail se nepodařilo odeslat', err)
  }
}
