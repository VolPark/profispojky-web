'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { Icon } from './Icon'
import { useUrlParam } from './useUrlParam'

export type CatalogRow = {
  code: string
  name: string
  subtitle: string
  shape: string
  dimension: number | null
  thread: string
  img: string | null
  sale: boolean
}

type Shape = { code: string; label: string }

type Props = {
  rows: CatalogRow[]
  shapes: Shape[]
  dimensionLabel: string
  dimensionUnit: string
  threadLabel: string
}

type SortKey = 'code' | 'dimension' | 'name'

const collator = new Intl.Collator('cs', { numeric: true })

/** Závit v palcích → číslo pro řazení: 1/2" < 3/4" < 1" < 2 1/2". */
const threadValue = (t: string) => {
  const m = t.replace(/["″]/g, '').trim().match(/^(?:(\d+)\s+)?(\d+)(?:\/(\d+))?$/)
  if (!m) return Number.POSITIVE_INFINITY
  const [, whole, a, b] = m
  return (whole ? Number(whole) : 0) + (b ? Number(a) / Number(b) : Number(a))
}

export const CatalogClient = ({ rows, shapes, dimensionLabel, dimensionUnit, threadLabel }: Props) => {
  // ?q= z URL (např. z hledání v hlavičce) – čteno až v prohlížeči, aby stránka zůstala statická (ISR).
  const urlQuery = useUrlParam('q')
  const [shape, setShape] = useState('all')
  const [dims, setDims] = useState<Set<number>>(new Set())
  const [threads, setThreads] = useState<Set<string>>(new Set())
  const [typedQ, setQ] = useState<string | null>(null)
  const q = typedQ ?? urlQuery
  const [sort, setSort] = useState<SortKey>('code')
  const [sheet, setSheet] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  const shapeList = useMemo(() => {
    const used = new Set(rows.map((r) => r.shape).filter(Boolean))
    const known = shapes.filter((s) => used.has(s.code))
    const unknown = [...used].filter((c) => !shapes.some((s) => s.code === c)).map((c) => ({ code: c, label: c }))
    return [...known, ...unknown]
  }, [rows, shapes])
  const shapeLabel = (code: string) => shapes.find((s) => s.code === code)?.label ?? ''
  const dimList = useMemo(() => [...new Set(rows.map((r) => r.dimension).filter((d): d is number => d !== null))].sort((a, b) => a - b), [rows])
  const threadList = useMemo(() => [...new Set(rows.map((r) => r.thread).filter(Boolean))].sort((a, b) => threadValue(a) - threadValue(b) || collator.compare(a, b)), [rows])

  const list = useMemo(() => {
    const needle = q.toLowerCase().trim()
    const filtered = rows.filter(
      (r) =>
        (shape === 'all' || r.shape === shape) &&
        (!dims.size || (r.dimension !== null && dims.has(r.dimension))) &&
        (!threads.size || threads.has(r.thread)) &&
        (!needle || `${r.code} ${r.name} ${r.subtitle}`.toLowerCase().includes(needle)),
    )
    return filtered.sort((a, b) =>
      sort === 'dimension'
        ? (a.dimension ?? 0) - (b.dimension ?? 0) || collator.compare(a.code, b.code)
        : sort === 'name'
          ? collator.compare(a.name, b.name)
          : collator.compare(a.code, b.code),
    )
  }, [rows, shape, dims, threads, q, sort])

  const reset = () => {
    setShape('all')
    setDims(new Set())
    setThreads(new Set())
    setQ('')
  }
  const toggle = <T,>(set: Set<T>, v: T) => {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    return n
  }

  const closeSheet = () => {
    setSheet(false)
    toggleRef.current?.focus()
  }
  useEffect(() => {
    if (!sheet) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeSheet()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [sheet])

  const active: { key: string; label: string; rm: () => void }[] = []
  if (shape !== 'all') active.push({ key: 'shape', label: `Tvar: ${shape}`, rm: () => setShape('all') })
  dims.forEach((d) => active.push({ key: `d${d}`, label: `${d} ${dimensionUnit}`, rm: () => setDims(toggle(dims, d)) }))
  threads.forEach((t) => active.push({ key: `t${t}`, label: `${threadLabel} ${t}`, rm: () => setThreads(toggle(threads, t)) }))
  if (q) active.push({ key: 'q', label: `Hledání: ${q}`, rm: () => setQ('') })
  const fcount = dims.size + threads.size + (shape !== 'all' ? 1 : 0)
  const hasThreads = threadList.length > 0
  const hasDims = dimList.length > 0
  const hasShapes = shapeList.length > 0

  return (
    <section className="cat-body" id="catalog">
      <div className="container">
        <aside className={`card filters${sheet ? ' open' : ''}`} aria-label="Filtry" id="filters">
          <div className="sheet-head">
            <h2 style={{ fontSize: 20 }}>Filtry</h2>
            <button type="button" className="icon-btn" onClick={closeSheet} aria-label="Zavřít filtry">
              <Icon name="x" />
            </button>
          </div>
          <div className="fhead">
            <b>
              <Icon name="filter" />
              Filtry
            </b>
            <button type="button" className="textbtn" onClick={reset}>
              Zrušit vše
            </button>
          </div>
          <div className="field">
            <label htmlFor="kat-q">Hledat v řadě</label>
            <input id="kat-q" className="input" style={{ height: 44 }} type="search" placeholder="Kód nebo rozměr" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          {shapeList.length > 1 && (
            <fieldset>
              <legend>Tvar</legend>
              <div className="tv">
                {[{ code: 'all', label: 'Vše' }, ...shapeList].map((s) => (
                  <button key={s.code} type="button" aria-pressed={shape === s.code} onClick={() => setShape(s.code)}>
                    <span>{s.code === 'all' ? 'Vše' : s.label === s.code ? s.code : `${s.code} – ${s.label}`}</span>
                    <span>{s.code === 'all' ? rows.length : rows.filter((r) => r.shape === s.code).length}</span>
                  </button>
                ))}
              </div>
            </fieldset>
          )}
          {dimList.length > 1 && (
            <fieldset>
              <legend>{dimensionLabel}</legend>
              <div className="checks">
                {dimList.map((d) => (
                  <label key={d}>
                    <input type="checkbox" checked={dims.has(d)} onChange={() => setDims(toggle(dims, d))} />
                    {d} {dimensionUnit}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {threadList.length > 1 && (
            <fieldset>
              <legend>{threadLabel}</legend>
              <div className="checks">
                {threadList.map((t) => (
                  <label key={t}>
                    <input type="checkbox" checked={threads.has(t)} onChange={() => setThreads(toggle(threads, t))} />
                    {t}
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          <div className="sheet-foot">
            <button type="button" className="btn btn-navy" style={{ width: '100%' }} onClick={closeSheet}>
              Zobrazit {list.length} položek
            </button>
          </div>
        </aside>
        {sheet && <div className="scrim" onClick={closeSheet} />}
        <div>
          <div className="results-bar">
            <span>
              Zobrazeno <strong>{list.length}</strong> z {rows.length} položek
            </span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                ref={toggleRef}
                type="button"
                className="btn btn-outline btn-sm filter-toggle"
                aria-controls="filters"
                aria-expanded={sheet}
                onClick={() => setSheet(true)}
              >
                <Icon name="filter" />
                Filtry {fcount ? `(${fcount})` : ''}
              </button>
              <label>
                <span className="sr">Seřadit</span>
                <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)}>
                  <option value="code">Podle kódu</option>
                  <option value="dimension">Podle rozměru</option>
                  <option value="name">Podle názvu</option>
                </select>
              </label>
            </div>
          </div>
          {active.length > 0 && (
            <div className="active-filters">
              {active.map((a) => (
                <button key={a.key} type="button" onClick={a.rm}>
                  {a.label}
                  <Icon name="x" />
                  <span className="sr">Zrušit filtr</span>
                </button>
              ))}
            </div>
          )}
          <div className="tbl-wrap">
            {list.length > 0 ? (
              <table className="cat">
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>
                      <span className="sr">Obrázek</span>
                    </th>
                    <th style={{ width: 104 }}>Kód</th>
                    <th>Označení</th>
                    {hasShapes && <th style={{ width: 116 }}>Tvar</th>}
                    {hasDims && <th style={{ width: 76 }}>{dimensionLabel.replace(/^Rozměr\s+/i, '').split(' ')[0] || 'Rozměr'}</th>}
                    {hasThreads && <th style={{ width: 76 }}>{threadLabel}</th>}
                    <th style={{ width: 92 }}>
                      <span className="sr">Akce</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.code}>
                      <td className="c-img">
                        {r.img ? (
                          <img className="thumb" src={r.img} alt="" loading="lazy" />
                        ) : (
                          <div className="thumb-ph">
                            <Icon name="box" />
                          </div>
                        )}
                      </td>
                      <td className="c-code mono">{r.code}</td>
                      <td className="c-name">
                        <div className="nm">
                          {r.name} {r.sale && <span className="chip sale-chip">Výprodej</span>}
                        </div>
                        {r.subtitle && <div className="ds">{r.subtitle}</div>}
                      </td>
                      <td className="c-meta">
                        {[r.dimension !== null ? `${r.dimension} ${dimensionUnit}` : '', r.thread, r.shape ? `tvar ${r.shape}` : ''].filter(Boolean).join(' · ')}
                      </td>
                      {hasShapes && (
                        <td className="c-tvar">
                          <strong style={{ color: 'var(--navy)' }}>{r.shape || '–'}</strong>
                          {shapeLabel(r.shape) && shapeLabel(r.shape) !== r.shape && <div className="sub">{shapeLabel(r.shape)}</div>}
                        </td>
                      )}
                      {hasDims && <td className="c-pe">{r.dimension !== null ? `${r.dimension} ${dimensionUnit}` : '–'}</td>}
                      {hasThreads && <td className="c-thr">{r.thread || '–'}</td>}
                      <td className="c-det" style={{ textAlign: 'right' }}>
                        <Link className="det" href={`/produkt/${encodeURIComponent(r.code)}`}>
                          <span className="lbl">Detail</span>
                          <span className="sr"> {r.name}</span>
                          <Icon name="chev" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty">
                <strong style={{ color: 'var(--navy)' }}>Žádná položka neodpovídá filtru.</strong>
                <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
                  Zrušit filtry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
