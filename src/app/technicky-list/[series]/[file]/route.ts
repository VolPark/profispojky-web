import fs from 'node:fs/promises'
import path from 'node:path'

import { renderToBuffer } from '@react-pdf/renderer'
import { NextResponse, type NextRequest } from 'next/server'
import { createElement } from 'react'
import sharp from 'sharp'

import { getPayloadClient } from '@/lib/payload'
import { getTechSheet } from '@/lib/tech-sheet/data'
import { TechSheetDocument, type PdfImage } from '@/lib/tech-sheet/document'
import { urls } from '@/lib/urls'

/**
 * Technický list tvaru řady jako PDF – generuje se z dat (kóty položek, parametry řady,
 * ilustrace výkresu), nic se neukládá. Odkazy na webu nesou verzi dat (?v=…), takže CDN
 * drží PDF dlouho a po změně dat se použije nová adresa.
 */
let logoCache: PdfImage | null = null
const siteLogo = async (): Promise<PdfImage> => {
  if (!logoCache) {
    const svg = await fs.readFile(path.join(process.cwd(), 'public/logo.svg'))
    logoCache = { data: await sharp(svg, { density: 300 }).png().toBuffer(), format: 'png' }
  }
  return logoCache
}

/** Stáhne obrázek a převede ho na JPG/PNG (react-pdf neumí WebP ani SVG). */
const loadImage = async (url: string | null | undefined, origin: string): Promise<PdfImage | null> => {
  if (!url) return null
  try {
    let u = new URL(url, origin)
    // lokální úložiště: soubor z téhle instance (serverURL může mířit jinam)
    if (u.pathname.startsWith('/api/media/file/')) u = new URL(u.pathname, origin)
    const res = await fetch(u, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const buf = Buffer.from(await res.arrayBuffer())
    const { format } = await sharp(buf).metadata()
    if (format === 'jpeg') return { data: buf, format: 'jpg' }
    if (format === 'png') return { data: buf, format: 'png' }
    return { data: await sharp(buf, { density: 300 }).png().toBuffer(), format: 'png' }
  } catch {
    return null
  }
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ series: string; file: string }> }) {
  const { series: seriesSlug, file } = await params
  const shapeParam = decodeURIComponent(file).replace(/\.pdf$/i, '')
  try {
    const data = await getTechSheet(seriesSlug, shapeParam)
    if (!data) return new NextResponse('Technický list nenalezen', { status: 404, headers: { 'Cache-Control': 'public, s-maxage=300' } })
    const origin = req.nextUrl.origin
    const payload = await getPayloadClient()
    const brandLogo = data.brand?.logo && typeof data.brand.logo === 'object' ? data.brand.logo.url : null
    const [settings, logo, brandImg, illustrations] = await Promise.all([
      payload.findGlobal({ slug: 'site-settings', depth: 0 }),
      siteLogo(),
      loadImage(brandLogo, origin),
      Promise.all(data.blocks.map((b) => loadImage(b.illustration?.url, origin))),
    ])
    const seriesUrl = `${process.env.NEXT_PUBLIC_SERVER_URL || origin}${urls.series(data.series.slug!)}`
    const pdf = await renderToBuffer(
      createElement(TechSheetDocument, { data, settings, logo, brandLogo: brandImg, illustrations, seriesUrl }) as Parameters<typeof renderToBuffer>[0],
    )
    const name = `TL-${data.series.name}-${data.shape.code}.pdf`.replace(/[^\w.-]+/g, '-')
    const versioned = req.nextUrl.searchParams.has('v')
    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${name}"`,
        'Cache-Control': versioned
          ? 'public, max-age=3600, s-maxage=31536000, stale-while-revalidate=604800'
          : 'public, max-age=300, s-maxage=3600, stale-while-revalidate=604800',
      },
    })
  } catch {
    return new NextResponse('Technický list je dočasně nedostupný', { status: 503, headers: { 'Retry-After': '60' } })
  }
}
