/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { RichText } from '@/components/site/RichText'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { findRedirect, getPage } from '@/lib/queries'
import { urlForDoc } from '@/lib/urls'

type Props = { params: Promise<{ slug: string[] }>; searchParams: Promise<Record<string, string | string[] | undefined>> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  if (slug.length !== 1) return {}
  const page = await getPage(slug[0])
  if (!page) return {}
  return { title: page.meta?.title || page.title, description: page.meta?.description || page.lead || undefined }
}

/** Stará URL z profispojky.cz → 301 na novou stránku (správa v adminu: Přesměrování). */
const tryRedirect = async (path: string, search: string) => {
  const candidates = search ? [`${path}?${search}`, path] : [path]
  for (const from of candidates) {
    const r = await findRedirect(from)
    if (!r?.to) continue
    if (r.to.type === 'custom' && r.to.url) permanentRedirect(r.to.url)
    const ref = r.to.reference
    if (ref && typeof ref.value === 'object' && ref.value) {
      const url = urlForDoc(ref.relationTo, ref.value as { slug?: string; code?: string })
      if (url) permanentRedirect(url)
    }
  }
}

export default async function GenericPage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])
  const page = slug.length === 1 ? await getPage(slug[0]) : null

  if (!page) {
    const search = new URLSearchParams(
      Object.entries(sp).flatMap(([k, v]) => (Array.isArray(v) ? v.map((x) => [k, x]) : v !== undefined ? [[k, v]] : [])),
    ).toString()
    await tryRedirect(`/${slug.map(decodeURIComponent).join('/')}`, search)
    notFound()
  }

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
              <div key={block.id ?? i} className="container cards3" style={spacing}>
                {(block.items ?? []).map((c) => (
                  <div key={c.id} className="card">
                    <h3>{c.title}</h3>
                    <p style={{ color: 'var(--gray)' }}>{c.text}</p>
                  </div>
                ))}
              </div>
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
    </>
  )
}
