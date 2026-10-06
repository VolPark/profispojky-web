/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { urls } from '@/lib/urls'
import type { Division, SiteSetting } from '@/payload-types'

import { Icon } from './Icon'

const tel = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`

/** „Spojujeme *vodu, plyn a teplo*.“ → text se zvýrazněnou částí (stejný zápis jako nadpis úvodní stránky). */
const Motto = ({ text }: { text: string }) => (
  <>
    {text.split(/(\*[^*]+\*)/).map((part, i) =>
      part.startsWith('*') && part.endsWith('*') ? <em key={i}>{part.slice(1, -1)}</em> : <React.Fragment key={i}>{part}</React.Fragment>,
    )}
  </>
)

export const Footer = ({ settings, divisions, motto }: { settings: SiteSetting; divisions: Division[]; motto?: string }) => (
  <footer className="site-footer">
    {/* značka + heslo jako jeden celek vlevo, vpravo hlavní akce – tu v patičce lidé hledají */}
    <div className="container statement">
      <div className="lockup">
        <Link className="logo" href="/">
          <img src="/logo-white.svg" alt="PROFI SPOJKY" width={264} height={51} />
        </Link>
        {motto && (
          <p className="motto">
            <Motto text={motto} />
          </p>
        )}
      </div>
      <Link className="btn btn-primary" href={urls.dealers}>
        <Icon name="pin" />
        Kde koupit
      </Link>
    </div>
    <div className="container top">
      <div>
        <p className="addr">
          {settings.companyName}
          <br />
          Sídlo: {settings.seat}
          <br />
          Centrální sklad: {settings.warehouseStreet}, {settings.warehouseCity}
          <br />
          IČ {settings.ico} · DIČ {settings.dic}
        </p>
      </div>
      <div>
        <h3>Produkty</h3>
        <ul>
          {divisions
            .filter((d) => d.status === 'active')
            .map((d) => (
              <li key={d.id}>
                <Link href={urls.division(d.slug!)}>{d.name}</Link>
              </li>
            ))}
        </ul>
      </div>
      <div>
        <h3>Informace</h3>
        <ul>
          <li>
            <Link href={urls.page('o-firme')}>O firmě</Link>
          </li>
          <li>
            <Link href={urls.news}>Aktuality</Link>
          </li>
          <li>
            <Link href={urls.brands}>Značky</Link>
          </li>
          <li>
            <Link href={urls.dealers}>Prodejní síť</Link>
          </li>
          <li>
            <Link href={urls.library}>Knihovna médií</Link>
          </li>
          <li>
            <Link href={urls.page('pro-partnery')}>Pro partnery</Link>
          </li>
        </ul>
      </div>
      <div className="contact">
        <h3>Kontakt</h3>
        <ul>
          {[settings.phone, settings.phone2].filter(Boolean).map((p) => (
            <li key={p}>
              <a href={tel(p!)}>
                <Icon name="phone" />
                {p}
              </a>
            </li>
          ))}
          <li>
            <a href={`mailto:${settings.email}`}>
              <Icon name="mail" />
              {settings.email}
            </a>
          </li>
          {settings.hours && (
            <li style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <Icon name="clock" />
              {settings.hours}
            </li>
          )}
        </ul>
      </div>
    </div>
    <div className="container bottom">
      <span>
        © {new Date().getFullYear()} {settings.companyName}
      </span>
      <div>
        {(settings.footerLinks ?? []).map((l) => (
          <Link key={l.id ?? l.url} href={l.url}>
            {l.label}
          </Link>
        ))}
        {/* Přihlášení pro redaktory – nenápadně v patičce, návštěvníci ho nepotřebují. */}
        <Link href="/admin" prefetch={false} rel="nofollow">
          Přihlášení do administrace
        </Link>
      </div>
    </div>
  </footer>
)
