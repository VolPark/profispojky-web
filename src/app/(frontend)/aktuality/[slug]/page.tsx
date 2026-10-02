/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { RichText } from '@/components/site/RichText'
import { docTypeMeta } from '@/lib/doc-types'
import { formatBytes, formatDate } from '@/lib/format'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { newsCategoryLabel } from '@/lib/news'
import { documentUrl, getNews, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Division, Document } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const n = await getNews((await params).slug)
  if (!n) return {}
  const img = mediaUrl(n.meta?.image ?? n.image, 'large')
  return {
    title: n.meta?.title || n.title,
    description: n.meta?.description || n.perex,
    openGraph: { type: 'article', publishedTime: n.publishedAt, ...(img ? { images: [img] } : {}) },
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const news = await getNews((await params).slug)
  if (!news) notFound()
  const division = rel<Division>(news.division)
  const attachments = (news.attachments ?? []).map((a) => rel<Document>(a)).filter(Boolean) as Document[]
  const img = mediaUrl(news.image, 'large')

  return (
    <>
      <Breadcrumbs items={[{ label: 'Aktuality', href: urls.news }, { label: news.title }]} />
      <section className="section">
        <article className="container article">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            {newsCategoryLabel(news.category) && <span className="chip">{newsCategoryLabel(news.category)}</span>}
            {division?.slug && (
              <Link className="chip" href={urls.division(division.slug)} style={{ textDecoration: 'none' }}>
                {division.name}
              </Link>
            )}
            <time className="date" dateTime={news.publishedAt}>
              {formatDate(news.publishedAt)}
            </time>
          </div>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', marginTop: 16 }}>{news.title}</h1>
          <p className="lead" style={{ marginTop: 16 }}>
            {news.perex}
          </p>
          {img && <img className="article-hero" src={img} alt={mediaAlt(news.image)} />}
          <RichText data={news.body} />
          {attachments.length > 0 && (
            <div className="attachments">
              <h2 style={{ fontSize: 22 }}>Přílohy</h2>
              {attachments.map((d) => (
                <a key={d.id} className="link-arrow" href={documentUrl(d)} target="_blank" rel="noopener">
                  <Icon name={docTypeMeta(d.type).icon} />
                  {d.title}
                  {d.filesize ? ` (PDF, ${formatBytes(d.filesize)})` : ''}
                </a>
              ))}
            </div>
          )}
          <p style={{ marginTop: 48 }}>
            <Link className="link-arrow" href={urls.news}>
              Všechny aktuality
              <Icon name="arrow" />
            </Link>
          </p>
        </article>
      </section>
    </>
  )
}
