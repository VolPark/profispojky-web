/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { MotionLayer } from '@/components/site/MotionLayer'
import { formatDate } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { newsCategoryLabel } from '@/lib/news'
import { getNewsList } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { News } from '@/payload-types'

export const metadata: Metadata = { title: 'Aktuality', description: 'Novinky v sortimentu, veletrhy a školení PROFI SPOJKY.' }

const Meta = ({ n }: { n: News }) => (
  <div className="news-meta">
    {newsCategoryLabel(n.category) && <span className="chip">{newsCategoryLabel(n.category)}</span>}
    <span className="date">{formatDate(n.publishedAt)}</span>
  </div>
)

export default async function NewsPage() {
  const news = await getNewsList(100)
  const [lead, ...rest] = news
  return (
    <>
      <Breadcrumbs items={[{ label: 'Aktuality' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Novinky</div>
          <h1>Aktuality</h1>
          <p className="lead">Novinky v sortimentu, veletrhy a školení.</p>
        </div>
      </section>
      <section className="section news-page">
        <div className="container">
          {news.length === 0 && <p>Zatím žádné aktuality.</p>}
          {/* redakční rozvržení: nejnovější zpráva velká, ostatní v mřížce (jako úvodní stránka – bez krabic, linky) */}
          {lead && (
            <article className="news-lead" data-reveal>
              <Link className="img" href={urls.newsDetail(lead.slug!)} tabIndex={-1} aria-hidden="true">
                {mediaUrl(lead.image) && <img src={mediaUrl(lead.image, 'large')!} alt="" />}
              </Link>
              <div className="body">
                <Meta n={lead} />
                <h2>
                  <Link href={urls.newsDetail(lead.slug!)}>{lead.title}</Link>
                </h2>
                {lead.perex && <p>{lead.perex}</p>}
                <Link className="btn btn-navy" href={urls.newsDetail(lead.slug!)}>
                  Číst článek
                  <Icon name="arrow" />
                  <span className="sr"> – {lead.title}</span>
                </Link>
              </div>
            </article>
          )}
          {rest.length > 0 && (
            <div className="news-grid">
              {rest.map((n) => (
                <article key={n.id} className="news-card" data-reveal>
                  <Link className="img" href={urls.newsDetail(n.slug!)} tabIndex={-1} aria-hidden="true">
                    {mediaUrl(n.image) && <img src={mediaUrl(n.image, 'card')!} alt="" loading="lazy" />}
                  </Link>
                  <Meta n={n} />
                  <h3>
                    <Link href={urls.newsDetail(n.slug!)}>{n.title}</Link>
                  </h3>
                  {n.perex && <p>{n.perex}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
      <MotionLayer />
    </>
  )
}
