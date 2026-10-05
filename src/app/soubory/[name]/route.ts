import { NextResponse, type NextRequest } from 'next/server'

import { siteFileUrl } from '@/lib/media'
import { getPayloadClient } from '@/lib/payload'

/**
 * Stabilní adresa dokumentu: /soubory/<název-souboru> → přesměrování na aktuální umístění
 * v úložišti. Odkazy, které si lidé uloží (e-maily, katalogy partnerů, Google), tak přežijí
 * změnu úložiště i jeho adres. Přesměrování drží CDN v cache, takže stahování funguje
 * i při krátkém výpadku DB.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const name = decodeURIComponent((await params).name)
  try {
    const payload = await getPayloadClient()
    const { docs } = await payload.find({
      collection: 'documents',
      where: { filename: { equals: name } },
      select: { url: true, filename: true, prefix: true },
      limit: 1,
      depth: 0,
    })
    const url = docs[0]?.url
    if (!url) return new NextResponse('Soubor nenalezen', { status: 404, headers: { 'Cache-Control': 'public, s-maxage=300' } })
    // přes doménu webu (/uloziste/…), ne přímo na doménu úložiště – firemní sítě ji blokují
    return NextResponse.redirect(new URL(siteFileUrl(url), _req.nextUrl.origin), {
      status: 302,
      headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=604800' },
    })
  } catch {
    return new NextResponse('Soubor je dočasně nedostupný', { status: 503, headers: { 'Retry-After': '60' } })
  }
}
