/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next'
import Link from 'next/link'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { MotionLayer } from '@/components/site/MotionLayer'
import { mediaUrl } from '@/lib/media'
import { getBrandLogos, getBrandsOverview } from '@/lib/queries'
import { urls } from '@/lib/urls'

export const metadata: Metadata = {
  title: 'Značky',
  description: 'Zahraniční výrobci a značky, které PROFI SPOJKY zastupuje na českém a slovenském trhu.',
}

const rady = (n: number) => (n === 1 ? 'řada' : n >= 2 && n <= 4 ? 'řady' : 'řad')

export default async function BrandsPage() {
  const [brands, logos] = await Promise.all([getBrandsOverview(), getBrandLogos()])
  const logoOf = new Map(logos.map((b) => [b.id, mediaUrl(b.logo, 'card')]))
  return (
    <>
      <Breadcrumbs items={[{ label: 'Značky' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Zastoupení</div>
          <h1>Značky</h1>
          <p className="lead">Zahraniční výrobci a značky, které PROFI SPOJKY zastupuje na českém a slovenském trhu.</p>
        </div>
      </section>
      <section className="section">
        <div className="container brand-grid brand-grid-v2">
          {brands
            .filter((b) => b.seriesCount > 0)
            .map(({ brand, seriesCount, divisions }) => {
              const d = divisions[0]
              const meta = `${divisions.map((x) => x.name).join(', ')} · ${seriesCount} ${rady(seriesCount)}`
              return d?.slug ? (
                <Link key={brand.id} className="brand-card" href={`${urls.division(d.slug)}#${brand.slug}`} data-reveal>
                  <span className="logo-box">
                    {logoOf.get(brand.id) ? <img src={logoOf.get(brand.id)!} alt="" loading="lazy" /> : <span className="ph" aria-hidden="true">{brand.name.charAt(0)}</span>}
                  </span>
                  <b>{brand.name}</b>
                  <span>{meta}</span>
                  <span>{brand.description}</span>
                </Link>
              ) : null
            })}
        </div>
      </section>
      <MotionLayer />
    </>
  )
}
