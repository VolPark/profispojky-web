import { NextResponse, type NextRequest } from 'next/server'

import { urlForDoc } from '@/lib/urls'

/**
 * 301 přesměrování starých URL z profispojky.cz (kolekce Přesměrování v adminu).
 * Mapa se drží v paměti 5 minut; když API nejde načíst, použije se poslední známá
 * mapa, případně se nic nepřesměruje – web tím nikdy nespadne.
 */
type RedirectMap = Record<string, string>
const TTL_MS = 5 * 60 * 1000
let cache: { at: number; map: RedirectMap } | null = null

type RedirectDoc = {
  from: string
  to?: { type?: string | null; url?: string | null; reference?: { relationTo: string; value: unknown } | null }
}

const loadMap = async (origin: string): Promise<RedirectMap> => {
  if (cache && Date.now() - cache.at < TTL_MS) return cache.map
  try {
    const res = await fetch(`${origin}/api/redirects?limit=2000&depth=1`, { signal: AbortSignal.timeout(2000) })
    if (!res.ok) throw new Error(String(res.status))
    const { docs } = (await res.json()) as { docs: RedirectDoc[] }
    const map: RedirectMap = {}
    for (const r of docs) {
      const ref = r.to?.reference
      const target =
        r.to?.type === 'custom'
          ? r.to.url
          : ref && typeof ref.value === 'object' && ref.value
            ? urlForDoc(ref.relationTo, ref.value as { slug?: string; code?: string })
            : null
      if (r.from && target) map[r.from.trim()] = target
    }
    cache = { at: Date.now(), map }
    return map
  } catch {
    return cache?.map ?? {}
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl
  const map = await loadMap(origin)
  const decoded = decodeURIComponent(pathname)
  const target = map[`${decoded}${search}`] ?? map[decoded]
  if (target && target !== decoded) return NextResponse.redirect(new URL(target, origin), 301)
  return NextResponse.next()
}

export const config = {
  // Jen cesty, které nepatří novému webu (staré URL). Úvod, sekce webu, admin, API a soubory se přeskakují.
  matcher: [
    '/((?!_next/|api/|admin|next/|health|nastavit-heslo|produkty|divize/|katalog|produkt/|znacky|knihovna|prodejni-sit|aktuality|kontakt|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpe?g|webp|gif|ico|css|js|woff2?|map)$).+)',
  ],
}
