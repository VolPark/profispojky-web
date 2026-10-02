import type { Instrumentation } from 'next'

/**
 * Každá chyba serveru (render stránky, API, proxy) → e-mail dodavateli s vysokou prioritou.
 * U chyby při přegenerování ISR stránky návštěvníci dál vidí poslední funkční verzi.
 */
export const onRequestError: Instrumentation.onRequestError = async (err, request, context) => {
  if (process.env.NODE_ENV !== 'production') return
  const message = err instanceof Error ? err.message : String(err)
  const digest = typeof err === 'object' && err !== null && 'digest' in err ? String(err.digest) : undefined
  // Řízené stavy Next.js (404, redirect) nejsou chyby.
  if (digest?.startsWith('NEXT_')) return

  const { sendAlert } = await import('@/lib/alert')
  const revalidating = context.revalidateReason !== undefined
  await sendAlert({
    title: `Chyba serveru: ${message.split('\n')[0].slice(0, 120)}`,
    key: `${context.routePath}|${message.slice(0, 200)}`,
    impact: revalidating
      ? 'Stránku se nepodařilo přegenerovat. Návštěvníci dál vidí poslední funkční verzi – změny z adminu se zatím neprojevily.'
      : `Požadavek na ${request.path} skončil chybou. Pokud jde o stránku z cache, návštěvníci vidí poslední funkční verzi; jinak vidí chybovou stránku.`,
    details: {
      Adresa: `${request.method} ${request.path}`,
      Route: `${context.routePath} (${context.routeType})`,
      Revalidace: context.revalidateReason,
      Chyba: message.slice(0, 1000),
      Digest: digest,
    },
  })
}
