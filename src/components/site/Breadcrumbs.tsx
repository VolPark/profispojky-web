import Link from 'next/link'
import React from 'react'

import { serverUrl } from '@/lib/preview'

export type Crumb = { label: string; href?: string }

/** Drobečková navigace + BreadcrumbList schema pro vyhledávače. */
export const Breadcrumbs = ({ items }: { items: Crumb[] }) => {
  const all: Crumb[] = [{ label: 'Domů', href: '/' }, ...items]
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: all.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${serverUrl()}${c.href}` } : {}),
    })),
  }
  return (
    <nav className="breadcrumb" aria-label="Drobečková navigace">
      <div className="container">
        <ol>
          {all.map((c, i) => (
            <li key={i}>
              {c.href && i < all.length - 1 ? <Link href={c.href}>{c.label}</Link> : <span aria-current="page">{c.label}</span>}
            </li>
          ))}
        </ol>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
    </nav>
  )
}
