import type { CollectionSlug, Endpoint, PayloadRequest, Where } from 'payload'

/**
 * DOČASNÉ: převzetí obsahu ze starého webu profispojky.cz (katalog, soubory, aktuality).
 * Běží na serveru (Vercel) – soubory stahuje přímo ze starého webu a ukládá přes Payload
 * do Vercel Blob, takže neplatí limit velikosti požadavku. Opakované spuštění nic nezduplikuje
 * (záznamy se párují podle klíče, např. kódu produktu nebo sourceUrl).
 *
 * Zapnuto jen když je nastavené MIGRATION_TOKEN (min. 32 znaků) a požadavek nese stejnou
 * hodnotu v hlavičce x-migration-token. Jinak 404. Po dokončení migrace env proměnnou smazat.
 */

type Ref = { $ref: CollectionSlug; key: string; value: string | number }
type Item = Record<string, unknown>
type Body =
  | { op: 'upsert'; collection: CollectionSlug; key: string; items: Item[]; onlyExisting?: boolean }
  | { op: 'file'; collection: 'media' | 'documents'; items: { fileUrl: string; filename: string; data: Item; matchExternalUrl?: string }[] }
  | { op: 'trash'; collection: CollectionSlug; ids: (number | string)[] }
  | { op: 'global'; slug: 'site-settings' | 'homepage'; data: Item }
  | { op: 'find'; collection: CollectionSlug; where?: Where; select?: Record<string, true>; limit?: number; page?: number; trash?: boolean }

const isRef = (v: unknown): v is Ref => Boolean(v && typeof v === 'object' && '$ref' in (v as object))

const ALLOWED_FILE_HOSTS = ['www.profispojky.cz', 'profispojky.cz']

export const migrationEndpoint: Endpoint = {
  path: '/migration',
  method: 'post',
  handler: async (req: PayloadRequest) => {
    const token = process.env.MIGRATION_TOKEN
    if (!token || token.length < 32 || req.headers.get('x-migration-token') !== token) {
      return Response.json({ message: 'Not Found' }, { status: 404 })
    }
    const body = (req.json ? await req.json() : null) as Body | null
    if (!body?.op) return Response.json({ error: 'missing op' }, { status: 400 })
    const { payload } = req
    const context = { skipInvite: true, migration: true }
    const refCache = new Map<string, number | string | null>()

    const resolveRef = async (r: Ref) => {
      const k = `${r.$ref}|${r.key}|${r.value}`
      if (!refCache.has(k)) {
        const res = await payload.find({
          collection: r.$ref,
          where: { [r.key]: { equals: r.value } },
          limit: 1,
          depth: 0,
          select: {},
          overrideAccess: true,
          trash: true,
        })
        refCache.set(k, res.docs[0]?.id ?? null)
      }
      return refCache.get(k)
    }
    const resolve = async (v: unknown): Promise<unknown> => {
      if (isRef(v)) return resolveRef(v)
      if (Array.isArray(v)) return (await Promise.all(v.map(resolve))).filter((x) => x !== null)
      if (v && typeof v === 'object') {
        const out: Item = {}
        for (const [k, val] of Object.entries(v)) out[k] = await resolve(val)
        return out
      }
      return v
    }
    const findBy = async (collection: CollectionSlug, where: Where) =>
      (await payload.find({ collection, where, limit: 1, depth: 0, overrideAccess: true, trash: true })).docs[0] as unknown as
        | (Item & { id: number | string; deletedAt?: string | null; filename?: string | null })
        | undefined

    const results: Item[] = []
    try {
      if (body.op === 'find') {
        const res = await payload.find({
          collection: body.collection,
          where: body.where,
          select: body.select,
          limit: body.limit ?? 100,
          page: body.page ?? 1,
          depth: 0,
          overrideAccess: true,
          trash: body.trash ?? false,
        })
        return Response.json({ docs: res.docs, totalDocs: res.totalDocs, totalPages: res.totalPages })
      }

      if (body.op === 'global') {
        const data = (await resolve(body.data)) as Item
        await payload.updateGlobal({ slug: body.slug, data, overrideAccess: true, depth: 0, context } as never)
        return Response.json({ results: [{ key: body.slug, action: 'updated' }] })
      }

      if (body.op === 'trash') {
        for (const id of body.ids) {
          await payload.update({ collection: body.collection, id, data: { deletedAt: new Date().toISOString() }, overrideAccess: true, context })
          results.push({ id, action: 'trashed' })
        }
        return Response.json({ results })
      }

      if (body.op === 'upsert') {
        for (const raw of body.items) {
          const data = (await resolve(raw)) as Item
          const keyValue = data[body.key]
          try {
            const existing = keyValue === undefined ? undefined : await findBy(body.collection, { [body.key]: { equals: keyValue } })
            if (existing) {
              await payload.update({
                collection: body.collection,
                id: existing.id,
                data: { ...data, ...(existing.deletedAt ? { deletedAt: null } : {}) },
                overrideAccess: true,
                depth: 0,
                context,
                trash: true,
              })
              results.push({ key: keyValue, id: existing.id, action: 'updated' })
            } else if (body.onlyExisting) {
              results.push({ key: keyValue, action: 'skipped' })
            } else {
              const doc = await payload.create({ collection: body.collection, data, overrideAccess: true, depth: 0, context } as never)
              results.push({ key: keyValue, id: doc.id, action: 'created' })
            }
          } catch (err) {
            results.push({ key: keyValue, action: 'error', error: err instanceof Error ? err.message : String(err) })
          }
        }
        return Response.json({ results })
      }

      if (body.op === 'file') {
        for (const item of body.items) {
          const data = (await resolve(item.data)) as Item
          const sourceUrl = data.sourceUrl as string
          try {
            const host = new URL(item.fileUrl).hostname
            if (!ALLOWED_FILE_HOSTS.includes(host)) throw new Error(`host ${host} není povolen`)
            let existing = await findBy(body.collection, { sourceUrl: { equals: sourceUrl } })
            if (!existing && item.matchExternalUrl) {
              existing = await findBy(body.collection, { externalUrl: { equals: item.matchExternalUrl } })
            }
            if (existing?.filename) {
              // Soubor už je převzatý – jen aktualizovat údaje.
              await payload.update({ collection: body.collection, id: existing.id, data, overrideAccess: true, depth: 0, context, trash: true })
              results.push({ key: sourceUrl, id: existing.id, action: 'updated' })
              continue
            }
            const res = await fetch(item.fileUrl, { signal: AbortSignal.timeout(60_000) })
            if (!res.ok) throw new Error(`stažení ${res.status}`)
            const buf = Buffer.from(await res.arrayBuffer())
            const mimetype = (res.headers.get('content-type') || 'application/octet-stream').split(';')[0].trim()
            const file = { data: buf, mimetype, name: item.filename, size: buf.length }
            if (existing) {
              await payload.update({
                collection: body.collection,
                id: existing.id,
                data: { ...data, externalUrl: null, ...(existing.deletedAt ? { deletedAt: null } : {}) },
                file,
                overrideAccess: true,
                depth: 0,
                context,
                trash: true,
              })
              results.push({ key: sourceUrl, id: existing.id, action: 'file-added' })
            } else {
              const doc = await payload.create({ collection: body.collection, data, file, overrideAccess: true, depth: 0, context } as never)
              results.push({ key: sourceUrl, id: doc.id, action: 'created' })
            }
          } catch (err) {
            results.push({ key: sourceUrl, action: 'error', error: err instanceof Error ? err.message : String(err) })
          }
        }
        return Response.json({ results })
      }
    } catch (err) {
      return Response.json({ error: err instanceof Error ? err.message : String(err), results }, { status: 500 })
    }
    return Response.json({ error: 'unknown op' }, { status: 400 })
  },
}
