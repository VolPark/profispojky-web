import type { Access, ClientUser, FieldAccess, PayloadRequest } from 'payload'

/**
 * Role v administraci:
 * - editor: aktuality, divize, značky, stránky, prodejní síť, kontakty (na katalog nesáhne)
 * - catalog: Správce katalogu – navíc produkty, řady, knihovna dokumentů a import z BC
 * - admin: SEBIT – vše včetně uživatelů, přesměrování a nastavení
 */
export const ROLES = [
  { label: 'Editor', value: 'editor' },
  { label: 'Správce katalogu', value: 'catalog' },
  { label: 'Admin', value: 'admin' },
] as const

export type Role = (typeof ROLES)[number]['value']

type MaybeUser = PayloadRequest['user'] | ClientUser | null | undefined

const roleOf = (user: MaybeUser): Role | undefined =>
  user && 'role' in user ? (user.role as Role | undefined) : undefined

export const isAdminUser = (user: MaybeUser) => roleOf(user) === 'admin'
export const isCatalogUser = (user: MaybeUser) => {
  const r = roleOf(user)
  return r === 'catalog' || r === 'admin'
}
export const isStaffUser = (user: MaybeUser) => Boolean(roleOf(user))

export const anyone: Access = () => true
export const staff: Access = ({ req }) => isStaffUser(req.user)
export const catalogStaff: Access = ({ req }) => isCatalogUser(req.user)
export const admins: Access = ({ req }) => isAdminUser(req.user)

export const adminsField: FieldAccess = ({ req }) => isAdminUser(req.user)

/** Skrytí kolekce v menu adminu pro role, které ji nespravují. */
export const hiddenUnlessCatalog = ({ user }: { user: ClientUser }) => !isCatalogUser(user)
export const hiddenUnlessAdmin = ({ user }: { user: ClientUser }) => !isAdminUser(user)
