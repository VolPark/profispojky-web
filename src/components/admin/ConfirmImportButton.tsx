'use client'

import { Button, toast } from '@payloadcms/ui'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import type { ImportDiff } from '@/lib/bc-import/types'

export const ConfirmImportButton = ({ id, summary }: { id: number | string; summary: ImportDiff }) => {
  const router = useRouter()
  const [busy, setBusy] = useState(false)

  const confirm = async () => {
    const msg = `Zapsat do katalogu ${summary.created.length} nových, ${summary.changed.length} změněných a skrýt ${summary.hidden.length} položek?`
    if (!window.confirm(msg)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/bc-imports/${id}/confirm`, { method: 'POST', credentials: 'include' })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Import selhal.')
      toast.success('Import potvrzen a zapsán do katalogu.')
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import selhal.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="ps-import__confirm">
      <Button onClick={confirm} disabled={busy} buttonStyle="primary" size="large">
        {busy ? 'Zapisuji…' : 'Potvrdit import'}
      </Button>
      <span>Změny se zapíšou najednou. Když něco selže, nezmění se nic.</span>
    </div>
  )
}
