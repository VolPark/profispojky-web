import React from 'react'

export type IconName =
  | 'phone'
  | 'search'
  | 'arrow'
  | 'clock'
  | 'pin'
  | 'tool'
  | 'file'
  | 'play'
  | 'mail'
  | 'chev'
  | 'menu'
  | 'filter'
  | 'box'
  | 'check'
  | 'x'
  | 'camera'

export const Icon = ({ name }: { name: IconName | string }) => (
  <svg className="icon" aria-hidden="true">
    <use href={`#i-${name}`} />
  </svg>
)

/** SVG sprite – vkládá se jednou do layoutu. */
export const IconSprite = () => (
  <svg xmlns="http://www.w3.org/2000/svg" style={{ display: 'none' }} aria-hidden="true">
    <symbol id="i-phone" viewBox="0 0 24 24">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
    </symbol>
    <symbol id="i-search" viewBox="0 0 24 24">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </symbol>
    <symbol id="i-arrow" viewBox="0 0 24 24">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </symbol>
    <symbol id="i-clock" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </symbol>
    <symbol id="i-pin" viewBox="0 0 24 24">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z" />
      <circle cx="12" cy="10" r="3" />
    </symbol>
    <symbol id="i-tool" viewBox="0 0 24 24">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9l-3.8 3.8z" />
    </symbol>
    <symbol id="i-file" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" />
    </symbol>
    <symbol id="i-play" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m10 9 5 3-5 3z" />
    </symbol>
    <symbol id="i-mail" viewBox="0 0 24 24">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 6-10 7L2 6" />
    </symbol>
    <symbol id="i-chev" viewBox="0 0 24 24">
      <path d="m9 18 6-6-6-6" />
    </symbol>
    <symbol id="i-menu" viewBox="0 0 24 24">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </symbol>
    <symbol id="i-filter" viewBox="0 0 24 24">
      <path d="M22 3H2l8 9.5V19l4 2v-8.5z" />
    </symbol>
    <symbol id="i-box" viewBox="0 0 24 24">
      <path d="M21 8 12 3 3 8v8l9 5 9-5z" />
      <path d="M3 8l9 5 9-5M12 13v8" />
    </symbol>
    <symbol id="i-check" viewBox="0 0 24 24">
      <path d="M20 6 9 17l-5-5" />
    </symbol>
    <symbol id="i-x" viewBox="0 0 24 24">
      <path d="M18 6 6 18M6 6l12 12" />
    </symbol>
    <symbol id="i-camera" viewBox="0 0 24 24">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </symbol>
  </svg>
)
