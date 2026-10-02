/**
 * Naplní prázdnou databázi obsahem z prototypu (prototype/).
 * Spuštění: pnpm seed   (SEED_ADMIN_EMAIL a SEED_ADMIN_PASSWORD volitelně)
 * Když DB už obsahuje divize, nic neudělá.
 */
import crypto from 'crypto'
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from '@payload-config'

import { slugify } from '../lib/slugify'
import data from './data.json'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const ASSETS = path.resolve(dirname, '../../prototype/assets')

const para = (text: string) => ({
  type: 'paragraph',
  version: 1,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  textFormat: 0,
  children: [{ type: 'text', version: 1, text, format: 0, detail: 0, mode: 'normal', style: '' }],
})
const rich = (...texts: string[]) => ({
  root: { type: 'root', version: 1, direction: 'ltr' as const, format: '' as const, indent: 0, children: texts.map(para) },
})

// Kód tvaru → popisky (z prototypu, řada Valvopat)
const SHAPES = [
  { code: 'A', label: 'vnější závit', description: 'A – spojka přímá s vnějším závitem' },
  { code: 'O', label: 'svěrná', description: 'O – oboustranně svěrná spojka' },
  { code: 'IM', label: 'závit v matici', description: 'IM – vnitřní závit v převlečné matce' },
  { code: 'OL', label: 'opravná', description: 'OL – opravná spojka svěrná' },
  { code: 'WO', label: 'koleno', description: 'WO – koleno svěrné' },
  { code: 'TI', label: 'T kus', description: 'TI – T kus s vnitřním závitem' },
  { code: 'nástěnka', label: 'nástěnka', description: 'Nástěnka' },
]

const run = async () => {
  const payload = await getPayload({ config })
  const existing = await payload.count({ collection: 'divisions' })
  if (existing.totalDocs > 0) {
    payload.logger.info('Seed: DB už obsahuje data – přeskakuji.')
    process.exit(0)
  }

  const media = new Map<string, number>()
  const upload = async (file: string, alt: string) => {
    if (media.has(file)) return media.get(file)!
    const doc = await payload.create({ collection: 'media', data: { alt }, filePath: path.join(ASSETS, file) })
    media.set(file, doc.id)
    return doc.id
  }

  /* ---------- uživatel ---------- */
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@profispojky.local'
  const password = process.env.SEED_ADMIN_PASSWORD || crypto.randomBytes(9).toString('base64url')
  await payload.create({ collection: 'users', data: { email, password, name: 'Admin SEBIT', role: 'admin' } })

  /* ---------- divize ---------- */
  const divisionIds = new Map<string, number>()
  const divisionByName = new Map<string, number>()
  for (const d of data.divisions) {
    const doc = await payload.create({
      collection: 'divisions',
      data: { name: d.name, slug: d.slug, perex: d.perex, order: d.order, status: 'active', image: await upload(d.image, `Výrobky divize ${d.name}`) },
    })
    divisionIds.set(d.slug, doc.id)
    divisionByName.set(d.name, doc.id)
  }
  await payload.create({
    collection: 'divisions',
    data: { name: 'Nová divize', slug: 'nova-divize', perex: 'Sortiment rozšiřujeme o další divizi. Brzy zde najdete její katalog.', order: 99, status: 'upcoming' },
  })

  /* ---------- značky ---------- */
  const brandIds = new Map<string, number>()
  const brandByName = new Map<string, number>()
  for (const [i, b] of data.brands.entries()) {
    const slug = slugify(b.name)
    const doc = await payload.create({
      collection: 'brands',
      data: {
        name: b.name,
        slug,
        description: b.description,
        order: i + 1,
        manufacturer: b.name === 'Bugatti' ? 'Valvosanitaria Bugatti S.p.A.' : undefined,
      },
    })
    brandIds.set(b.slug, doc.id)
    brandByName.set(b.name, doc.id)
  }
  brandByName.set('SAB', brandByName.get('SAB Blueseal')!)

  /* ---------- řady ---------- */
  let valvopatId = 0
  for (const s of data.series) {
    const brand = data.brands.find((b) => b.slug === s.brand)!
    const isValvopat = s.brand === 'bugatti' && s.name === 'Valvopat'
    const doc = await payload.create({
      collection: 'series',
      data: {
        name: s.name,
        slug: slugify(`${brand.name} ${s.name}`),
        summary: s.summary,
        order: s.order,
        division: divisionIds.get(s.division)!,
        brand: brandIds.get(s.brand)!,
        ...(isValvopat
          ? {
              bcCode: 'VALVOPAT',
              title: 'Valvopat – mosazné svěrné spojky pro PE trubky 20–110 mm',
              lead: 'Mosazné svěrné spojky Bugatti Valvopat na vodu a plyn pro PE trubky 20–110 mm.',
              media: 'Voda · Plyn',
              dimensionLabel: 'Rozměr PE trubky',
              dimensionUnit: 'mm',
              threadLabel: 'Závit',
              shapes: SHAPES,
              commonParams: [
                { label: 'Druh trubky', value: 'Trubka PE', highlight: false },
                { label: 'Médium', value: 'Voda studená, voda pitná, plyn', highlight: false },
                { label: 'Teplota – voda', value: '80 °C', highlight: false },
                { label: 'Tlak – voda', value: 'PN 40', highlight: true },
                { label: 'Tlak – plyn', value: 'PN 10/16', highlight: true },
                { label: 'Materiál', value: 'Mosaz', highlight: false },
              ],
            }
          : {}),
      },
    })
    if (isValvopat) valvopatId = doc.id
  }

  /* ---------- produkty ---------- */
  for (const p of data.products) {
    await payload.create({
      collection: 'products',
      data: {
        code: p.code,
        name: p.label,
        subtitle: p.desc,
        series: valvopatId,
        bcSeriesCode: 'VALVOPAT',
        bcStatus: 'active',
        bcActive: true,
        showOnWeb: true,
        shape: p.tvar,
        dimension: p.pe,
        thread: p.thr || undefined,
        productType: p.tvar === 'nástěnka' ? 'Nástěnky' : 'Svěrné spojky',
        images: p.img ? [await upload(p.img.replace('assets/', ''), `${p.label} – ${p.desc}`)] : [],
      },
    })
  }

  /* ---------- dokumenty ---------- */
  const docIds: number[] = []
  for (const [i, d] of data.docs.entries()) {
    const doc = await payload.create({
      collection: 'documents',
      data: {
        title: d.title,
        type: d.t as never,
        externalUrl: d.url,
        featured: i === 0,
        edition: i === 0 ? '2026/03' : undefined,
        showInLibrary: true,
        divisions: d.div && d.div !== 'Všechny divize' ? [divisionByName.get(d.div)!] : [],
        brands: d.brand && brandByName.get(d.brand) ? [brandByName.get(d.brand)!] : [],
        series: /Valvopat/.test(d.title) && valvopatId ? [valvopatId] : [],
      },
    })
    docIds.push(doc.id)
  }

  /* ---------- prodejní síť, kontakty ---------- */
  for (const r of data.partners) {
    for (const [name, address] of r.p as [string, string][]) {
      await payload.create({ collection: 'partners', data: { name, address, region: r.id as never } })
    }
  }
  for (const c of data.contacts) {
    await payload.create({ collection: 'contacts', data: c })
  }

  /* ---------- aktuality ---------- */
  const attachment = async (title: string, url: string) =>
    (await payload.create({ collection: 'documents', data: { title, type: 'jine', externalUrl: url, showInLibrary: false } })).id
  const news = [
    {
      title: 'HTA® systém PVC-C – novinka v sortimentu',
      publishedAt: '2026-01-08T09:00:00.000Z',
      category: 'novinka',
      division: divisionByName.get('Plast'),
      perex: 'HTA® systém PVC-C pro rozvody teplé a studené pitné a užitkové vody. Tvarovky a trubky GIRPI 16–160 mm.',
      image: 'news1.jpg',
      attachments: [docIds[4]],
    },
    {
      title: 'Veletrh VODOVODY-KANALIZACE 2025',
      publishedAt: '2025-06-27T09:00:00.000Z',
      category: 'veletrh',
      perex: 'PROFI SPOJKY na veletrhu VODOVODY-KANALIZACE 2025.',
      image: 'stanek1.jpg',
      attachments: [await attachment('Fotoreport z veletrhu VODOVODY-KANALIZACE 2025', 'https://www.profispojky.cz/download.php?fid=1382')],
    },
    {
      title: 'Veletrh Ptáček 2025',
      publishedAt: '2025-03-24T09:00:00.000Z',
      category: 'veletrh',
      perex: 'PROFI SPOJKY na veletrhu společnosti Ptáček.',
      image: 'news3.jpg',
      attachments: [await attachment('PROFI SPOJKY na veletrhu Ptáček 2025', 'https://www.profispojky.cz/download.php?fid=1368')],
    },
  ]
  for (const n of news) {
    await payload.create({
      collection: 'news',
      data: {
        title: n.title,
        publishedAt: n.publishedAt,
        category: n.category as 'novinka' | 'veletrh',
        division: n.division,
        perex: n.perex,
        body: rich(n.perex),
        image: await upload(n.image, n.title),
        attachments: n.attachments,
        _status: 'published',
      },
    })
  }

  /* ---------- stránky ---------- */
  await payload.create({
    collection: 'pages',
    data: {
      title: 'PROFI SPOJKY s.r.o.',
      slug: 'o-firme',
      eyebrow: 'O firmě',
      lead: 'Dovozce spojovacích produktů a uzavíracích armatur pro vodu, plyn a topení.',
      _status: 'published',
      layout: [
        {
          blockType: 'content',
          text: rich(
            'Firma PROFI SPOJKY s.r.o. byla založena v roce 2010. Specializuje se na dovoz spojovacích produktů a uzavíracích armatur pro vodu, plyn a topení z materiálů plast, mosaz a litina. Zastupuje dvanáct zahraničních výrobců a produkty prodává přes své obchodní partnery pod těmito značkami. Zároveň se stará o platnost certifikátů výrobků dle požadavků legislativy a poskytuje školení a technické poradenství.',
            'Produkty distribuuje partnerům ze svého centrálního skladu v Jesenici, Praha-západ. Produkty můžete zakoupit na více než 200 prodejních místech v celé České republice i na Slovensku.',
          ),
          image: await upload('stanek1.jpg', 'Stánek PROFI SPOJKY na veletrhu VODOVODY-KANALIZACE 2025'),
          caption: 'Stánek PROFI SPOJKY na veletrhu VODOVODY-KANALIZACE 2025',
        },
        {
          blockType: 'cards',
          items: [
            { title: 'Dovoz a certifikace', text: '12 zahraničních výrobců. Certifikáty výrobků mají každoroční dohled vydavatele.' },
            { title: 'Centrální sklad', text: 'Krajní 801, Jesenice u Prahy. Skladové zboží dodáváme do 48 hodin.' },
            { title: 'Školení a poradenství', text: 'Obchodní a technické poradenství pro ČR i Slovensko.' },
          ],
        },
        {
          blockType: 'gallery',
          images: [
            await upload('stanek2.jpg', 'Návštěvníci u stánku PROFI SPOJKY'),
            await upload('stanek3.jpg', 'Konzultace u stánku PROFI SPOJKY'),
            await upload('news1.jpg', 'Systém HTA PVC-C – tvarovky a trubky'),
          ],
        },
      ],
    },
  })
  await payload.create({
    collection: 'pages',
    data: {
      title: 'Pro partnery',
      slug: 'pro-partnery',
      eyebrow: 'Partneři',
      lead: '[Obsah sekce Pro partnery – doplní PROFI SPOJKY]',
      _status: 'published',
      layout: [],
    },
  })

  /* ---------- globály ---------- */
  await payload.updateGlobal({
    slug: 'site-settings',
    data: {
      phone: '+420 274 776 066',
      phone2: '+420 733 256 228',
      email: 'objednavky@profispojky.cz',
      email2: 'profispojky@profispojky.cz',
      hours: 'Po–Pá 8:00–15:30',
      warehouseStreet: 'Krajní 801',
      warehouseCity: '252 42 Jesenice',
      companyName: 'PROFI SPOJKY s.r.o.',
      seat: 'Hostivařská 497/34, 102 00 Praha 10 – Hostivař',
      ico: '21111651',
      dic: 'CZ21111651',
      registry: 'Zapsáno v obchodním rejstříku vedeném Městským soudem v Praze, vložka C 396954.',
    },
  })
  await payload.updateGlobal({
    slug: 'homepage',
    data: {
      eyebrow: 'Dovozce spojovací techniky od roku 2010',
      title: 'Spojky a armatury pro vodu, plyn a topení',
      lead: 'Dovážíme spojovací produkty a uzavírací armatury z plastu, mosazi a litiny. Zastupujeme dvanáct zahraničních výrobců a zboží distribuujeme z centrálního skladu v Jesenici přes síť obchodních partnerů.',
      stats: [
        { value: '12', label: 'zastoupených zahraničních výrobců' },
        { value: '200+', label: 'prodejních míst v ČR a SR' },
        { value: '48 h', label: 'dodání zboží skladem' },
      ],
      heroImages: [media.get('p/167.jpg'), media.get('p/173.jpg'), media.get('p/180.jpg')].filter(Boolean) as number[],
      featuredSeries: valvopatId,
      featuredText: 'Svěrné spojky pro PE trubky 20–110 mm',
      usps: [
        { icon: 'clock', text: 'Zboží skladem dodáváme do 48 hodin' },
        { icon: 'file', text: 'Certifikáty, technické listy a návody ke stažení' },
        { icon: 'pin', text: 'Koupíte u více než 200 partnerů v ČR a SR' },
        { icon: 'tool', text: 'Technické poradenství a školení' },
      ],
    },
  })

  payload.logger.info(`Seed hotov. Admin: ${email} / ${process.env.SEED_ADMIN_PASSWORD ? '(heslo z SEED_ADMIN_PASSWORD)' : password}`)
  process.exit(0)
}

// `payload run` čeká jen na import modulu – proto top-level await.
await run().catch((err) => {
  console.error(err)
  process.exit(1)
})
