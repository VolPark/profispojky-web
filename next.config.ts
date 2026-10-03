import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const indexing = process.env.ALLOW_INDEXING === 'true'

const nextConfig: NextConfig = {
  // Do spuštění ostré domény se nic neindexuje (ani PDF a obrázky).
  async headers() {
    return indexing ? [] : [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }]
  },
  // Technický list (PDF) čte písma a logo ze souborů – musí být v balíčku funkce.
  outputFileTracingIncludes: {
    '/technicky-list/**': ['./src/lib/tech-sheet/assets/**', './public/logo.svg'],
  },
  images: {
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
