import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { seriesParams } from '@/lib/static-params'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { CatalogClient, type CatalogRow } from '@/components/site/CatalogClient'
import { Icon } from '@/components/site/Icon'
import { RichText } from '@/components/site/RichText'
import { VideoEmbed } from '@/components/site/VideoEmbed'
import { docTypeMeta } from '@/lib/doc-types'
import { mediaUrl } from '@/lib/media'
import { techSheetLinks } from '@/lib/tech-sheet/links'
import { documentUrl, getDocumentsFor, getSeries, getSeriesProducts, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Brand, Division } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

// Všechny stránky se předgenerují při buildu (static-params.ts), nové při první návštěvě.
export const generateStaticParams = seriesParams

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSeries((await params).slug)
  if (!s) return {}
  const brand = rel<Brand>(s.brand)
  return {
    title: s.meta?.title || `${brand?.name ?? ''} ${s.name} – katalog`.trim(),
    description: s.meta?.description || s.lead || s.summary,
  }
}

export default async function SeriesPage({ params }: Props) {
  const { slug } = await params
  const series = await getSeries(slug)
  if (!series) notFound()
  const brand = rel<Brand>(series.brand)
  const division = rel<Division>(series.division)
  const [products, docs] = await Promise.all([getSeriesProducts(series.id), getDocumentsFor({ seriesId: series.id })])

  const rows: CatalogRow[] = products.map((p) => ({
    code: p.code,
    name: p.name,
    subtitle: p.subtitle ?? '',
    shape: p.shape ?? '',
    dimension: typeof p.dimension === 'number' ? p.dimension : null,
    thread: p.thread ?? '',
    img: mediaUrl(p.images?.[0], 'thumb'),
    sale: p.bcStatus === 'sale',
  }))
  // Generované technické listy (z dat) nahrazují nahraná PDF technických listů.
  const techSheets = techSheetLinks(series, products)
  const headTypes = techSheets.length ? ['navod', 'katalog'] : ['tl', 'navod', 'katalog']
  const headDocs = docs.filter((d) => headTypes.includes(d.type)).slice(0, 3)
  const videos = docs.filter((d) => d.type === 'video')

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Produkty', href: urls.products },
          ...(division?.slug ? [{ label: division.name, href: urls.division(division.slug) }] : []),
          ...(division?.slug && brand ? [{ label: brand.name, href: `${urls.division(division.slug)}#${brand.slug}` }] : []),
          { label: series.name },
        ]}
      />
      <section className="cat-head">
        <div className="container">
          <div>
            <div className="chips">
              {brand && <span className="chip">{brand.name}</span>}
              {division && <span className="chip">{division.name}</span>}
              {series.media && <span className="chip">{series.media}</span>}
            </div>
            <h1>{series.title || series.name}</h1>
            <p style={{ fontSize: 17 }}>
              {series.lead || series.summary}
              {brand?.manufacturer ? ` Výrobce ${brand.manufacturer.replace(/\.$/, '')}.` : ''}
            </p>
          </div>
          {headDocs.length > 0 && (
            <div className="docs">
              {headDocs.map((d) => (
                <a key={d.id} className="btn btn-outline btn-sm" href={documentUrl(d)} target="_blank" rel="noopener">
                  <Icon name={docTypeMeta(d.type).icon} />
                  {docTypeMeta(d.type).label}
                </a>
              ))}
            </div>
          )}
        </div>
      </section>
      {rows.length > 0 ? (
        <CatalogClient
          rows={rows}
          shapes={(series.shapes ?? []).map((s) => ({ code: s.code, label: s.label }))}
          dimensionLabel={series.dimensionLabel || 'Rozměr'}
          dimensionUnit={series.dimensionUnit ?? 'mm'}
          threadLabel={series.threadLabel || 'Závit'}
        />
      ) : (
        <section className="section">
          <div className="container">
            <div className="card empty" style={{ padding: 56 }}>
              <span className="ibox">
                <Icon name="box" />
              </span>
              <h2 style={{ fontSize: 26 }}>Položky řady připravujeme</h2>
              <p style={{ maxWidth: 560, color: 'var(--gray)' }}>
                Technické parametry této řady doplňujeme. Mezitím najdete informace v katalogu nebo nám zavolejte.
              </p>
              <a className="btn btn-primary" href={urls.library}>
                Knihovna médií
                <Icon name="arrow" />
              </a>
            </div>
          </div>
        </section>
      )}
      {techSheets.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Technické listy</h2>
            <div className="files">
              {techSheets.map((t) => (
                <a key={t.code} className="card file" href={t.href} target="_blank" rel="noopener">
                  <span className="ibox">
                    <Icon name={docTypeMeta('tl').icon} />
                  </span>
                  <b>{t.label.charAt(0).toUpperCase() + t.label.slice(1)}</b>
                  <span>Tvar {t.code} · PDF</span>
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
      {videos.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Video</h2>
            <div className="videos">
              {videos.map((v) => (
                <VideoEmbed key={v.id} title={v.title} url={v.externalUrl} />
              ))}
            </div>
          </div>
        </section>
      )}
      {(series.description || mediaUrl(series.image)) && (
        <section className="section">
          <div className="container">
            <RichText data={series.description} />
          </div>
        </section>
      )}
    </>
  )
}
