import { NextResponse, type NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Odkaz z pozvánky / resetu hesla. Payload na /admin/reset/<token> místo formuláře
 * ukáže „Již jste přihlášen“, když je v prohlížeči přihlášený jiný účet – a uživatel
 * pak skončí v adminu cizího účtu bez nastavení hesla. Proto nejdřív odhlásit, pak formulář.
 */
export function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? ''
  const target = /^[a-f0-9]{20,128}$/i.test(token) ? `/admin/reset/${token}` : '/admin/forgot'
  const res = NextResponse.redirect(new URL(target, request.nextUrl.origin), 303)
  res.cookies.set('payload-token', '', { path: '/', expires: new Date(0), httpOnly: true, sameSite: 'lax' })
  res.headers.set('Cache-Control', 'no-store')
  res.headers.set('Referrer-Policy', 'no-referrer')
  return res
}
