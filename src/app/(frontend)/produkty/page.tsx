import type { Metadata } from 'next'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DivisionGrid, ProductTypes } from '@/components/site/DivisionGrid'
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
      <section className="section">
        <div className="container">
          <DivisionGrid divisions={divisions.filter((d) => d.status === 'active')} brandsByDivision={brandsByDivision} />
          <ProductTypes types={types} />
        </div>
      </section>
    </>
  )
}
