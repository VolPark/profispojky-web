import { postgresAdapter } from '@payloadcms/db-postgres'
import { redirectsPlugin } from '@payloadcms/plugin-redirects'
import { seoPlugin } from '@payloadcms/plugin-seo'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'
import { cs } from '@payloadcms/translations/languages/cs'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { admins, anyone, hiddenUnlessAdmin } from './access/roles'
import { BcImports } from './collections/BcImports'
import { Brands } from './collections/Brands'
import { Contacts } from './collections/Contacts'
import { Divisions } from './collections/Divisions'
import { Documents } from './collections/Documents'
import { Media } from './collections/Media'
import { News } from './collections/News'
import { Pages } from './collections/Pages'
import { Partners } from './collections/Partners'
import { Products } from './collections/Products'
import { Series } from './collections/Series'
import { Users } from './collections/Users'
import { Homepage } from './globals/Homepage'
import { serverUrl } from './lib/preview'
import { mcp } from './mcp/plugin'
import { SiteSettings } from './globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: serverUrl(),
  admin: {
    user: Users.slug,
    importMap: { baseDir: path.resolve(dirname) },
    meta: { titleSuffix: ' – PROFI SPOJKY administrace' },
    avatar: 'default',
    components: {
      graphics: {
        Logo: '/components/admin/Brand#Logo',
        Icon: '/components/admin/Brand#Icon',
      },
      beforeDashboard: ['/components/admin/Dashboard#Dashboard'],
      afterNavLinks: ['/components/admin/NavLinks#NavLinks'],
      views: {
        contentQueue: {
          Component: '/components/admin/ContentQueue#ContentQueue',
          path: '/doplnit-obsah',
        },
      },
    },
  },
  i18n: { supportedLanguages: { cs }, fallbackLanguage: 'cs' },
  collections: [News, Divisions, Brands, Pages, Partners, Contacts, Media, Products, Series, Documents, BcImports, Users],
  globals: [Homepage, SiteSettings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  graphQL: { disable: true },
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || '' },
    migrationDir: path.resolve(dirname, 'migrations'),
    // Lokálně se schéma synchronizuje automaticky, v produkci přes migrace (pnpm payload migrate).
    push: process.env.NODE_ENV !== 'production',
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['pages', 'news', 'series', 'divisions'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `${(doc as { title?: string; name?: string }).title ?? (doc as { name?: string }).name ?? ''} | PROFI SPOJKY`,
    }),
    redirectsPlugin({
      collections: ['pages', 'series', 'products', 'news', 'divisions'],
      overrides: {
        labels: { singular: 'Přesměrování', plural: 'Přesměrování (301)' },
        admin: {
          group: 'Nastavení',
          hidden: hiddenUnlessAdmin,
          description: 'Mapa starých URL z profispojky.cz na nové stránky (301). Zadejte cestu bez domény, např. /download.php?fid=1503.',
        },
        access: { read: anyone, create: admins, update: admins, delete: admins },
      },
    }),
    vercelBlobStorage({
      enabled: Boolean(process.env.BLOB_READ_WRITE_TOKEN),
      // Pole pluginu (_objectKey…) musí být ve schématu vždy, jinak se lokální migrace liší od Vercelu.
      alwaysInsertFields: true,
      // Klientský upload obchází 4,5MB limit serverless funkcí (katalogy mají přes 15 MB).
      clientUploads: true,
      collections: {
        media: { disablePayloadAccessControl: true },
        documents: { disablePayloadAccessControl: true },
      },
      token: process.env.BLOB_READ_WRITE_TOKEN,
    }),
    // Musí být poslední – vidí kolekce přidané ostatními pluginy (redirects).
    mcp,
  ],
})
