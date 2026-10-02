/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { mediaUrl } from '@/lib/media'
import { urls } from '@/lib/urls'
import type { Brand, Division } from '@/payload-types'

import { Icon } from './Icon'

type Props = {
  divisions: Division[]
  brandsByDivision: Map<number, Brand[]>
}

export const DivisionGrid = ({ divisions, brandsByDivision }: Props) => (
  <div className="div-grid">
    {divisions.map((d) =>
      d.status === 'upcoming' ? (
        <div key={d.id} className="card div-card new">
          <span className="chip">Připravujeme</span>
          <h3 style={{ marginTop: 10 }}>{d.name}</h3>
          <p style={{ fontSize: 14, marginTop: 8 }}>{d.perex}</p>
        </div>
      ) : (
        <Link key={d.id} className="card div-card" href={urls.division(d.slug!)}>
          <div className="img">{mediaUrl(d.image, 'card') && <img src={mediaUrl(d.image, 'card')!} alt="" loading="lazy" />}</div>
          <div className="body">
            <h3>{d.name}</h3>
            <p>{d.perex}</p>
            <div className="chips">
              {(brandsByDivision.get(d.id) ?? []).map((b) => (
                <span key={b.id} className="chip">
                  {b.name}
                </span>
              ))}
            </div>
            <span className="more">
              Katalog divize
              <Icon name="arrow" />
            </span>
          </div>
        </Link>
      ),
    )}
  </div>
)

export const ProductTypes = ({ types }: { types: string[] }) =>
  types.length ? (
    <div className="types" style={{ marginTop: 40 }}>
      <h2>Nevíte značku? Vyberte typ výrobku:</h2>
      <div className="list">
        {types.map((t) => (
          <Link key={t} className="pill" href={urls.search(undefined, t)}>
            {t}
          </Link>
        ))}
      </div>
    </div>
  ) : null
