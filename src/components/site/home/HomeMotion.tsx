'use client'

import { useEffect } from 'react'

/**
 * Pohyb na úvodní stránce (progresivní vylepšení – bez JS je vše vidět hned):
 * - [data-reveal] se objeví při najetí do zorného pole,
 * - [data-fill] – slova manifestu se postupně „rozsvítí“ podle scrollu,
 * - [data-count] – čísla napočítají od nuly (letopočet jen o pár let),
 * - [data-wipe] – fotka se odkryje, [data-parallax] – fotka se při scrollu posouvá pomaleji,
 * - [data-drift] – pás velkých slov jede do strany podle scrollu.
 * Při `prefers-reduced-motion` se nic neanimuje.
 */
export function HomeMotion() {
  useEffect(() => {
    const root = document.documentElement
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    root.classList.add('motion')

    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (!e.isIntersecting) return
          e.target.classList.add('in')
          if (e.target instanceof HTMLElement && e.target.dataset.count !== undefined) countUp(e.target)
          io.unobserve(e.target)
        }),
      { rootMargin: '0px 0px -12% 0px' },
    )
    document.querySelectorAll('[data-reveal], [data-count], [data-wipe]').forEach((el) => io.observe(el))

    const fills = [...document.querySelectorAll<HTMLElement>('[data-fill]')]
    const parallax = [...document.querySelectorAll<HTMLElement>('[data-parallax]')]
    const drifts = [...document.querySelectorAll<HTMLElement>('[data-drift]')]
    const onScroll = () => {
      const vh = window.innerHeight
      for (const el of parallax) {
        const r = el.parentElement!.getBoundingClientRect()
        const k = (r.top + r.height / 2 - vh / 2) / vh // -1…1 kolem středu okna
        el.style.transform = `translate3d(0, ${(k * -8).toFixed(2)}%, 0) scale(1.18)`
      }
      for (const el of drifts) {
        const r = el.getBoundingClientRect()
        el.style.transform = `translate3d(${(-(vh - r.top) * 0.35).toFixed(1)}px, 0, 0)`
      }
      for (const el of fills) {
        const r = el.getBoundingClientRect()
        // 0 = horní hrana textu na 85 % výšky okna, 1 = spodní hrana na 45 %
        const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.4)))
        const words = el.querySelectorAll('span')
        const lit = Math.round(p * words.length)
        words.forEach((w, i) => w.classList.toggle('on', i < lit))
      }
    }
    let raf = 0
    const schedule = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(onScroll)
    }
    if (fills.length || parallax.length || drifts.length) {
      onScroll()
      window.addEventListener('scroll', schedule, { passive: true })
      window.addEventListener('resize', schedule)
    }
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      root.classList.remove('motion')
    }
  }, [])
  return null
}

/** „200+“ → napočítá 0…200 a vrátí příponu; text bez čísla nechá být. */
function countUp(el: HTMLElement) {
  const text = el.textContent ?? ''
  const m = text.match(/^(\D*)(\d+)(.*)$/)
  if (!m) return
  const [, pre, num, post] = m
  const target = Number(num)
  const from = target >= 1900 ? target - 16 : 0 // letopočet: 1994 → 2010, ne 0 → 2010
  const start = performance.now()
  const dur = 1400
  const step = (t: number) => {
    const k = Math.min(1, (t - start) / dur)
    const eased = 1 - Math.pow(1 - k, 3)
    el.textContent = `${pre}${Math.round(from + (target - from) * eased)}${post}`
    if (k < 1) requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
