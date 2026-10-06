/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import React from 'react'

import { pageParams } from '@/lib/static-params'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { MotionLayer } from '@/components/site/MotionLayer'
import { RichText } from '@/components/site/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { getPage } from '@/lib/queries'

type Props = { params: Promise<{ slug: string[] }> }

// Všechny stránky se předgenerují při buildu (static-params.ts), nové při první návštěvě.
// Přesměrování starých URL řeší src/proxy.ts.
export const generateStaticParams = pageParams

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug.length !== 1) return {}
  const page = await getPage(slug[0])
  if (!page) return {}
  return { title: page.meta?.title || page.title, description: page.meta?.description || page.lead || undefined }
}

export default async function GenericPage({ params }: Props) {
  const { slug } = await params
  const page = slug.length === 1 ? await getPage(slug[0]) : null
  if (!page) notFound()

  return (
    <>
      <Breadcrumbs items={[{ label: page.title }]} />
      <section className="page-hero">
        <div className="container">
          {page.eyebrow && <div className="eyebrow">{page.eyebrow}</div>}
          <h1>{page.title}</h1>
          {page.lead && <p className="lead">{page.lead}</p>}
        </div>
      </section>
      <section className="section">
        {(page.layout ?? []).map((block, i) => {
          const spacing = i > 0 ? { marginTop: 56 } : undefined
          if (block.blockType === 'content') {
            const img = mediaUrl(block.image, 'large')
            return img ? (
              <div key={block.id ?? i} className="container about" style={spacing}>
                <RichText data={block.text} />
                <figure className="about-photo">
                  <img src={img} alt={mediaAlt(block.image)} />
                  {block.caption && <figcaption>{block.caption}</figcaption>}
                </figure>
              </div>
            ) : (
              <div key={block.id ?? i} className="container" style={spacing}>
                <RichText data={block.text} />
              </div>
            )
          }
          if (block.blockType === 'cards') {
            return (
              <ol key={block.id ?? i} className="container pillars-light" style={spacing}>
                {(block.items ?? []).map((c, j) => (
                  <li key={c.id} data-reveal>
                    <span className="n">{String(j + 1).padStart(2, '0')}</span>
                    <h3>{c.title}</h3>
                    <p>{c.text}</p>
                  </li>
                ))}
              </ol>
            )
          }
          if (block.blockType === 'gallery') {
            return (
              <div key={block.id ?? i} className="container photo-row" style={spacing}>
                {(block.images ?? []).map((m, j) => (
                  <img key={j} src={mediaUrl(m, 'card') ?? ''} alt={mediaAlt(m)} loading="lazy" />
                ))}
              </div>
            )
          }
          return null
        })}
      </section>
      <MotionLayer />
    </>
  )
}
