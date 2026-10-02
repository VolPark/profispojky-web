import { getPayloadClient } from '@/lib/payload'

/**
 * Health check pro externí uptime monitor: 200 = web i databáze odpovídají, 503 = problém.
 * Návštěvníci mezitím dostávají stránky z ISR cache – 503 tady neznamená, že web nejede.
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const started = Date.now()
  try {
    const payload = await getPayloadClient()
    await payload.count({ collection: 'divisions' })
    return Response.json({ ok: true, db: 'ok', ms: Date.now() - started }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (err) {
    return Response.json(
      { ok: false, db: 'error', error: err instanceof Error ? err.message.slice(0, 200) : 'unknown' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}
