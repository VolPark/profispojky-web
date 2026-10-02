import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { isStaffUser } from '@/access/roles'
import { getPayloadClient } from '@/lib/payload'

/** Náhled konceptu – povolen jen přihlášeným uživatelům adminu. */
export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get('path') || '/'
  if (!path.startsWith('/') || path.startsWith('//')) return new Response('Neplatná cesta', { status: 400 })

  const payload = await getPayloadClient()
  const { user } = await payload.auth({ headers: req.headers })
  if (!isStaffUser(user)) return new Response('Náhled je dostupný jen po přihlášení do administrace.', { status: 403 })

  ;(await draftMode()).enable()
  redirect(path)
}
