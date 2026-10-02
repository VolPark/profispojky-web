import Link from 'next/link'
import React from 'react'

import { urls } from '@/lib/urls'
import type { SiteSetting } from '@/payload-types'

import { HeaderBar } from './HeaderBar'
import { Icon } from './Icon'

export const NAV = [
  { href: urls.products, label: 'Produkty' },
  { href: urls.brands, label: 'Značky' },
  { href: urls.library, label: 'Knihovna médií' },
  { href: urls.news, label: 'Aktuality' },
  { href: urls.dealers, label: 'Prodejní síť' },
  { href: urls.page('o-firme'), label: 'O firmě' },
  { href: urls.contact, label: 'Kontakt' },
]

const tel = (phone: string) => `tel:${phone.replace(/\s+/g, '')}`

export const Header = ({ settings }: { settings: SiteSetting }) => (
  <>
    <div className="util on-dark">
      <div className="container">
        <div className="l">
          <a className="tel" href={tel(settings.phone)}>
            <Icon name="phone" />
            {settings.phone}
          </a>
          {settings.hours && (
            <span>
              <Icon name="clock" />
              {settings.hours}
            </span>
          )}
          {settings.warehouseStreet && (
            <span>
              <Icon name="pin" />
              Sklad {settings.warehouseStreet}, {settings.warehouseCity?.replace(/^\d{3}\s?\d{2}\s*/, '')}
            </span>
          )}
        </div>
        <div className="r">
          <Link href={urls.page('pro-partnery')}>Pro partnery</Link>
        </div>
      </div>
    </div>
    <HeaderBar nav={NAV} />
  </>
)
