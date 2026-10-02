/**
 * Veřejná URL webu. Na Vercel preview se bere alias větve (VERCEL_BRANCH_URL),
 * takže preview funguje bez ručně nastavené NEXT_PUBLIC_SERVER_URL.
 */
export const serverUrl = () => {
  if (process.env.NEXT_PUBLIC_SERVER_URL) return process.env.NEXT_PUBLIC_SERVER_URL
  if (process.env.VERCEL_ENV === 'preview' && process.env.VERCEL_BRANCH_URL) return `https://${process.env.VERCEL_BRANCH_URL}`
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return ''
}

/** URL náhledu – route ověří přihlášení v adminu a zapne draft mode. */
export const previewUrl = (path: string) => `${serverUrl()}/next/preview?path=${encodeURIComponent(path)}`
