/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { formatDate } from '@/lib/format'
import { mediaUrl } from '@/lib/media'
import { newsCategoryLabel } from '@/lib/news'
import { getNewsList } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const metadata: Metadata = { title: 'Aktuality', description: 'Novinky v sortimentu, veletrhy a školení PROFI SPOJKY.' }

export default async function NewsPage() {
  const news = await getNewsList(100)
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
      <section className="section">
        <div className="container" style={{ maxWidth: 1000 }}>
          {news.length === 0 && <p>Zatím žádné aktuality.</p>}
          {news.map((n) => (
            <article key={n.id} className="card news-feat" style={{ marginBottom: 24 }}>
              {mediaUrl(n.image) ? <img src={mediaUrl(n.image, 'card')!} alt="" loading="lazy" style={{ objectPosition: 'center' }} /> : <div />}
              <div className="body">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {newsCategoryLabel(n.category) && <span className="chip">{newsCategoryLabel(n.category)}</span>}
                  <span className="date">{formatDate(n.publishedAt)}</span>
                </div>
                <h2 style={{ fontSize: 26 }}>
                  <Link href={urls.newsDetail(n.slug!)} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {n.title}
                  </Link>
                </h2>
                <p>{n.perex}</p>
                <Link className="link-arrow" href={urls.newsDetail(n.slug!)}>
                  Číst dál
                  <Icon name="arrow" />
                  <span className="sr"> – {n.title}</span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  )
}
