import Link from 'next/link'
import React from 'react'

import { urls } from '@/lib/urls'

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
