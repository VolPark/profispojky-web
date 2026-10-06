import type { Metadata } from 'next'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { ProductTypes } from '@/components/site/DivisionGrid'
import { DivisionTiles } from '@/components/site/DivisionTiles'
import { Icon } from '@/components/site/Icon'
import { MotionLayer } from '@/components/site/MotionLayer'
import { getBrandsByDivision, getDivisions, getProductTypes } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Produkty',
  description: 'Spojovací produkty a uzavírací armatury pro vodu, plyn a topení – rozdělené podle materiálu.',
}

export default async function ProductsPage() {
  const [divisions, brandsByDivision, types] = await Promise.all([getDivisions(), getBrandsByDivision(), getProductTypes()])
  return (
    <>
      <Breadcrumbs items={[{ label: 'Produkty' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Sortiment</div>
          <h1>Produkty</h1>
          <p className="lead">Spojovací produkty a uzavírací armatury pro vodu, plyn a topení – rozdělené podle materiálu.</p>
        </div>
      </section>
      <section className="h-divisions page-tiles" aria-label="Produktové divize">
        <DivisionTiles divisions={divisions.filter((d) => d.status === 'active')} brandsByDivision={brandsByDivision} />
        <div className="container h-find" data-reveal>
          <form action="/katalog" role="search">
            <label className="h-find-l" htmlFor="products-q">
              Víte přesně, co hledáte?
            </label>
            <div className="search-row">
              <div className="input-icon">
                <Icon name="search" />
                <input id="products-q" className="input" type="search" name="q" placeholder="Kód, název nebo rozměr – např. 30000007, BA 32" />
              </div>
              <button className="btn btn-navy" type="submit">
                Hledat
              </button>
            </div>
          </form>
          <ProductTypes types={types} />
        </div>
      </section>
      <MotionLayer />
    </>
  )
}
