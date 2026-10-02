/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { mediaUrl } from '@/lib/media'
import { getAllSeries, getProductTypes, rel, searchProducts } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Brand, Series } from '@/payload-types'

type Props = { searchParams: Promise<{ q?: string; typ?: string }> }

// Výsledky hledání závisí na dotazu – jediná stránka webu, která se vždy renderuje živě.
export const dynamic = 'force-dynamic'

export const metadata: Metadata = { title: 'Hledání v katalogu', robots: { index: false, follow: true } }

export default async function SearchPage({ searchParams }: Props) {
  const { q: rawQ = '', typ = '' } = await searchParams
  const q = rawQ.trim().slice(0, 100)
  const [res, allSeries, types] = await Promise.all([
    q || typ ? searchProducts(q, typ) : null,
    q ? getAllSeries() : Promise.resolve([] as Series[]),
    getProductTypes(),
  ])
  const needle = q.toLowerCase()
  const seriesHits = q
    ? allSeries.filter((s) => `${s.name} ${s.summary} ${rel<Brand>(s.brand)?.name ?? ''}`.toLowerCase().includes(needle)).slice(0, 8)
    : []

  return (
    <>
      <Breadcrumbs items={[{ label: 'Produkty', href: urls.products }, { label: typ ? typ : 'Hledání' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Katalog</div>
          <h1>{typ ? typ : q ? `Výsledky pro „${q}“` : 'Hledat v katalogu'}</h1>
          <form action="/katalog" role="search" style={{ marginTop: 24, maxWidth: 720 }}>
            {typ && <input type="hidden" name="typ" value={typ} />}
            <label className="sr" htmlFor="sq">
              Hledat v katalogu
            </label>
            <div className="search-row">
              <div className="input-icon">
                <Icon name="search" />
                <input id="sq" className="input" type="search" name="q" defaultValue={q} placeholder="Kód, název nebo rozměr" />
              </div>
              <button className="btn btn-navy" type="submit">
                Hledat
              </button>
            </div>
          </form>
        </div>
      </section>
      <section className="section">
        <div className="container">
          {seriesHits.length > 0 && (
            <div style={{ marginBottom: 40 }}>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>Produktové řady</h2>
              <div className="lines">
                {seriesHits.map((s) => (
                  <Link key={s.id} className="card line" href={urls.series(s.slug!)}>
                    <span>
                      <b>
                        {rel<Brand>(s.brand)?.name} {s.name}
                      </b>
                      <span>{s.summary}</span>
                    </span>
                    <Icon name="chev" />
                  </Link>
                ))}
              </div>
            </div>
          )}
          {res && (
            <>
              <h2 style={{ fontSize: 22, marginBottom: 16 }}>
                Položky <span style={{ color: 'var(--gray)', fontWeight: 500 }}>({res.totalDocs})</span>
              </h2>
              {res.docs.length > 0 ? (
                <div className="tbl-wrap">
                  <table className="cat search-results">
                    <thead>
                      <tr>
                        <th style={{ width: 64 }}>
                          <span className="sr">Obrázek</span>
                        </th>
                        <th style={{ width: 104 }}>Kód</th>
                        <th>Označení</th>
                        <th style={{ width: 92 }}>
                          <span className="sr">Akce</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {res.docs.map((p) => {
                        const s = rel<Series>(p.series)
                        const img = mediaUrl(p.images?.[0], 'thumb')
                        return (
                          <tr key={p.id}>
                            <td className="c-img">
                              {img ? (
                                <img className="thumb" src={img} alt="" loading="lazy" />
                              ) : (
                                <div className="thumb-ph">
                                  <Icon name="box" />
                                </div>
                              )}
                            </td>
                            <td className="c-code mono">{p.code}</td>
                            <td className="c-name">
                              <div className="nm">{p.name}</div>
                              <div className="ds">
                                {p.subtitle}
                                {s ? <span className="series"> · řada {s.name}</span> : null}
                              </div>
                            </td>
                            <td className="c-det" style={{ textAlign: 'right' }}>
                              <Link className="det" href={urls.product(p.code)}>
                                <span className="lbl">Detail</span>
                                <span className="sr"> {p.name}</span>
                                <Icon name="chev" />
                              </Link>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="card empty">
                  <strong style={{ color: 'var(--navy)' }}>Nic jsme nenašli.</strong>
                  <span style={{ color: 'var(--gray)' }}>Zkuste kód položky, rozměr (např. 32) nebo název řady.</span>
                </div>
              )}
            </>
          )}
          {types.length > 0 && (
            <div className="types" style={{ marginTop: 48 }}>
              <h2>Vyberte typ výrobku:</h2>
              <div className="list">
                {types.map((t) => (
                  <Link key={t} className="pill" href={urls.search(undefined, t)} aria-current={t === typ ? 'page' : undefined}>
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
