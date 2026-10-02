import { NextResponse, type NextRequest } from 'next/server'

import { urlForDoc } from '@/lib/urls'

/**
 * 301 přesměrování starých URL z profispojky.cz (kolekce Přesměrování v adminu, tisíce řádků).
 * Hledá se vždy jen konkrétní adresa a výsledek (i „nenalezeno“) se drží v paměti 5 minut.
 * Když API nejde načíst, nic se nepřesměruje – web tím nikdy nespadne.
 */
type RedirectDoc = {
  from: string
  to?: { type?: string | null; url?: string | null; reference?: { relationTo: string; value: unknown } | null }
}

const TTL_MS = 5 * 60 * 1000
const MAX_ENTRIES = 5000
const cache = new Map<string, { at: number; target: string | null }>()

// Sekce nového webu – tam nic nepřesměrováváme (porovnává se celý první segment cesty).
const SITE_SECTIONS = new Set([
  'produkty',
  'divize',
  'katalog',
  'produkt',
  'znacky',
  'knihovna',
  'prodejni-sit',
  'aktuality',
  'kontakt',
  'nastavit-heslo',
  'soubory',
  'health',
  'next',
  'admin',
  'api',
])

const targetOf = (r: RedirectDoc | undefined): string | null => {
  const ref = r?.to?.reference
  if (r?.to?.type === 'custom') return r.to.url || null
  if (ref && typeof ref.value === 'object' && ref.value) return urlForDoc(ref.relationTo, ref.value as { slug?: string; code?: string })
  return null
}

const lookup = async (origin: string, keys: string[]): Promise<string | null> => {
  const id = keys.join('\n')
  const hit = cache.get(id)
  if (hit && Date.now() - hit.at < TTL_MS) return hit.target
  const qs = keys.map((k, i) => `where[or][${i}][from][equals]=${encodeURIComponent(k)}`).join('&')
  const res = await fetch(`${origin}/api/redirects?${qs}&limit=${keys.length}&depth=1`, { signal: AbortSignal.timeout(2500) })
  if (!res.ok) throw new Error(String(res.status))
  const { docs } = (await res.json()) as { docs: RedirectDoc[] }
  // Přesná shoda včetně ?parametrů má přednost před shodou samotné cesty.
  const doc = keys.map((k) => docs.find((d) => d.from?.trim() === k)).find(Boolean)
  const target = targetOf(doc)
  if (cache.size >= MAX_ENTRIES) cache.delete(cache.keys().next().value!)
  cache.set(id, { at: Date.now(), target })
  return target
}

export async function proxy(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl
  const first = pathname.split('/')[1] ?? ''
  if (SITE_SECTIONS.has(first)) return NextResponse.next()
  let decoded = pathname
  try {
    decoded = decodeURIComponent(pathname)
  } catch {}
  const keys = search ? [`${decoded}${search}`, decoded] : [decoded]
  try {
    const target = await lookup(origin, keys)
    if (target && target !== decoded) return NextResponse.redirect(new URL(target, origin), 301)
  } catch {
    // výpadek API / DB – stránka se zobrazí bez přesměrování
  }
  return NextResponse.next()
}

export const config = {
  // Úvod, interní cesty Next.js a statické soubory se přeskakují; sekce webu řeší SITE_SECTIONS.
  matcher: ['/((?!_next/|api/|admin|favicon|.*\\.(?:svg|png|jpe?g|webp|gif|ico|css|js|woff2?|map|txt|xml)$).+)'],
}
