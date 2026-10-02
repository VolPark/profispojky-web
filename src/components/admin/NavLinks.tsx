import Link from 'next/link'
import type { ServerProps } from 'payload'
import React from 'react'

import { isCatalogUser } from '@/access/roles'

export const NavLinks = ({ user }: ServerProps) => {
  if (!isCatalogUser(user)) return null
  return (
    <div className="ps-navlinks">
      <span className="ps-navlinks__label">Katalog</span>
      <Link className="nav__link" href="/admin/doplnit-obsah">
        Fronta „Doplnit obsah“
      </Link>
    </div>
  )
}
