import Link from 'next/link'
import React from 'react'

import { urls } from '@/lib/urls'
import type { Brand, Division } from '@/payload-types'

import { MaterialArt } from './home/illustrations'
import { Icon } from './Icon'

type Props = { divisions: Division[]; brandsByDivision: Map<number, Brand[]> }

/** Dlaždice divizí s čárovou animací materiálu – úvodní stránka i stránka Produkty (animace řídí MotionLayer). */
export const DivisionTiles = ({ divisions, brandsByDivision }: Props) => (
  <div className="d-tiles">
    {divisions.map((d, i) => {
      const brands = brandsByDivision.get(d.id) ?? []
      const inner = (
        <>
          <span className="img">
            <MaterialArt slug={d.slug ?? ''} />
          </span>
          <span className="n">{String(i + 1).padStart(2, '0')}</span>
          <span className="t">{d.name}</span>
          <span className="p">{d.perex}</span>
          {brands.length > 0 && <span className="b">{brands.map((b) => b.name).join(' · ')}</span>}
          {d.status === 'upcoming' ? <span className="chip">Připravujeme</span> : <Icon name="arrow" />}
        </>
      )
      return d.status === 'upcoming' ? (
        <div key={d.id} className="d-tile soon" data-reveal>
          {inner}
        </div>
      ) : (
        <Link key={d.id} className="d-tile" href={urls.division(d.slug!)} data-reveal>
          {inner}
        </Link>
      )
    })}
  </div>
)
