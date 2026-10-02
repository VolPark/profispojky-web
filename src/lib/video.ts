/**
 * Videa v knihovně jsou odkazy na YouTube / Vimeo. Pro přehrání přímo na webu
 * z nich uděláme adresu přehrávače (YouTube bez cookies – nepotřebuje souhlas).
 */
export const videoEmbedUrl = (url: string | null | undefined): string | null => {
  if (!url) return null
  const yt = url.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?dnt=1`
  return null
}

/**
 * Odkaz na starý web přestane fungovat, jakmile doménu převezme tento web –
 * soubory se proto nahrávají sem, ne odkazují.
 */
export const isLegacySiteUrl = (url: string | null | undefined) =>
  Boolean(url && /^(https?:)?\/\/(www\.)?profispojky\.cz(\/|$)/i.test(url.trim()))
