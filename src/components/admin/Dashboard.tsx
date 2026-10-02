import Link from 'next/link'
import type { ServerProps } from 'payload'
import React from 'react'

import { isCatalogUser } from '@/access/roles'
import { EXPIRY_WARNING_DAYS } from '@/lib/doc-expiry'
import { formatDate } from '@/lib/format'

// Server komponenta se renderuje při každém požadavku – aktuální čas je tu záměr.
const currentTime = () => Date.now()

export const Dashboard = async ({ payload, user }: ServerProps) => {
  if (!user) return null
  const catalog = isCatalogUser(user)
  const now = currentTime()
  const warnUntil = new Date(now + EXPIRY_WARNING_DAYS * 864e5).toISOString()

  const [queue, expiring, lastImport, scheduled] = await Promise.all([
    catalog
      ? payload.count({ collection: 'products', where: { and: [{ contentComplete: { equals: false } }, { bcActive: { not_equals: false } }] } })
      : null,
    catalog
      ? payload.find({
          collection: 'documents',
          where: { validUntil: { less_than_equal: warnUntil } },
          sort: 'validUntil',
          limit: 10,
          depth: 0,
          select: { title: true, validUntil: true },
        })
      : null,
    catalog
      ? payload.find({ collection: 'bc-imports', sort: '-createdAt', limit: 1, depth: 0, select: { filename: true, status: true, createdAt: true, confirmedAt: true } })
      : null,
    payload.find({
      collection: 'news',
      where: { and: [{ _status: { equals: 'published' } }, { publishedAt: { greater_than: new Date(now).toISOString() } }] },
      sort: 'publishedAt',
      limit: 5,
      depth: 0,
      select: { title: true, publishedAt: true },
    }),
  ])

  const imp = lastImport?.docs[0]

  return (
    <div className="ps-dash">
      {catalog && (
        <div className="ps-dash__card">
          <h3>Fronta „Doplnit obsah“</h3>
          <p className="ps-dash__big">{queue?.totalDocs ?? 0}</p>
          <p>položek z BC bez fotky, parametrů nebo řady – na webu se nezobrazují.</p>
          <Link href="/admin/doplnit-obsah">Otevřít frontu →</Link>
        </div>
      )}
      {catalog && (
        <div className="ps-dash__card">
          <h3>Platnost dokumentů</h3>
          {expiring && expiring.docs.length > 0 ? (
            <ul>
              {expiring.docs.map((d) => {
                const expired = d.validUntil && new Date(d.validUntil).getTime() < now
                return (
                  <li key={d.id}>
                    <Link href={`/admin/collections/documents/${d.id}`}>{d.title}</Link>{' '}
                    <span className={expired ? 'ps-badge ps-badge--bad' : 'ps-badge ps-badge--warn'}>
                      {expired ? 'vypršel' : 'vyprší'} {formatDate(d.validUntil)}
                    </span>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p>Žádný dokument nevyprší v příštích {EXPIRY_WARNING_DAYS} dnech.</p>
          )}
        </div>
      )}
      {catalog && (
        <div className="ps-dash__card">
          <h3>Import z BC</h3>
          {imp ? (
            <p>
              Poslední: <Link href={`/admin/collections/bc-imports/${imp.id}`}>{imp.filename}</Link>
              <br />
              {imp.status === 'draft' ? 'čeká na potvrzení' : imp.status === 'confirmed' ? `potvrzeno ${formatDate(imp.confirmedAt)}` : imp.status}
            </p>
          ) : (
            <p>Zatím žádný import.</p>
          )}
          <Link href="/admin/collections/bc-imports/create">Nahrát nový export →</Link>
        </div>
      )}
      <div className="ps-dash__card">
        <h3>Naplánované aktuality</h3>
        {scheduled.docs.length ? (
          <ul>
            {scheduled.docs.map((n) => (
              <li key={n.id}>
                <Link href={`/admin/collections/news/${n.id}`}>{n.title}</Link> – {formatDate(n.publishedAt, true)}
              </li>
            ))}
          </ul>
        ) : (
          <p>Nic naplánováno.</p>
        )}
        <Link href="/admin/collections/news/create">Napsat aktualitu →</Link>
      </div>
    </div>
  )
}
