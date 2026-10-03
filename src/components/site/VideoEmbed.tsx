import React from 'react'

import { videoEmbedUrl } from '@/lib/video'

/** Přehrávač YouTube / Vimeo; neznámý odkaz se zobrazí jen jako odkaz. */
export const VideoEmbed = ({ title, url }: { title: string; url?: string | null }) => {
  const src = videoEmbedUrl(url)
  if (!src) {
    return url ? (
      <p>
        <a href={url} target="_blank" rel="noopener">
          {title}
        </a>
      </p>
    ) : null
  }
  return (
    <figure className="video">
      <div className="video-frame">
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
      <figcaption>{title}</figcaption>
    </figure>
  )
}
