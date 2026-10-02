import { DefaultTemplate } from '@payloadcms/next/templates'
import { Gutter } from '@payloadcms/ui'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { AdminViewServerProps, Where } from 'payload'
import React from 'react'

import { isCatalogUser } from '@/access/roles'
import { MISSING_LABELS, type MissingContent } from '@/lib/product-status'

const FILTERS: { key: MissingContent | 'all'; label: string }[] = [
  { key: 'all', label: 'Vše' },
  { key: 'photo', label: 'Bez fotky' },
  { key: 'params', label: 'Bez parametrů' },
  { key: 'series', label: 'Bez řady' },
]

export const ContentQueue = async ({ initPageResult, params, searchParams }: AdminViewServerProps) => {
  const { req, visibleEntities, permissions, locale } = initPageResult
  const { payload, user } = req
  if (!user) redirect('/admin/login')

  const filter = (typeof searchParams?.chybi === 'string' ? searchParams.chybi : 'all') as MissingContent | 'all'
  const page = Math.max(1, Number(searchParams?.page) || 1)

  const where: Where = {
    and: [
      { contentComplete: { equals: false } },
      { bcActive: { not_equals: false } },
      ...(filter !== 'all' ? [{ missing: { in: [filter] } }] : []),
    ],
  }

  const res = isCatalogUser(user)
    ? await payload.find({
        collection: 'products',
        where,
        sort: '-lastImportedAt',
        limit: 50,
        page,
        depth: 1,
        select: { code: true, name: true, series: true, missing: true, lastImportedAt: true, bcSeriesCode: true },
      })
    : null

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={locale}
      params={params}
      payload={payload}
      permissions={permissions}
      searchParams={searchParams}
      user={user}
      visibleEntities={visibleEntities}
    >
      <Gutter>
        <div className="ps-queue">
          <h1>Fronta „Doplnit obsah“</h1>
          <p className="ps-queue__lead">
            Nové položky z BC, kterým chybí fotka, technické parametry nebo řada. Dokud obsah nedoplníte, na webu se nezobrazí.
          </p>
          {!res ? (
            <p>Frontu vidí jen Správce katalogu a Admin.</p>
          ) : (
            <>
              <nav className="ps-queue__filters" aria-label="Filtr fronty">
                {FILTERS.map((f) => (
                  <Link
                    key={f.key}
                    href={f.key === 'all' ? '/admin/doplnit-obsah' : `/admin/doplnit-obsah?chybi=${f.key}`}
                    aria-current={filter === f.key ? 'page' : undefined}
                    className={filter === f.key ? 'is-active' : undefined}
                  >
                    {f.label}
                  </Link>
                ))}
              </nav>
              <p>
                <strong>{res.totalDocs}</strong> položek
              </p>
              {res.docs.length === 0 ? (
                <p>Fronta je prázdná – všechny položky mají obsah.</p>
              ) : (
                <table className="ps-table">
                  <thead>
                    <tr>
                      <th>Kód</th>
                      <th>Název</th>
                      <th>Řada</th>
                      <th>Chybí</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {res.docs.map((p) => (
                      <tr key={p.id}>
                        <td className="ps-mono">{p.code}</td>
                        <td>{p.name}</td>
                        <td>{typeof p.series === 'object' && p.series ? p.series.name : p.bcSeriesCode ? `(BC: ${p.bcSeriesCode})` : '–'}</td>
                        <td>
                          {(p.missing ?? []).map((m) => (
                            <span key={m} className="ps-badge ps-badge--warn">
                              {MISSING_LABELS[m as MissingContent]}
                            </span>
                          ))}
                        </td>
                        <td>
                          <Link href={`/admin/collections/products/${p.id}`}>Doplnit →</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {res.totalPages > 1 && (
                <nav className="ps-queue__pages" aria-label="Stránkování">
                  {res.hasPrevPage && <Link href={`?${new URLSearchParams({ ...(filter !== 'all' ? { chybi: filter } : {}), page: String(page - 1) })}`}>← Předchozí</Link>}
                  <span>
                    Strana {res.page} z {res.totalPages}
                  </span>
                  {res.hasNextPage && <Link href={`?${new URLSearchParams({ ...(filter !== 'all' ? { chybi: filter } : {}), page: String(page + 1) })}`}>Další →</Link>}
                </nav>
              )}
            </>
          )}
        </div>
      </Gutter>
    </DefaultTemplate>
  )
}
