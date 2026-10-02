/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { LibraryClient, type LibraryDoc } from '@/components/site/LibraryClient'
import { DOC_TYPES, docTypeMeta } from '@/lib/doc-types'
import { formatBytes } from '@/lib/format'
import { documentUrl, getLibrary, rel } from '@/lib/queries'
import type { Brand, Division } from '@/payload-types'

export const metadata: Metadata = {
  title: 'Knihovna médií',
  description: 'Katalogy, letáky, technické listy, certifikáty, prohlášení o shodě, montážní návody a videa ke stažení.',
}

type Props = { searchParams: Promise<{ typ?: string }> }

export default async function LibraryPage({ searchParams }: Props) {
  const { typ } = await searchParams
  const all = await getLibrary()
  const featured = all.find((d) => d.featured)

  const docs: LibraryDoc[] = all
    .filter((d) => d.id !== featured?.id)
    .map((d) => {
      const meta = docTypeMeta(d.type)
      const isVideo = d.type === 'video'
      const isFile = Boolean(d.url && !d.externalUrl)
      return {
        id: d.id,
        type: d.type,
        typeLabel: meta.plural,
        icon: meta.icon,
        title: d.title,
        divisions: (d.divisions ?? []).map((x) => rel<Division>(x)?.name).filter(Boolean) as string[],
        brands: (d.brands ?? []).map((x) => rel<Brand>(x)?.name).filter(Boolean) as string[],
        fmt: isVideo ? 'Video' : ['PDF', formatBytes(d.filesize)].filter(Boolean).join(' · '),
        url: documentUrl(d),
        isVideo,
        isFile,
      }
    })

  const usedTypes = new Set(docs.map((d) => d.type))
  const types = DOC_TYPES.filter((t) => usedTypes.has(t.value)).map((t) => ({ value: t.value, label: t.plural }))
  const brands = [...new Set(docs.flatMap((d) => d.brands))].sort((a, b) => a.localeCompare(b, 'cs'))
  const divisions = [...new Set(docs.flatMap((d) => d.divisions))]

  return (
    <>
      <Breadcrumbs items={[{ label: 'Knihovna médií' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Ke stažení</div>
          <h1>Knihovna médií</h1>
          <p className="lead">Katalogy, letáky, technické listy, certifikáty, prohlášení o shodě, montážní návody a videa na jednom místě.</p>
        </div>
      </section>
      <section id="library" style={{ padding: '48px 0 96px' }}>
        <div className="container">
          {featured && (
            <a className="featured" href={documentUrl(featured)} target="_blank" rel="noopener">
              <span className="cover">
                <img src="/logo.svg" alt="" />
                {featured.edition && <span>Katalog {featured.edition}</span>}
              </span>
              <span>
                <span className="eyebrow" style={{ color: 'var(--blue)' }}>
                  Hlavní katalog
                </span>
                <span className="t">{featured.title}</span>
                <small>
                  {['Všechny divize a značky', 'PDF', formatBytes(featured.filesize), featured.edition ? `vydání ${featured.edition}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </small>
              </span>
              <span className="btn btn-primary">
                <Icon name="file" />
                Stáhnout PDF
              </span>
            </a>
          )}
          <LibraryClient docs={docs} types={types} brands={brands} divisions={divisions} initialType={typ} />
        </div>
      </section>
    </>
  )
}
