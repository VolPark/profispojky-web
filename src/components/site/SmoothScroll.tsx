'use client'

import Lenis from 'lenis'
import { useEffect } from 'react'

import 'lenis/dist/lenis.css'

/**
 * Plynulý scroll kolečkem myši / touchpadem (Lenis) – místo „krokového“ posunu po řádcích.
 * Dotyk na mobilu zůstává nativní. Při `prefers-reduced-motion` vypnuto.
 * Rolovací panely (filtry, mobilní menu, seznamy) se scrollují nativně – `data-lenis-prevent`.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({ lerp: 0.1, anchors: { offset: -96 }, allowNestedScroll: true, autoRaf: true })
    return () => lenis.destroy()
  }, [])
  return null
}
