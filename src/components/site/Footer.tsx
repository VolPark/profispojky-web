/* eslint-disable @next/next/no-img-element */
import Link from 'next/link'
import React from 'react'

import { urls } from '@/lib/urls'
import type { Division, SiteSetting } from '@/payload-types'

import { Icon } from './Icon'

const tel = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`

export const Footer = ({ settings, divisions }: { settings: SiteSetting; divisions: Division[] }) => (
  <footer className="site-footer">
    <div className="container top">
      <div>
        <Link className="logo" href="/">
          <img src="/logo-white.svg" alt="PROFI SPOJKY" width={198} height={38} />
        </Link>
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
      </div>
    </div>
  </footer>
)
