/* eslint-disable @next/next/no-img-element */
import React from 'react'

export const Logo = () => (
  <img src="/logo.svg" alt="PROFI SPOJKY" style={{ width: 260, maxWidth: '100%', height: 'auto' }} />
)

export const Icon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <rect width="24" height="24" rx="6" fill="#1C2F5A" />
    <path d="M6 12h12M12 6v12" stroke="#45C0EB" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
)
