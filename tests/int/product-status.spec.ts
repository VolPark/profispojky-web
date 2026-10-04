import { describe, expect, it } from 'vitest'

import { expiryState } from '@/lib/doc-expiry'
import { computeProductStatus } from '@/lib/product-status'

describe('computeProductStatus', () => {
  const complete = { images: [1], dimension: 32, series: 1, showOnWeb: true, bcActive: true, bcStatus: 'active' }

  it('kompletní aktivní položka je na webu', () => {
    expect(computeProductStatus(complete)).toEqual({ missing: [], contentComplete: true, isPublished: true })
  })

  it('nová položka z BC bez obsahu jde do fronty a není na webu', () => {
    const s = computeProductStatus({ bcActive: true, showOnWeb: true })
    expect(s.missing).toEqual(['photo', 'params', 'series'])
    expect(s.isPublished).toBe(false)
  })

  it('za parametr se počítá i položka z pole „Další parametry“', () => {
    const s = computeProductStatus({ ...complete, dimension: null, params: [{ label: 'PN', value: '16' }] })
    expect(s.contentComplete).toBe(true)
  })

  it('za parametr se počítají i technické atributy z BC', () => {
    const s = computeProductStatus({ ...complete, dimension: null, dimensions: [{ label: 'Rozměr trubky', value: '32 mm' }] })
    expect(s.contentComplete).toBe(true)
  })

  it('skrytá v BC, neaktivní nebo vypnutá položka není na webu', () => {
    expect(computeProductStatus({ ...complete, bcActive: false }).isPublished).toBe(false)
    expect(computeProductStatus({ ...complete, bcStatus: 'inactive' }).isPublished).toBe(false)
    expect(computeProductStatus({ ...complete, showOnWeb: false }).isPublished).toBe(false)
  })

  it('výprodej zůstává na webu', () => {
    expect(computeProductStatus({ ...complete, bcStatus: 'sale' }).isPublished).toBe(true)
  })
})

describe('expiryState', () => {
  const now = new Date('2026-10-02T00:00:00Z')
  it.each([
    [null, 'none'],
    ['2026-09-01', 'expired'],
    ['2026-11-15', 'expiring'],
    ['2027-06-01', 'ok'],
  ])('%s → %s', (date, state) => {
    expect(expiryState(date, now)).toBe(state)
  })
})
