/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { productParams } from '@/lib/static-params'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { VideoEmbed } from '@/components/site/VideoEmbed'
import { docTypeMeta } from '@/lib/doc-types'
import { formatBytes } from '@/lib/format'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { techSheetItemLink } from '@/lib/tech-sheet/links'
import { documentUrl, getDocumentsFor, getProduct, getProductVariants, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Brand, Division, Series } from '@/payload-types'

type Props = { params: Promise<{ code: string }> }

// Všechny stránky se předgenerují při buildu (static-params.ts), nové při první návštěvě.
export const generateStaticParams = productParams

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = await getProduct(decodeURIComponent((await params).code))
  if (!p) return {}
  const s = rel<Series>(p.series)
  const brand = rel<Brand>(s?.brand)
  return {
    title: `${p.name}${p.subtitle ? ` – ${p.subtitle.toLowerCase()}` : ''}`,
    description: [p.subtitle, brand && s ? `${brand.name} ${s.name}` : null, `Objednací číslo ${p.code}.`].filter(Boolean).join(' · '),
    // Indexujeme hlavně stránky řad; detail položky jen sledujeme.
    robots: { index: false, follow: true },
  }
}

export default async function ProductPage({ params }: Props) {
  const code = decodeURIComponent((await params).code)
  const product = await getProduct(code)
  if (!product) notFound()

  const series = rel<Series>(product.series)
  const brand = rel<Brand>(series?.brand)
  const division = rel<Division>(series?.division)
  const [allDocs, variants] = await Promise.all([
    getDocumentsFor({ productId: product.id, seriesId: series?.id }),
    series ? getProductVariants(series.id, product.shape) : Promise.resolve([]),
  ])
  const videos = allDocs.filter((d) => d.type === 'video')
  // Generovaný technický list (z dat) nahrazuje nahrané PDF technických listů.
  const techSheet = series ? techSheetItemLink(series, product, variants) : null
  const docs = allDocs.filter((d) => d.type !== 'video' && !(techSheet && d.type === 'tl'))

  const unit = series?.dimensionUnit ?? 'mm'
  const dim = typeof product.dimension === 'number' ? `${product.dimension} ${unit}` : null
  const shapeInfo = series?.shapes?.find((s) => s.code === product.shape)
  const shapeText = shapeInfo ? shapeInfo.description || `${shapeInfo.code} – ${shapeInfo.label}` : product.shape
  const seriesName = [brand?.name, series?.name].filter(Boolean).join(' ')
  const img = mediaUrl(product.images?.[0], 'large')
  const mainDoc = techSheet ? null : (docs.find((d) => d.type === 'tl') ?? docs[0])

  const keys: { label: string; value: string }[] = [
    ...(dim ? [{ label: series?.dimensionLabel?.replace(/^Rozměr\s+/i, '') || 'Rozměr', value: dim }] : []),
    ...(product.thread ? [{ label: series?.threadLabel || 'Závit', value: product.thread }] : []),
    ...(series?.commonParams ?? []).filter((p) => p.highlight).map((p) => ({ label: p.label, value: p.value })),
  ].slice(0, 4)

  // Chybějící atribut se nezobrazuje.
  const specs: { label: string; value: React.ReactNode }[] = [
    { label: 'Objednací číslo', value: <span className="mono">{product.code}</span> },
    ...(seriesName ? [{ label: 'Řada', value: seriesName }] : []),
    ...(shapeText ? [{ label: 'Tvar', value: shapeText }] : []),
    ...(dim ? [{ label: series?.dimensionLabel || 'Rozměr', value: dim }] : []),
    ...(product.thread ? [{ label: series?.threadLabel || 'Závit', value: product.thread }] : []),
    ...(product.params ?? []).map((p) => ({ label: p.label, value: p.value })),
    ...(series?.commonParams ?? []).map((p) => ({ label: p.label, value: p.value })),
    ...(product.unit ? [{ label: 'Měrná jednotka', value: product.unit }] : []),
    ...(product.ean ? [{ label: 'EAN', value: <span className="mono">{product.ean}</span> }] : []),
    ...(brand?.manufacturer ? [{ label: 'Výrobce', value: brand.manufacturer }] : []),
  ]

  const productLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.code,
    ...(product.ean ? { gtin13: product.ean } : {}),
    ...(product.subtitle ? { description: product.subtitle } : {}),
    ...(brand ? { brand: { '@type': 'Brand', name: brand.name } } : {}),
    ...(img ? { image: img } : {}),
  }

  return (
    <>
      <Breadcrumbs
        items={[
          { label: 'Produkty', href: urls.products },
          ...(division?.slug ? [{ label: division.name, href: urls.division(division.slug) }] : []),
          ...(division?.slug && brand ? [{ label: brand.name, href: `${urls.division(division.slug)}#${brand.slug}` }] : []),
          ...(series?.slug ? [{ label: series.name, href: urls.series(series.slug) }] : []),
          { label: product.name },
        ]}
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd).replace(/</g, '\\u003c') }} />
      <section className="prod">
        <div className="container">
          <div className="gallery">
            <div className="main">{img && <img src={img} alt={mediaAlt(product.images?.[0], product.name)} />}</div>
            {(product.images?.length ?? 0) > 1 && (
              <div className="thumbs" style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                {product.images!.slice(1).map((m, i) => (
                  <a key={i} href={mediaUrl(m, 'large') ?? '#'} target="_blank" rel="noopener">
                    <img src={mediaUrl(m, 'thumb') ?? ''} alt={mediaAlt(m, product.name)} width={80} height={80} />
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="pinfo">
            <div className="chips">
              {brand && <span className="chip">{brand.name}</span>}
              {division && <span className="chip">{division.name}</span>}
              {series?.media && <span className="chip">{series.media}</span>}
              {product.bcStatus === 'sale' && <span className="chip sale-chip">Výprodej</span>}
            </div>
            <h1>
              {product.name}
              {product.subtitle ? ` – ${product.subtitle.toLowerCase()}` : ''}
            </h1>
            <div className="meta">
              <span>
                Objednací číslo{' '}
                <strong className="mono" style={{ color: 'var(--navy)' }}>
                  {product.code}
                </strong>
              </span>
              {series?.slug && (
                <span>
                  Řada{' '}
                  <Link href={urls.series(series.slug)} style={{ fontWeight: 600, textDecoration: 'none' }}>
                    {series.name}
                  </Link>
                </span>
              )}
            </div>
            {(series?.lead || series?.summary) && <p style={{ fontSize: 17, lineHeight: 1.6 }}>{series.lead || series.summary}</p>}
            {keys.length > 0 && (
              <div className="keys">
                {keys.map((k) => (
                  <div key={k.label}>
                    <span>{k.label}</span>
                    <b>{k.value}</b>
                  </div>
                ))}
              </div>
            )}
            <div className="ctas" style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link className="btn btn-primary" href={urls.dealers}>
                <Icon name="pin" />
                Kde koupit
              </Link>
              {techSheet && (
                <a className="btn btn-outline" href={techSheet.href} target="_blank" rel="noopener">
                  <Icon name="file" />
                  Technický list (PDF)
                </a>
              )}
              {mainDoc && (
                <a className="btn btn-outline" href={documentUrl(mainDoc)} target="_blank" rel="noopener">
                  <Icon name="file" />
                  {docTypeMeta(mainDoc.type).label}
                </a>
              )}
            </div>
            <div className="note">
              <Icon name="pin" />
              Zboží prodávají naši obchodní partneři – ceny a dostupnost ověříte v prodejní síti.
            </div>
          </div>
        </div>
      </section>
      <div className="container two">
        <section>
          <h2>Technické parametry</h2>
          <dl className="params">
            {specs.map((p, i) => (
              <div key={i}>
                <dt>{p.label}</dt>
                <dd>{p.value}</dd>
              </div>
            ))}
          </dl>
        </section>
        {(docs.length > 0 || techSheet) && (
          <section>
            <h2>Soubory ke stažení</h2>
            <div className="files">
              {techSheet && (
                <a className="card file" href={techSheet.href} target="_blank" rel="noopener">
                  <span className="ibox">
                    <Icon name={docTypeMeta('tl').icon} />
                  </span>
                  <b>Technický list – {techSheet.label}</b>
                  <span>PDF · vždy aktuální</span>
                </a>
              )}
              {docs.map((d) => (
                <a key={d.id} className="card file" href={documentUrl(d)} target="_blank" rel="noopener">
                  <span className="ibox">
                    <Icon name={docTypeMeta(d.type).icon} />
                  </span>
                  <b>{d.title}</b>
                  <span>
                    {d.type === 'video' ? 'Video' : [d.mimeType === 'application/pdf' || !d.mimeType ? 'PDF' : d.mimeType, formatBytes(d.filesize)].filter(Boolean).join(' · ')}
                  </span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
      {(product.description || videos.length > 0) && (
        <div className="container two">
          {product.description && (
            <section>
              <h2>Popis produktu</h2>
              <div className="prose">
                {product.description.split(/\n\s*\n/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}
          {videos.length > 0 && (
            <section>
              <h2>Video</h2>
              {videos.map((v) => (
                <VideoEmbed key={v.id} title={v.title} url={v.externalUrl} />
              ))}
            </section>
          )}
        </div>
      )}
      {variants.length > 1 && series?.slug && (
        <section className="vars">
          <div className="container">
            <div className="sec-head">
              <h2>Další rozměry{product.shape ? ` – tvar ${product.shape}` : ''}</h2>
              <Link className="link-arrow" href={urls.series(series.slug)}>
                Celá řada {series.name}
                <Icon name="arrow" />
              </Link>
            </div>
            <div className="tbl-wrap">
              <table className="vt">
                <thead>
                  <tr>
                    <th>Kód</th>
                    <th>Označení</th>
                    <th>{series.dimensionLabel?.replace(/^Rozměr\s+/i, '') || 'Rozměr'}</th>
                    <th>{series.threadLabel || 'Závit'}</th>
                  </tr>
                </thead>
                <tbody>
                  {variants.map((x) => (
                    <tr key={x.id} className={x.id === product.id ? 'cur' : ''}>
                      <td className="mono" style={{ fontSize: 14 }}>
                        {x.code}
                      </td>
                      <td>
                        {x.id === product.id ? (
                          <strong>{x.name}</strong>
                        ) : (
                          <Link href={urls.product(x.code)} style={{ fontWeight: 600, textDecoration: 'none' }}>
                            {x.name}
                          </Link>
                        )}
                      </td>
                      <td>{typeof x.dimension === 'number' ? `${x.dimension} ${unit}` : '–'}</td>
                      <td>{x.thread || '–'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
      <div className="sticky-buy">
        <Link className="btn btn-primary" href={urls.dealers}>
          <Icon name="pin" />
          Kde koupit
        </Link>
        {techSheet && (
          <a className="btn btn-outline" href={techSheet.href} target="_blank" rel="noopener" aria-label="Technický list (PDF)" style={{ padding: '0 16px' }}>
            <Icon name="file" />
          </a>
        )}
        {mainDoc && (
          <a className="btn btn-outline" href={documentUrl(mainDoc)} target="_blank" rel="noopener" aria-label={mainDoc.title} style={{ padding: '0 16px' }}>
            <Icon name="file" />
          </a>
        )}
      </div>
    </>
  )
}
