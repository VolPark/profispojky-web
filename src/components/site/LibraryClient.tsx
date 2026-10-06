'use client'

import React, { useMemo, useState } from 'react'

import { Icon } from './Icon'
import { useUrlParam } from './useUrlParam'

export type LibraryDoc = {
  id: number
  type: string
  typeLabel: string
  icon: string
  title: string
  divisions: string[]
  brands: string[]
  fmt: string
  url: string
  isVideo: boolean
  isFile: boolean
}

type Props = {
  docs: LibraryDoc[]
  types: { value: string; label: string }[]
  brands: string[]
  divisions: string[]
}

export const LibraryClient = ({ docs, types, brands, divisions }: Props) => {
  // ?typ= z dlaždic na úvodní stránce – čteno v prohlížeči, stránka zůstává statická (ISR).
  const urlType = useUrlParam('typ')
  const [pickedType, setT] = useState<string | null>(null)
  const t = pickedType ?? (types.some((x) => x.value === urlType) ? urlType : 'all')
  const [q, setQ] = useState('')
  const [brand, setBrand] = useState('')
  const [div, setDiv] = useState('')

  const list = useMemo(() => {
    const needle = q.toLowerCase().trim()
    return docs.filter(
      (d) =>
        (t === 'all' || d.type === t) &&
        (!brand || d.brands.includes(brand)) &&
        (!div || d.divisions.length === 0 || d.divisions.includes(div)) &&
        (!needle || `${d.title} ${d.divisions.join(' ')} ${d.typeLabel} ${d.brands.join(' ')}`.toLowerCase().includes(needle)),
    )
  }, [docs, t, q, brand, div])

  const reset = () => {
    setT('all')
    setQ('')
    setBrand('')
    setDiv('')
  }

  return (
    <>
      <div className="field" style={{ maxWidth: 460, marginBottom: 24 }}>
        <label htmlFor="lib-q">Hledat dokument</label>
        <div className="input-icon">
          <Icon name="search" />
          <input id="lib-q" className="input" type="search" placeholder="Název, značka nebo divize" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
      </div>
      <div className="lib-filters">
        <div className="row" role="group" aria-label="Typ dokumentu">
          {[{ value: 'all', label: 'Vše' }, ...types].map((x) => (
            <button key={x.value} type="button" className="pill" aria-pressed={t === x.value} onClick={() => setT(x.value)}>
              {x.label}
            </button>
          ))}
        </div>
        <div className="sels">
          <label htmlFor="lib-brand">
            Značka
            <select id="lib-brand" className="select" value={brand} onChange={(e) => setBrand(e.target.value)}>
              <option value="">Všechny</option>
              {brands.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>
          <label htmlFor="lib-div">
            Divize
            <select id="lib-div" className="select" value={div} onChange={(e) => setDiv(e.target.value)}>
              <option value="">Všechny</option>
              {divisions.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>
      <span>
        Nalezeno <strong>{list.length}</strong> dokumentů
      </span>
      <div className="docs-grid">
        {list.map((d) => (
          <article key={d.id} className="doc">
            <div className="top">
              <Icon name={d.icon} />
              <span className="tag">{d.typeLabel}</span>
            </div>
            <div className="body">
              <h3>{d.title}</h3>
              <span className="m">
                {d.divisions.length ? d.divisions.join(', ') : 'Všechny divize'}
                {d.brands.length ? ` · ${d.brands.join(', ')}` : ''}
              </span>
              <span className="m">{d.fmt}</span>
              <div className="acts">
                <a href={d.url} target="_blank" rel="noopener">
                  <Icon name={d.isVideo ? 'play' : 'file'} />
                  {d.isVideo ? 'Přehrát' : d.isFile ? 'Stáhnout' : 'Otevřít'}
                  <span className="sr"> {d.title}</span>
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
      {list.length === 0 && (
        <div className="card empty" style={{ marginTop: 16 }}>
          <strong style={{ color: 'var(--navy)' }}>Žádný dokument neodpovídá filtru.</strong>
          <button type="button" className="btn btn-outline btn-sm" onClick={reset}>
            Zrušit filtry
          </button>
        </div>
      )}
    </>
  )
}
