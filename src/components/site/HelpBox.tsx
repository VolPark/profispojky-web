import React from 'react'

import type { SiteSetting } from '@/payload-types'

import { Icon } from './Icon'

export const HelpBox = ({ settings, title, text }: { settings: SiteSetting; title: string; text: string }) => (
  <section style={{ padding: '0 0 96px' }}>
    <div className="container">
      <div className="help">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="btns">
          <a className="btn btn-primary" href={`tel:${settings.phone.replace(/\s+/g, '')}`}>
            <Icon name="phone" />
            {settings.phone}
          </a>
          <a className="btn btn-outline" href={`mailto:${settings.email}`}>
            <Icon name="mail" />
            {settings.email}
          </a>
        </div>
      </div>
    </div>
  </section>
)
