import path from 'node:path'

import { Document, Font, Image, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { SiteSetting } from '@/payload-types'

import type { TechSheetData } from './data'

/** Obrázek předaný jako data (react-pdf umí jen JPG a PNG – ostatní se převedou předem). */
export type PdfImage = { data: Buffer; format: 'jpg' | 'png' }

const assets = path.join(process.cwd(), 'src/lib/tech-sheet/assets')
Font.register({
  family: 'Plex',
  fonts: [
    { src: path.join(assets, 'IBMPlexSans-Regular.woff') },
    { src: path.join(assets, 'IBMPlexSans-SemiBold.woff'), fontWeight: 600 },
    { src: path.join(assets, 'IBMPlexSans-Bold.woff'), fontWeight: 700 },
  ],
})
Font.register({ family: 'PlexMono', src: path.join(assets, 'IBMPlexMono-Medium.woff') })
// Kódy a rozměry se nedělí do slabik.
Font.registerHyphenationCallback((word) => [word])

// Design tokens webu (src/app/(frontend)/styles.css)
const C = { navy: '#1C2F5A', blue: '#45C0EB', blueDark: '#0B6A91', bgAlt: '#F4F6F8', border: '#E0E4EB', text: '#2B3648', muted: '#5D6779' }

const s = StyleSheet.create({
  page: { fontFamily: 'Plex', fontSize: 9, color: C.text, paddingTop: 30, paddingBottom: 74, paddingHorizontal: 40 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingBottom: 10, borderBottomWidth: 2, borderBottomColor: C.blue, marginBottom: 18 },
  logo: { width: 150 },
  headerRight: { alignItems: 'flex-end' },
  kicker: { fontSize: 7.5, fontWeight: 600, letterSpacing: 1.4, color: C.blueDark },
  small: { fontSize: 7.5, color: C.muted, marginTop: 2 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  titleCol: { flex: 1, paddingRight: 16 },
  eyebrow: { fontSize: 8, fontWeight: 600, letterSpacing: 1, color: C.blueDark, marginBottom: 4 },
  h1: { fontSize: 19, fontWeight: 700, color: C.navy, lineHeight: 1.2 },
  subtitle: { fontSize: 9.5, color: C.muted, marginTop: 4 },
  maker: { width: 130, alignItems: 'flex-end' },
  makerLabel: { fontSize: 7, color: C.muted, letterSpacing: 1, marginBottom: 4 },
  makerLogo: { maxWidth: 120, maxHeight: 40, objectFit: 'contain' },
  makerName: { fontSize: 7, color: C.muted, marginTop: 3, textAlign: 'right' },
  params: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: C.bgAlt, borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8, marginBottom: 14 },
  param: { width: '33.33%', paddingVertical: 4, paddingHorizontal: 4 },
  paramLabel: { fontSize: 6.5, color: C.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  paramValue: { fontSize: 9, fontWeight: 600, color: C.navy, marginTop: 1 },
  figure: { borderWidth: 1, borderColor: C.border, borderRadius: 4, padding: 10, alignItems: 'center', marginBottom: 10 },
  illustration: { maxHeight: 230, objectFit: 'contain' },
  table: { marginBottom: 18 },
  tr: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: C.border },
  th: { backgroundColor: C.navy, color: '#FFFFFF', fontSize: 7.5, fontWeight: 600, paddingVertical: 5, paddingHorizontal: 4, textAlign: 'center' },
  td: { paddingVertical: 4, paddingHorizontal: 4, textAlign: 'center' },
  code: { fontFamily: 'PlexMono', fontSize: 8.5, color: C.navy, textAlign: 'left' },
  note: { fontSize: 8, color: C.muted, marginTop: 2 },
  link: { color: C.blueDark, textDecoration: 'none' },
  footer: { position: 'absolute', left: 40, right: 40, bottom: 26, borderTopWidth: 0.5, borderTopColor: C.border, paddingTop: 7, flexDirection: 'row', justifyContent: 'space-between' },
  footerText: { fontSize: 6.8, color: C.muted, lineHeight: 1.45 },
  pageNo: { fontSize: 7, color: C.muted },
})

const capitalize = (t: string) => t.charAt(0).toUpperCase() + t.slice(1)
const dateCz = (iso: string) => new Date(iso).toLocaleDateString('cs-CZ', { timeZone: 'Europe/Prague' })

type Props = {
  data: TechSheetData
  settings: SiteSetting
  logo: PdfImage
  brandLogo: PdfImage | null
  illustrations: (PdfImage | null)[]
  seriesUrl: string
}

export function TechSheetDocument({ data, settings, logo, brandLogo, illustrations, seriesUrl }: Props) {
  const { series, brand, shape, blocks, hasThread } = data
  const title = `${capitalize(shape.label)}`
  const eyebrow = [brand?.name, series.name].filter(Boolean).join(' ').toUpperCase()
  const kicker = `${eyebrow}  ·  TVAR ${shape.code.toUpperCase()}`
  const dimHead = `${series.dimensionLabel || 'Rozměr'}${series.dimensionUnit ? ` (${series.dimensionUnit})` : ''}`
  const host = seriesUrl.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
  const contacts = [settings.phone, settings.phone2, settings.email, settings.email2, host].filter(Boolean).join('  ·  ')

  return (
    <Document title={`Technický list – ${eyebrow} ${title}`} author={settings.companyName ?? 'PROFI SPOJKY'} language="cs">
      <Page size="A4" style={s.page}>
        <View style={s.header} fixed>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image nemá alt */}
          <Image style={s.logo} src={logo} />
          <View style={s.headerRight}>
            <Text style={s.kicker}>TECHNICKÝ LIST</Text>
            <Text style={s.small}>Stav údajů k {dateCz(data.updatedAt)}</Text>
          </View>
        </View>

        <View style={s.titleRow}>
          <View style={s.titleCol}>
            <Text style={s.eyebrow}>{kicker}</Text>
            <Text style={s.h1}>{title}</Text>
            <Text style={s.subtitle}>{series.summary}</Text>
          </View>
          {brand && (
            <View style={s.maker}>
              <Text style={s.makerLabel}>VÝROBCE</Text>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              {brandLogo ? <Image style={s.makerLogo} src={brandLogo} /> : <Text style={s.paramValue}>{brand.name}</Text>}
              {brand.manufacturer && <Text style={s.makerName}>{brand.manufacturer}</Text>}
            </View>
          )}
        </View>

        {!!series.commonParams?.length && (
          <View style={s.params}>
            {series.commonParams.map((p) => (
              <View key={p.id ?? p.label} style={s.param}>
                <Text style={s.paramLabel}>{p.label}</Text>
                <Text style={s.paramValue}>{p.value}</Text>
              </View>
            ))}
          </View>
        )}

        {blocks.map((b, i) => {
          const img = illustrations[i]
          const cols = [
            { key: 'code', head: 'Katalogové číslo', flex: 1.7 },
            { key: 'dim', head: dimHead, flex: 1.2 },
            ...(hasThread ? [{ key: 'thread', head: series.threadLabel || 'Závit', flex: 1 }] : []),
            ...b.columns.map((c) => ({ key: c, head: c, flex: 0.8 })),
          ]
          const cell = (r: TechSheetData['blocks'][number]['rows'][number], key: string) =>
            key === 'code' ? r.code : key === 'dim' ? r.dimension : key === 'thread' ? r.thread : (r.values[key] ?? '–')
          return (
            <View key={i}>
              {img && (
                <View style={s.figure} wrap={false} minPresenceAhead={80}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image style={s.illustration} src={img} />
                </View>
              )}
              <View style={s.table}>
                <View style={s.tr} fixed={false} wrap={false}>
                  {cols.map((c) => (
                    <Text key={c.key} style={[s.th, { flex: c.flex }, c.key === 'code' ? { textAlign: 'left' } : {}]}>
                      {c.head}
                    </Text>
                  ))}
                </View>
                {b.rows.map((r, n) => (
                  <View key={r.code} style={[s.tr, n % 2 ? { backgroundColor: C.bgAlt } : {}]} wrap={false}>
                    {cols.map((c) => (
                      <Text key={c.key} style={[s.td, { flex: c.flex }, c.key === 'code' ? s.code : {}]}>
                        {cell(r, c.key)}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          )
        })}

        <Text style={s.note}>
          Certifikáty, prohlášení o shodě a aktuální verze tohoto listu:{' '}
          <Link src={seriesUrl} style={s.link}>
            {seriesUrl.replace(/^https?:\/\//, '')}
          </Link>
        </Text>

        <View style={s.footer} fixed>
          <View>
            <Text style={s.footerText}>
              {[settings.companyName, settings.seat, settings.ico && `IČ ${settings.ico}`, settings.dic && `DIČ ${settings.dic}`]
                .filter(Boolean)
                .join('  ·  ')}
            </Text>
            {settings.registry && <Text style={s.footerText}>{settings.registry}</Text>}
            <Text style={s.footerText}>{contacts}</Text>
          </View>
          <Text style={s.pageNo} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
