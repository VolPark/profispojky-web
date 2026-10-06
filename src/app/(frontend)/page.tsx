/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { ProductTypes } from '@/components/site/DivisionGrid'
import { DivisionTiles } from '@/components/site/DivisionTiles'
import { MotionLayer } from '@/components/site/MotionLayer'
import { ElementIcon, NetworkArt, PinArt } from '@/components/site/home/illustrations'
import { Icon } from '@/components/site/Icon'
import { formatDate } from '@/lib/format'
import { homeText, type HomeCopyKey } from '@/lib/home-copy'
import { newsCategoryLabel as categoryLabel } from '@/lib/news'
import { mediaUrl } from '@/lib/media'
import {
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
  const words = title.split(/(\*[^*]+\*)/).flatMap((part) => {
    const accent = part.startsWith('*') && part.endsWith('*')
    return part
      .replace(/^\*|\*$/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => ({ w, accent }))
  })
  // samotná interpunkce za zvýrazněním („*teplo*.“) patří k předchozímu slovu
  return words.reduce<typeof words>((acc, x) => {
    if (acc.length && /^[.,!?;:…]+$/.test(x.w)) acc[acc.length - 1] = { ...acc[acc.length - 1], w: acc[acc.length - 1].w + x.w }
    else acc.push(x)
    return acc
  }, [])
}

export default async function HomePage() {
  const [home, divisions, brandsByDivision, types, news, brandLogos] = await Promise.all([
    getHomepage(),
    getDivisions(),
    getBrandsByDivision(),
    getProductTypes(),
    getNewsList(3),
    getBrandLogos(),
  ])
  const featured = rel<Series>(home.featuredSeries)
  const [lead, ...rest] = news
  const words = titleWords(home.title)
  const t = (k: HomeCopyKey) => homeText(home.copy, k)
  // manifest: první věta velká (rozsvěcí se), zbytek menším písmem vedle
  const manifestoText = t('manifesto')
  const cut = manifestoText.search(/[.!?]\s/)
  const manifesto = (cut > 0 ? manifestoText.slice(0, cut + 1) : manifestoText).split(/\s+/).filter(Boolean)
  const manifestoRest = cut > 0 ? manifestoText.slice(cut + 2).trim() : ''
  const band = t('bandWords')
    .split('·')
    .map((w) => w.trim())
    .filter(Boolean)
  const elements = band.slice(0, 3)
  const dealerStat = home.stats?.find((x) => /prodej/i.test(x.label))
  const makerStat = home.stats?.find((x) => /výrob/i.test(x.label))
  const makersLabel = makerStat ? `${makerStat.value} výrobců` : 'Výrobci'
  const dealersLabel = dealerStat ? `${dealerStat.value} prodejních míst` : 'Prodejní místa'

  return (
    <div className="home">
      {/* 1 – úvod: značka, ne katalog */}
      <section className="h-hero" aria-labelledby="h-title">
        <svg className="h-flow" viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <g className="lines">
            <path id="hf1" d="M-40 620 C 240 620 300 380 560 380 S 900 560 1120 470 S 1380 200 1500 220" />
            <path id="hf2" d="M-40 690 C 260 690 360 470 600 470 S 960 640 1180 560 S 1400 320 1500 330" />
            <path id="hf3" d="M-40 560 C 200 560 260 300 520 300 S 860 470 1080 380 S 1360 90 1500 110" />
          </g>
          {/* kapky, které potrubím „tečou“ */}
          <g className="drops">
            {[
              ['hf1', 9, 0],
              ['hf1', 9, 4.5],
              ['hf2', 12, 2],
              ['hf2', 12, 8],
              ['hf3', 14, 6],
            ].map(([id, dur, begin], i) => (
              <circle key={i} r={i % 2 ? 3 : 4.5}>
                <animateMotion dur={`${dur}s`} begin={`-${begin}s`} repeatCount="indefinite" rotate="auto">
                  <mpath href={`#${id}`} />
                </animateMotion>
              </circle>
            ))}
          </g>
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
          {home.lead && (
            <p className="h-lead" data-reveal>
              {home.lead}
            </p>
          )}
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

      {/* 2 – kdo jsme: krátké prohlášení + voda/plyn/teplo */}
      {manifesto.length > 0 && (
        <section id="kdo-jsme" className="h-manifesto" aria-labelledby="kdo-h">
          <div className="container">
            <div>
              <div className="eyebrow" id="kdo-h">
                Kdo jsme
              </div>
              <p className="big" data-fill>
                {manifesto.map((w, i) => (
                  <span key={i}>{w} </span>
                ))}
              </p>
            </div>
            <div className="side">
              {manifestoRest && (
                <p className="rest" data-reveal>
                  {manifestoRest}
                </p>
              )}
              {elements.length > 0 && (
                <ul className="elements">
                  {elements.map((w, i) => (
                    <li key={i} data-reveal>
                      <ElementIcon index={i} />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link className="link-arrow" href={urls.page('o-firme')} data-reveal>
                O firmě
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 3 – čísla */}
      {!!home.stats?.length && (
        <section className="h-numbers on-dark" aria-label="PROFI SPOJKY v číslech">
          <div className="container">
            <div className="eyebrow" data-reveal>
              PROFI SPOJKY v číslech
            </div>
            <h2 className="h-big" data-reveal>
              {t('numbersTitle')}
            </h2>
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

      {/* 4 – značky */}
      {brandLogos.length > 0 && (
        <section className="h-brands" aria-labelledby="znacky-h">
          <div className="container">
            <div className="h-head" data-reveal>
              <div>
                <div className="eyebrow">Značky, které zastupujeme</div>
                <h2 id="znacky-h">{t('brandsTitle')}</h2>
                <p className="h-sub">{t('brandsText')}</p>
              </div>
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

      {/* 5 – co děláme: tok výrobci → sklad → prodejci */}
      {!!home.pillars?.length && (
        <section className="h-story on-dark" aria-labelledby="story-h">
          <div className="container">
            <figure className="network" data-reveal>
              <NetworkArt makers={makersLabel} hub="Centrální sklad Jesenice" dealers={dealersLabel} />
            </figure>
            <div>
              <div className="eyebrow" data-reveal>
                Co pro vás děláme
              </div>
              <h2 id="story-h" data-reveal>
                {t('storyTitle')}
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

      {/* 6 – prodejní síť */}
      <section className="h-cta" aria-labelledby="cta-h">
        <div className="container">
          <div className="txt">
            <div className="eyebrow" data-reveal>
              Prodejní síť
            </div>
            <h2 id="cta-h" data-reveal>
              {t('ctaTitle')}
            </h2>
            <p data-reveal>{t('ctaText')}</p>
            <div className="btns" data-reveal>
              <Link className="btn btn-navy btn-lg" href={urls.dealers}>
                <Icon name="pin" />
                Najít prodejce
              </Link>
              <Link className="btn btn-ghost btn-lg" href={urls.contact}>
                Kontaktujte nás
                <Icon name="arrow" />
              </Link>
            </div>
          </div>
          <PinArt />
        </div>
      </section>

      {/* 7 – přechod na sortiment: pás slov posouvaný scrollem */}
      {band.length > 0 && (
        <div className="h-band" aria-hidden="true">
          <div className="row" data-drift>
            {[0, 1, 2].map((k) => (
              <span key={k}>
                {band.map((w, i) => (
                  <React.Fragment key={i}>
                    <b className={i % 2 ? 'o' : undefined}>{w}</b>
                    <i />
                  </React.Fragment>
                ))}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 8 – sortiment: materiály a hledání */}
      <section className="h-divisions" aria-labelledby="divize-h">
        <div className="container">
          <div className="h-head" data-reveal>
            <div>
              <div className="eyebrow">Sortiment</div>
              <h2 id="divize-h">{t('divisionsTitle')}</h2>
            </div>
            <Link className="link-arrow" href={urls.products}>
              Všechny produkty
              <Icon name="arrow" />
            </Link>
          </div>
        </div>
        <DivisionTiles divisions={divisions} brandsByDivision={brandsByDivision} />
        <div className="container h-find" data-reveal>
          <form action="/katalog" role="search">
            <label className="h-find-l" htmlFor="home-q">
              {t('findTitle')}
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

      {/* 9 – aktuality */}
      {lead && (
        <section className="section section-alt" aria-labelledby="news-h">
          <div className="container">
            <div className="h-head" data-reveal>
              <div>
                <div className="eyebrow">Novinky</div>
                <h2 id="news-h">Aktuality</h2>
              </div>
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

      {/* 10 – knihovna */}
      <section className="section" aria-labelledby="lib-h">
        <div className="container lib-teaser">
          <div>
            <div className="eyebrow">Ke stažení</div>
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
      <MotionLayer />
    </div>
  )
}
