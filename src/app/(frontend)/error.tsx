'use client'

import Link from 'next/link'
import React from 'react'

/**
 * Zobrazí se jen u stránek, které se renderují živě (vyhledávání) nebo ještě nejsou v cache,
 * když selže server nebo databáze. Ostatní stránky se servírují z ISR cache.
 */
export default function FrontendError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <section className="not-found">
      <div className="container">
        <div className="eyebrow">Dočasný výpadek</div>
        <h1 style={{ marginTop: 12 }}>Tuto část webu teď nedokážeme načíst</h1>
        <p className="lead" style={{ margin: '16px auto 0', maxWidth: 560 }}>
          O problému už víme a řešíme ho. Zkuste to prosím za chvíli, nebo pokračujte do katalogu – ostatní části webu fungují.
        </p>
        <div className="btns">
          <button type="button" className="btn btn-primary" onClick={reset}>
            Zkusit znovu
          </button>
          <Link className="btn btn-outline" href="/produkty">
            Katalog produktů
          </Link>
        </div>
      </div>
    </section>
  )
}
