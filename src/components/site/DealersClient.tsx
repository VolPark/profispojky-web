'use client'

import React, { useMemo, useState } from 'react'

import type { DealerRegion } from '@/lib/queries'


const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '')

export const DealersClient = ({ regions, children }: { regions: DealerRegion[]; children: React.ReactNode }) => {
  const [q, setQ] = useState('')
  const [applied, setApplied] = useState('')
  const [c, setC] = useState('')
  const [k, setK] = useState('')

  const items = useMemo(() => {
    const needle = norm(applied)
    const out: { n: string; a: string; r: string }[] = []
    regions
      .filter((r) => (!c || r.c === c) && (!k || r.id === k))
      .forEach((r) => r.p.forEach(([n, a]) => (!needle || norm(n + a).includes(needle)) && out.push({ n, a, r: r.name })))
    return out
  }, [regions, applied, c, k])

  const reset = () => {
    setQ('')
    setApplied('')
    setC('')
    setK('')
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
        {children}
        <form
          className="card dealer-form"
          role="search"
          onSubmit={(e) => {
            e.preventDefault()
            setApplied(q)
          }}
        >
          <div className="field">
            <label htmlFor="ps-q">Obec, PSČ nebo název prodejny</label>
            <input
              id="ps-q"
              className="input"
              type="search"
              placeholder="např. Jesenice, 252 42 nebo PTÁČEK"
              value={q}
              onChange={(e) => {
                setQ(e.target.value)
                setApplied(e.target.value)
              }}
            />
          </div>
          <div className="field">
            <label htmlFor="ps-c">Země</label>
            <select id="ps-c" className="select" value={c} onChange={(e) => setC(e.target.value)}>
              <option value="">ČR i Slovensko</option>
              <option value="CZ">Česká republika</option>
              <option value="SK">Slovensko</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="ps-k">Kraj</label>
            <select id="ps-k" className="select" value={k} onChange={(e) => setK(e.target.value)}>
              <option value="">Všechny kraje</option>
              {regions.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} ({r.c === 'SK' ? 'SK' : 'ČR'})
                </option>
              ))}
            </select>
          </div>
          <button className="btn btn-navy" type="submit">
            Hledat
          </button>
        </form>
        </div>
      </section>
      <div className="container dealers" id="dealers">
        <aside className="card region-list" aria-label="Kraje">
          <h2>Kraje</h2>
          <div>
            {(['CZ', 'SK'] as const).map((country) => (
              <React.Fragment key={country}>
                <h3>{country === 'CZ' ? 'Česká republika' : 'Slovensko'}</h3>
                {regions
                  .filter((r) => r.c === country)
                  .map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      aria-pressed={k === r.id}
                      onClick={() => {
                        setK(k === r.id ? '' : r.id)
                        document.getElementById('ps-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                    >
                      <span>{r.name}</span>
                      <span>{r.p.length}</span>
                    </button>
                  ))}
              </React.Fragment>
            ))}
          </div>
        </aside>
        <div>
          <div className="results-bar">
            <span>
              Nalezeno <strong>{items.length}</strong> prodejních míst
            </span>
            <button type="button" className="textbtn" onClick={reset}>
              Zrušit filtr
            </button>
          </div>
          <div className="dealer-grid" id="ps-list">
            {items.map((p, i) => (
              <article key={i} className="card dealer">
                <h3>{p.n}</h3>
                <span className="addr">{p.a}</span>
                <span className="m">{p.r}</span>
                <a href={`https://mapy.cz/zakladni?q=${encodeURIComponent(`${p.n}, ${p.a}`)}`} target="_blank" rel="noopener">
                  Navigovat
                  <span className="sr">
                    {' '}
                    – {p.n}, {p.a}
                  </span>
                </a>
              </article>
            ))}
          </div>
          {items.length === 0 && (
            <div className="card empty">
              <strong style={{ color: 'var(--navy)' }}>V tomto výběru jsme prodejnu nenašli.</strong>
              <span style={{ color: 'var(--gray)' }}>Zkuste jiný kraj, nebo nám zavolejte – doporučíme nejbližší prodejní místo.</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
