/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { DivisionGrid, ProductTypes } from '@/components/site/DivisionGrid'
import { Icon } from '@/components/site/Icon'
import { formatDate } from '@/lib/format'
import { newsCategoryLabel as categoryLabel } from '@/lib/news'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getBrandsByDivision, getDivisions, getHomepage, getNewsList, getProductTypes, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Brand, Series } from '@/payload-types'

const LIB_TILES = [
  { icon: 'file', title: 'Kompletní katalog', sub: 'PDF ke stažení', t: 'katalog' },
  { icon: 'file', title: 'Technické listy', sub: 'Parametry výrobků', t: 'tl' },
  { icon: 'check', title: 'Certifikáty', sub: 'Platné certifikáty výrobků', t: 'cert' },
  { icon: 'file', title: 'Prohlášení o shodě', sub: 'Dle legislativy ČR', t: 'shoda' },
  { icon: 'tool', title: 'Montážní návody', sub: 'Postupy instalace', t: 'navod' },
  { icon: 'play', title: 'Videa', sub: 'Ukázky montáže', t: 'video' },
]

export default async function HomePage() {
  const [home, divisions, brandsByDivision, types, news] = await Promise.all([
    getHomepage(),
    getDivisions(),
    getBrandsByDivision(),
    getProductTypes(),
    getNewsList(3),
  ])
  const featured = rel<Series>(home.featuredSeries)
  const heroImgs = (home.heroImages ?? []).slice(0, 3)
  const [lead, ...rest] = news

  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            {home.eyebrow && <div className="eyebrow">{home.eyebrow}</div>}
            <h1>{home.title}</h1>
            {home.lead && <p className="lead">{home.lead}</p>}
            <form action="/katalog" role="search">
              <label className="label" htmlFor="hero-q">
                Hledat v katalogu
              </label>
              <div className="search-row" style={{ marginTop: 8 }}>
                <div className="input-icon">
                  <Icon name="search" />
                  <input
                    id="hero-q"
                    className="input"
                    style={{ height: 56 }}
                    type="search"
                    name="q"
                    placeholder="Kód, název nebo rozměr – např. 30000007, BA 32"
                  />
                </div>
                <button className="btn btn-navy" style={{ minHeight: 56 }} type="submit">
                  Hledat
                </button>
              </div>
            </form>
            <div className="ctas">
              <Link className="btn btn-primary" href={urls.products}>
                Katalog produktů
                <Icon name="arrow" />
              </Link>
              <Link className="btn btn-outline" href={urls.dealers}>
                <Icon name="pin" />
                Kde koupit
              </Link>
            </div>
            {!!home.stats?.length && (
              <div className="stats">
                {home.stats.map((s) => (
                  <div key={s.id}>
                    <b>{s.value}</b>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          {heroImgs.length > 0 && (
            <div className="hero-visual">
              {heroImgs.map((img, i) => (
                <img key={i} className={`hv${i + 1}`} src={mediaUrl(img, 'card') ?? ''} alt={mediaAlt(img)} />
              ))}
              {featured?.slug && (
                <Link className="hv-tag" href={urls.series(featured.slug)}>
                  <span className="chip">
                    {rel<Brand>(featured.brand)?.name} {featured.name}
                  </span>
                  <b>{home.featuredText || featured.summary}</b>
                  <span className="link-arrow">
                    Zobrazit řadu
                    <Icon name="arrow" />
                  </span>
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      <section className="section" aria-labelledby="divize-h">
        <div className="container">
          <div className="sec-head">
            <div>
              <div className="eyebrow">Sortiment</div>
              <h2 id="divize-h" style={{ marginTop: 12 }}>
                Produktové divize
              </h2>
              <p>Sortiment rozdělený podle materiálu. Každá divize obsahuje přehled značek a katalog s technickými parametry.</p>
            </div>
            <Link className="link-arrow" href={urls.products}>
              Všechny produkty
              <Icon name="arrow" />
            </Link>
          </div>
          <DivisionGrid divisions={divisions} brandsByDivision={brandsByDivision} />
          <ProductTypes types={types} />
        </div>
      </section>

      {!!home.usps?.length && (
        <section className="usp" aria-label="Výhody">
          <div className="container">
            {home.usps.map((u) => (
              <div key={u.id} className="item">
                <span className="ibox">
                  <Icon name={u.icon ?? 'check'} />
                </span>
                {u.text}
              </div>
            ))}
          </div>
        </section>
      )}

      {lead && (
        <section className="section section-alt" aria-labelledby="news-h">
          <div className="container">
            <div className="sec-head">
              <h2 id="news-h">Aktuality</h2>
              <Link className="link-arrow" href={urls.news}>
                Všechny aktuality
                <Icon name="arrow" />
              </Link>
            </div>
            <div className="news">
              <Link className="card news-feat" href={urls.newsDetail(lead.slug!)}>
                {mediaUrl(lead.image) && <img src={mediaUrl(lead.image, 'card')!} alt="" />}
                <div className="body">
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    {categoryLabel(lead.category) && <span className="chip">{categoryLabel(lead.category)}</span>}
                    <span className="date">{formatDate(lead.publishedAt)}</span>
                  </div>
                  <h3>{lead.title}</h3>
                  <p>{lead.perex}</p>
                  <span className="link-arrow">
                    Číst dál
                    <Icon name="arrow" />
                  </span>
                </div>
              </Link>
              {rest.length > 0 && (
                <div className="news-list">
                  {rest.map((n) => (
                    <Link key={n.id} className="card news-item" href={urls.newsDetail(n.slug!)}>
                      {mediaUrl(n.image) && <img src={mediaUrl(n.image, 'thumb')!} alt="" loading="lazy" />}
                      <div>
                        <span className="date">{formatDate(n.publishedAt)}</span>
                        <h3>{n.title}</h3>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      <section className="section" aria-labelledby="lib-h">
        <div className="container lib-teaser">
          <div>
            <h2 id="lib-h">Knihovna médií</h2>
            <p style={{ fontSize: 17, color: 'var(--gray)', margin: '12px 0 16px', lineHeight: 1.6 }}>
              Katalogy, letáky, certifikáty, prohlášení o shodě, montážní návody a videa na jednom místě.
            </p>
            <Link className="link-arrow" href={urls.library}>
              Otevřít knihovnu
              <Icon name="arrow" />
            </Link>
          </div>
          <div className="tiles">
            {LIB_TILES.map((t) => (
              <Link key={t.t} className="card tile" href={`${urls.library}?typ=${t.t}`}>
                <span className="ibox">
                  <Icon name={t.icon} />
                </span>
                <span>
                  <b>{t.title}</b>
                  <span>{t.sub}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
