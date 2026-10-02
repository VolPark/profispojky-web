'use client'

/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useEffect, useRef, useState } from 'react'

import { urls } from '@/lib/urls'

import { Icon } from './Icon'

export const HeaderBar = ({ nav }: { nav: { href: string; label: string }[] }) => {
  const pathname = usePathname()
  const [menu, setMenu] = useState(false)
  const [search, setSearch] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Po přechodu na jinou stránku menu i hledání zavřeme.
  const [lastPath, setLastPath] = useState(pathname)
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setMenu(false)
    setSearch(false)
  }

  useEffect(() => {
    if (search) inputRef.current?.focus()
  }, [search])

  const isCurrent = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <header className="site-header">
      <div className="container">
        <Link className="logo" href="/" aria-label="PROFI SPOJKY – úvodní stránka">
          <img src="/logo.svg" alt="PROFI SPOJKY" width={198} height={38} />
        </Link>
        <nav className="nav" aria-label="Hlavní navigace">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={isCurrent(n.href) ? 'page' : undefined}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="hdr-actions">
          <button
            type="button"
            className="icon-btn search-btn"
            aria-label="Hledat"
            aria-expanded={search}
            aria-controls="search-panel"
            onClick={() => setSearch((v) => !v)}
          >
            <Icon name="search" />
          </button>
          <Link className="btn btn-primary btn-sm" href={urls.dealers}>
            <Icon name="pin" />
            Kde koupit
          </Link>
          <button
            type="button"
            className="icon-btn menu-btn"
            aria-label="Menu"
            aria-expanded={menu}
            aria-controls="mnav"
            onClick={() => setMenu((v) => !v)}
          >
            <Icon name={menu ? 'x' : 'menu'} />
          </button>
        </div>
      </div>
      <div id="search-panel" className={`search-panel${search ? ' open' : ''}`}>
        <div className="container">
          <form action="/katalog" role="search">
            <label className="sr" htmlFor="hq">
              Hledat v katalogu
            </label>
            <div className="input-icon">
              <Icon name="search" />
              <input ref={inputRef} id="hq" className="input" type="search" name="q" placeholder="Kód, název nebo rozměr" />
            </div>
            <button className="btn btn-navy" type="submit">
              Hledat
            </button>
          </form>
        </div>
      </div>
      <nav id="mnav" className={`mnav${menu ? ' open' : ''}`} aria-label="Mobilní navigace">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} aria-current={isCurrent(n.href) ? 'page' : undefined}>
            {n.label}
          </Link>
        ))}
        <Link className="cta" href={urls.dealers}>
          Kde koupit
        </Link>
      </nav>
    </header>
  )
}
