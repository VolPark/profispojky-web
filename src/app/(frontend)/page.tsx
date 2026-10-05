/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { ProductTypes } from '@/components/site/DivisionGrid'
import { HomeMotion } from '@/components/site/home/HomeMotion'
import { Icon } from '@/components/site/Icon'
import { formatDate } from '@/lib/format'
import { newsCategoryLabel as categoryLabel } from '@/lib/news'
import { asMedia, mediaAlt, mediaUrl } from '@/lib/media'
import {
  getAllSeries,
  getBrandLogos,
  getBrandsByDivision,
  getDivisions,
  getHomepage,
  getNewsList,
  getProductTypes,
  rel,
} from '@/lib/queries'
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

/** „Spojky pro *vodu, plyn*“ → slova pro postupné zobrazení, část v hvězdičkách zvýrazněná. */
function titleWords(title: string) {
  return title.split(/(\*[^*]+\*)/).flatMap((part) => {
    const accent = part.startsWith('*') && part.endsWith('*')
    return part
      .replace(/^\*|\*$/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, accent }))
  })
}

export default async function HomePage() {
  const [home, divisions, brandsByDivision, types, news, series, brandLogos] = await Promise.all([
    getHomepage(),
    getDivisions(),
    getBrandsByDivision(),
    getProductTypes(),
    getNewsList(3),
    getAllSeries(),
    getBrandLogos(),
  ])
  const featured = rel<Series>(home.featuredSeries)
  const [lead, ...rest] = news
  // pás produktů: řady s dostatečně velkou fotkou
  const strip = series.filter((s) => (asMedia(s.image)?.width ?? 0) >= 500 && s.slug).slice(0, 16)
  const story = asMedia(home.storyImage)
  const words = titleWords(home.title)
  const manifesto = (home.lead ?? '').split(/\s+/).filter(Boolean)

  return (
    <div className="home">
      {/* animace zapnout ještě před vykreslením, ať obsah při načtení neproblikne */}
      <script
        dangerouslySetInnerHTML={{
          __html: "if(!matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('motion')",
        }}
      />
      {/* 1 – úvod: značka, ne katalog */}
      <section className="h-hero" aria-labelledby="h-title">
        <svg className="h-flow" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M-40 620 C 240 620 300 380 560 380 S 900 560 1120 470 S 1380 200 1500 220" />
          <path d="M-40 690 C 260 690 360 470 600 470 S 960 640 1180 560 S 1400 320 1500 330" />
          <path d="M-40 560 C 200 560 260 300 520 300 S 860 470 1080 380 S 1360 90 1500 110" />
        </svg>
        <div className="container h-hero-in">
          {home.eyebrow && (
            <div className="eyebrow" data-reveal>
              {home.eyebrow}
            </div>
          )}
          <h1 id="h-title" className="h-title">
            {words.map(({ w, accent }, i) => (
              <React.Fragment key={i}>
                <span className={accent ? 'w acc' : 'w'} style={{ '--i': i } as React.CSSProperties}>
                  <span>{w}</span>
                </span>{' '}
              </React.Fragment>
            ))}
          </h1>
          <div className="h-hero-foot" data-reveal>
            <div className="ctas">
              <Link className="btn btn-navy btn-lg" href={urls.products}>
                Katalog produktů
                <Icon name="arrow" />
              </Link>
              <Link className="btn btn-ghost btn-lg" href={urls.dealers}>
                <Icon name="pin" />
                Kde koupit
              </Link>
            </div>
            {featured?.slug && (
              <Link className="h-featured" href={urls.series(featured.slug)}>
                <span className="k">{rel<Brand>(featured.brand)?.name} {featured.name}</span>
                <b>{home.featuredText || featured.summary}</b>
                <Icon name="arrow" />
              </Link>
            )}
            <a className="h-scroll" href="#kdo-jsme" aria-label="Pokračovat dolů">
              <span>Scroll</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2 – pás produktů */}
      {strip.length > 3 && (
        <section className="h-strip" aria-label="Výběr z produktových řad">
          <div className="track">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1 || undefined}>
                {strip.map((s) => (
                  <li key={s.id}>
                    <Link href={urls.series(s.slug!)} tabIndex={copy === 1 ? -1 : undefined}>
                      <span className="ph">
                        <img src={mediaUrl(s.image, 'card') ?? ''} alt="" loading="lazy" />
                      </span>
                      <span className="cap">
                        <small>{rel<Brand>(s.brand)?.name}</small>
                        {s.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </section>
      )}

      {/* 3 – manifest */}
      {manifesto.length > 0 && (
        <section id="kdo-jsme" className="h-manifesto" aria-label="Kdo jsme">
          <div className="container">
            <div className="side">Kdo jsme</div>
            <div>
              <p className="big" data-fill>
                {manifesto.map((w, i) => (
                  <span key={i}>{w} </span>
                ))}
              </p>
              <Link className="link-arrow" href={urls.page('o-firme')}>
                O firmě
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4 – čísla */}
      {!!home.stats?.length && (
        <section className="h-numbers on-dark" aria-label="PROFI SPOJKY v číslech">
          <div className="container">
            <div className="eyebrow">PROFI SPOJKY v číslech</div>
            <div className="grid">
              {home.stats.map((s) => (
                <div key={s.id} data-reveal>
                  <b data-count>{s.value}</b>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 5 – značky */}
      {brandLogos.length > 0 && (
        <section className="h-brands" aria-labelledby="znacky-h">
          <div className="container">
            <div className="h-head" data-reveal>
              <h2 id="znacky-h">Značky, které zastupujeme</h2>
              <Link className="link-arrow" href={urls.brands}>
                Všechny značky
                <Icon name="arrow" />
              </Link>
            </div>
            <ul className="logos">
              {brandLogos.map((b) => (
                <li key={b.id} data-reveal>
                  <Link href={urls.brands} title={b.name}>
                    <img src={mediaUrl(b.logo, 'card') ?? ''} alt={b.name} loading="lazy" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* 6 – co děláme */}
      {!!home.pillars?.length && (
        <section className="h-story on-dark" aria-labelledby="story-h">
          <div className="container">
            {story && (
              <figure className="photo" data-reveal>
                <img src={mediaUrl(story, 'large') ?? ''} alt={mediaAlt(story)} loading="lazy" />
                {story.alt && <figcaption>{story.alt}</figcaption>}
              </figure>
            )}
            <div>
              <h2 id="story-h" data-reveal>
                Co pro vás děláme
              </h2>
              <ol className="pillars">
                {home.pillars.map((p, i) => (
                  <li key={p.id} data-reveal>
                    <span className="n">{String(i + 1).padStart(2, '0')}</span>
                    <div>
                      <h3>{p.title}</h3>
                      <p>{p.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      )}

      {/* 7 – sortiment */}
      <section className="h-divisions" aria-labelledby="divize-h">
        <div className="container">
          <div className="h-head" data-reveal>
            <div>
              <div className="eyebrow">Sortiment</div>
              <h2 id="divize-h">Produktové divize</h2>
            </div>
            <Link className="link-arrow" href={urls.products}>
              Všechny produkty
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <div className="d-tiles">
          {divisions.map((d, i) => {
            const brands = brandsByDivision.get(d.id) ?? []
            const inner = (
              <>
                <span className="img">{mediaUrl(d.image, 'card') && <img src={mediaUrl(d.image, 'card')!} alt="" loading="lazy" />}</span>
                <span className="n">{String(i + 1).padStart(2, '0')}</span>
                <span className="t">{d.name}</span>
                <span className="p">{d.perex}</span>
                {brands.length > 0 && <span className="b">{brands.map((b) => b.name).join(' · ')}</span>}
                {d.status === 'upcoming' ? <span className="chip">Připravujeme</span> : <Icon name="arrow" />}
              </>
            )
            return d.status === 'upcoming' ? (
              <div key={d.id} className="d-tile soon" data-reveal>
                {inner}
              </div>
            ) : (
              <Link key={d.id} className="d-tile" href={urls.division(d.slug!)} data-reveal>
                {inner}
              </Link>
            )
          })}
        </div>
        <div className="container h-find" data-reveal>
          <form action="/katalog" role="search">
            <label className="h-find-l" htmlFor="home-q">
              Hledáte konkrétní výrobek?
            </label>
            <div className="search-row">
              <div className="input-icon">
                <Icon name="search" />
                <input id="home-q" className="input" type="search" name="q" placeholder="Kód, název nebo rozměr – např. 30000007, BA 32" />
              </div>
              <button className="btn btn-navy" type="submit">
                Hledat
              </button>
            </div>
          </form>
          <ProductTypes types={types} />
        </div>
      </section>

      {/* 8 – aktuality */}
      {lead && (
        <section className="section section-alt" aria-labelledby="news-h">
          <div className="container">
            <div className="h-head" data-reveal>
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

      {/* 9 – knihovna */}
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
      <HomeMotion />
    </div>
  )
}
