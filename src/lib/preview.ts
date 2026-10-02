export const serverUrl = () => process.env.NEXT_PUBLIC_SERVER_URL || ''

/** URL náhledu – route ověří přihlášení v adminu a zapne draft mode. */
export const previewUrl = (path: string) => `${serverUrl()}/next/preview?path=${encodeURIComponent(path)}`
