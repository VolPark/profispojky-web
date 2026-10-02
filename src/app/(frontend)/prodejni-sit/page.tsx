import type { Metadata } from 'next'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { DealersClient } from '@/components/site/DealersClient'
import { HelpBox } from '@/components/site/HelpBox'
import { getDealerRegions, getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Kde koupit – prodejní síť',
  description: 'Produkty PROFI SPOJKY koupíte u obchodních partnerů v České republice a na Slovensku. Vyhledejte nejbližší prodejní místo.',
}

export default async function DealersPage() {
  const [regions, settings] = await Promise.all([getDealerRegions(), getSettings()])
  const total = regions.reduce((a, r) => a + r.p.length, 0)
  return (
    <>
      <Breadcrumbs items={[{ label: 'Prodejní síť' }]} />
      <DealersClient regions={regions}>
        <div className="eyebrow">Prodejní síť</div>
        <h1>Kde koupit</h1>
        <p className="lead">
          Naše produkty nabízíme výhradně přes obchodní partnery. Najdete je na <strong>{total}</strong> prodejních místech v České
          republice a na Slovensku.
        </p>
      </DealersClient>
      <HelpBox
        settings={settings}
        title="Nenašli jste partnera ve svém okolí?"
        text={`Ozvěte se nám a doporučíme nejbližší prodejní místo. ${settings.hours ?? ''}.`}
      />
    </>
  )
}
