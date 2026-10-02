import type { Metadata } from 'next'
import React from 'react'

import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { Icon } from '@/components/site/Icon'
import { getContacts, getSettings } from '@/lib/queries'

export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Objednávky, technické poradenství a informace o prodejní síti PROFI SPOJKY.',
}

const tel = (p: string) => `tel:${p.replace(/\s+/g, '')}`

export default async function ContactPage() {
  const [s, contacts] = await Promise.all([getSettings(), getContacts()])
  const warehouse = [s.warehouseStreet, s.warehouseCity].filter(Boolean).join(', ')
  return (
    <>
      <Breadcrumbs items={[{ label: 'Kontakt' }]} />
      <section className="page-hero">
        <div className="container">
          <div className="eyebrow">Kontakt</div>
          <h1>Kontakt</h1>
          <p className="lead">Objednávky, technické poradenství a informace o prodejní síti. {s.hours}.</p>
        </div>
      </section>
      <section className="section">
        <div className="container cards3">
          <div className="card">
            <h3>Objednávky a sklad</h3>
            <p style={{ lineHeight: 1.8 }}>
              <a href={tel(s.phone)}>{s.phone}</a>
              <br />
              <a href={`mailto:${s.email}`}>{s.email}</a>
              {s.email2 && (
                <>
                  <br />
                  <a href={`mailto:${s.email2}`}>{s.email2}</a>
                </>
              )}
            </p>
          </div>
          <div className="card">
            <h3>Sklad, kanceláře a osobní odběr</h3>
            <p style={{ lineHeight: 1.8 }}>
              {s.warehouseStreet}
              <br />
              {s.warehouseCity}
            </p>
            {warehouse && (
              <a className="link-arrow" style={{ marginTop: 12 }} href={`https://mapy.cz/zakladni?q=${encodeURIComponent(warehouse)}`} target="_blank" rel="noopener">
                <Icon name="pin" />
                Navigovat na Mapy.cz
              </a>
            )}
          </div>
          <div className="card">
            <h3>Fakturační údaje</h3>
            <p style={{ lineHeight: 1.8 }}>
              {s.companyName}
              <br />
              {s.seat}
              <br />
              IČ {s.ico} · DIČ {s.dic}
            </p>
            {s.registry && <p style={{ fontSize: 13, color: 'var(--gray)', marginTop: 8 }}>{s.registry}</p>}
          </div>
        </div>
        {contacts.length > 0 && (
          <div className="container" style={{ marginTop: 64 }}>
            <h2 style={{ fontSize: 28, marginBottom: 20 }}>Kontaktní osoby</h2>
            <div className="team">
              {contacts.map((c) => (
                <div key={c.id} className="card person">
                  <b>{c.name}</b>
                  <span>{c.role}</span>
                  {c.phone && <a href={tel(c.phone)}>{c.phone}</a>}
                  {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  )
}
