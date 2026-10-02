import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { CatalogClient, type CatalogRow } from '@/components/site/CatalogClient'
import { Icon } from '@/components/site/Icon'
import { RichText } from '@/components/site/RichText'
import { docTypeMeta } from '@/lib/doc-types'
import { mediaUrl } from '@/lib/media'
import { documentUrl, getDocumentsFor, getSeries, getSeriesProducts, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Brand, Division } from '@/payload-types'

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ q?: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const s = await getSeries((await params).slug)
  if (!s) return {}
  const brand = rel<Brand>(s.brand)
  return {
    title: s.meta?.title || `${brand?.name ?? ''} ${s.name} – katalog`.trim(),
    description: s.meta?.description || s.lead || s.summary,
  }
}

export default async function SeriesPage({ params, searchParams }: Props) {
  const [{ slug }, { q }] = await Promise.all([params, searchParams])
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
  const headDocs = docs.filter((d) => ['tl', 'navod', 'katalog'].includes(d.type)).slice(0, 3)

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
          initialQuery={q ?? ''}
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
