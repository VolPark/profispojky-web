/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import { divisionParams } from '@/lib/static-params'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { HelpBox } from '@/components/site/HelpBox'
import { Icon } from '@/components/site/Icon'
import { RichText } from '@/components/site/RichText'
import { mediaUrl } from '@/lib/media'
import { documentUrl, getDivision, getDivisionBrands, getDivisions, getSettings, rel } from '@/lib/queries'
import { urls } from '@/lib/urls'
import type { Document } from '@/payload-types'

type Props = { params: Promise<{ slug: string }> }

// Všechny stránky se předgenerují při buildu (static-params.ts), nové při první návštěvě.
export const generateStaticParams = divisionParams

const plural = (n: number) => (n === 1 ? 'produktová řada' : n >= 2 && n <= 4 ? 'produktové řady' : 'produktových řad')

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const division = await getDivision((await params).slug)
  if (!division) return {}
  return {
    title: division.meta?.title || `Divize ${division.name}`,
    description: division.meta?.description || division.perex,
  }
}

export default async function DivisionPage({ params }: Props) {
  const { slug } = await params
  const division = await getDivision(slug)
  if (!division) notFound()
  const [groups, all, settings] = await Promise.all([getDivisionBrands(division.id), getDivisions(), getSettings()])
  const others = all.filter((d) => d.id !== division.id && d.status === 'active')
  const catalogDoc = rel<Document>(division.catalogDocument)
  const img = mediaUrl(division.image, 'large')

  return (
    <>
      <Breadcrumbs items={[{ label: 'Produkty', href: urls.products }, { label: division.name }]} />
      <section className="page-hero div-hero">
        <div className="container">
          <div>
            <div className="eyebrow">Divize</div>
            <h1>{division.name}</h1>
            <p className="lead">{division.perex}</p>
            {groups.length > 0 && (
              <div className="anchors">
                {groups.map(({ brand }) => (
                  <a key={brand.id} href={`#${brand.slug}`}>
                    {brand.name}
                  </a>
                ))}
              </div>
            )}
            {catalogDoc && (
              <div style={{ marginTop: 20 }}>
                <a className="btn btn-outline btn-sm" href={documentUrl(catalogDoc)} target="_blank" rel="noopener">
                  <Icon name="file" />
                  Katalog divize {division.name} (PDF)
                </a>
              </div>
            )}
            {others.length > 0 && (
              <div className="other-div">
                Další divize:{' '}
                {others.map((d) => (
                  <Link key={d.id} href={urls.division(d.slug!)}>
                    {d.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
          {img && (
            <div className="imgbox">
              <img src={img} alt={`Výrobky divize ${division.name}`} />
            </div>
          )}
        </div>
      </section>

      {division.body && (
        <section style={{ paddingTop: 56 }}>
          <div className="container">
            <RichText data={division.body} />
          </div>
        </section>
      )}

      <section style={{ padding: '72px 0 40px' }}>
        <div className="container">
          {groups.length === 0 && <p>Katalog divize připravujeme.</p>}
          {groups.map(({ brand, series }) => (
            <section key={brand.id} className="brand" id={brand.slug ?? undefined} aria-labelledby={`${brand.slug}-h`}>
              <div>
                <h2 id={`${brand.slug}-h`}>{brand.name}</h2>
                <p>{brand.description}</p>
                <span className="cnt">
                  {series.length} {plural(series.length)}
                </span>
              </div>
              <div className="lines">
                {series.map((s) => (
                  <Link key={s.id} className="card line" href={urls.series(s.slug!)}>
                    <span>
                      <b>{s.name}</b>
                      <span>{s.summary}</span>
                    </span>
                    <Icon name="chev" />
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
      <HelpBox
        settings={settings}
        title="Potřebujete poradit s výběrem?"
        text={`Technické poradenství po telefonu nebo e-mailem, ${settings.hours ?? ''}.`}
      />
    </>
  )
}
