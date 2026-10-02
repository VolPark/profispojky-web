'use client'

import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
  window.addEventListener('popstate', onChange)
  return () => window.removeEventListener('popstate', onChange)
}

/**
 * Hodnota query parametru čtená až v prohlížeči. Na serveru je prázdná, takže stránka
 * zůstává statická (ISR) a statické HTML obsahuje nefiltrovaný obsah.
 */
export const useUrlParam = (name: string): string =>
  useSyncExternalStore(
    subscribe,
    () => new URLSearchParams(window.location.search).get(name) ?? '',
    () => '',
  )
