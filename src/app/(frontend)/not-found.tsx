import Link from 'next/link'
import React from 'react'

import { Icon } from '@/components/site/Icon'
import { urls } from '@/lib/urls'

export default function NotFound() {
  return (
    <section className="not-found">
      <div className="container">
        <div className="eyebrow">Chyba 404</div>
        <h1 style={{ marginTop: 12 }}>Stránku jsme nenašli</h1>
        <p className="lead" style={{ margin: '16px auto 0', maxWidth: 560 }}>
          Možná byla přesunuta při spuštění nového webu. Zkuste vyhledat produkt podle kódu nebo pokračujte do katalogu.
        </p>
        <form action="/katalog" role="search" style={{ maxWidth: 560, margin: '32px auto 0' }}>
          <label className="sr" htmlFor="nf-q">
            Hledat v katalogu
          </label>
          <div className="search-row">
            <div className="input-icon">
              <Icon name="search" />
              <input id="nf-q" className="input" type="search" name="q" placeholder="Kód, název nebo rozměr" />
            </div>
            <button className="btn btn-navy" type="submit">
              Hledat
            </button>
          </div>
        </form>
        <div className="btns">
          <Link className="btn btn-primary" href={urls.products}>
            Katalog produktů
            <Icon name="arrow" />
          </Link>
          <Link className="btn btn-outline" href="/">
            Úvodní stránka
          </Link>
        </div>
      </div>
    </section>
  )
}
