import { APIError, type CollectionBeforeDeleteHook } from 'payload'

import { isAdminUser } from '@/access/roles'

/**
 * Redaktoři mohou položky přesouvat do koše (to je update `deletedAt`, hook se nespouští),
 * ale natrvalo mazat smí jen Admin. Chrání před nevratnou ztrátou obsahu.
 */
export const adminOnlyPermanentDelete: CollectionBeforeDeleteHook = ({ req }) => {
  if (!isAdminUser(req.user)) {
    throw new APIError('Natrvalo mazat může jen správce webu. Položku přesuňte do koše – dá se z něj obnovit.', 403)
  }
}
