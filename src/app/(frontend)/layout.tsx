import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import Link from 'next/link'
import React from 'react'

import { Footer } from '@/components/site/Footer'
import { Header } from '@/components/site/Header'
import { IconSprite } from '@/components/site/Icon'
import { SmoothScroll } from '@/components/site/SmoothScroll'
import { serverUrl } from '@/lib/preview'
import { getDivisions, getSettings } from '@/lib/queries'

import './styles.css'

// ISR: stránky se servírují z cache a na pozadí se přegenerují nejvýš jednou za 60 s,
// takže změna z adminu je na webu do minuty. Když přegenerování selže (výpadek DB, chyba
// v kódu), Next.js dál servíruje poslední funkční verzi stránky.
// Záměrně bez okamžité invalidace (revalidatePath) – ta cache zahodí a při výpadku DB by web spadl.
export const revalidate = 60

const indexing = process.env.ALLOW_INDEXING === 'true'

export const metadata: Metadata = {
  metadataBase: serverUrl() ? new URL(serverUrl()) : undefined,
  title: {
    default: 'Spojky a armatury pro vodu, plyn a topení | PROFI SPOJKY',
    template: '%s | PROFI SPOJKY',
  },
  description:
    'Dovozce spojovacích produktů a uzavíracích armatur z plastu, mosazi a litiny. Katalog s technickými parametry, dokumenty ke stažení a prodejní síť v ČR a SR.',
  icons: { icon: '/logo.svg' },
  robots: indexing ? undefined : { index: false, follow: false },
  openGraph: { siteName: 'PROFI SPOJKY', locale: 'cs_CZ', type: 'website' },
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, divisions, draft] = await Promise.all([getSettings(), getDivisions(), draftMode()])

  return (
    <html lang="cs" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800&family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <IconSprite />
        <a className="sr" href="#obsah">
          Přeskočit na obsah
        </a>
        {draft.isEnabled && (
          <div className="draft-bar" role="status">
            Náhled – zobrazujete i nepublikovaný obsah.
            <Link href="/next/exit-preview" prefetch={false}>
              Ukončit náhled
            </Link>
          </div>
        )}
        <Header settings={settings} />
        <main id="obsah">{children}</main>
        <Footer settings={settings} divisions={divisions} />
        <SmoothScroll />
      </body>
    </html>
  )
}
