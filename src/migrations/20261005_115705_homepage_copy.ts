import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" ADD COLUMN "copy_manifesto" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_numbers_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_brands_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_brands_text" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_story_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_divisions_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_find_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_band_words" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_cta_title" varchar;
  ALTER TABLE "homepage" ADD COLUMN "copy_cta_text" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_manifesto" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_numbers_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_brands_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_brands_text" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_story_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_divisions_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_find_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_band_words" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_cta_title" varchar;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_copy_cta_text" varchar;`)

  // Nové texty úvodu – přepíše jen původní texty z prototypu, ruční úpravy z adminu nechá být.
  const home = await payload.findGlobal({ slug: 'homepage', depth: 0, req })
  const data: Record<string, unknown> = {}
  if (['Spojky a armatury pro vodu, plyn a topení', 'Spojky a armatury pro *vodu, plyn a topení*'].includes(home.title))
    data.title = 'Spojujeme *vodu, plyn a teplo*.'
  if (home.eyebrow === 'Dovozce spojovací techniky od roku 2010') data.eyebrow = 'PROFI SPOJKY · od roku 2010'
  if (home.lead?.startsWith('Dovážíme spojovací produkty a uzavírací armatury z plastu, mosazi a litiny.'))
    data.lead =
      'Dovážíme spojky a uzavírací armatury z plastu, mosazi a litiny od dvanácti zahraničních výrobců. Přes síť obchodních partnerů je dostáváme k instalatérům po celém Česku a Slovensku.'
  if (home.stats?.length && home.stats.length < 4 && !home.stats.some((s) => s.value === '2010'))
    data.stats = [{ value: '2010', label: 'rok založení' }, ...home.stats.map(({ value, label }) => ({ value, label }))]
  if (Object.keys(data).length) await payload.updateGlobal({ slug: 'homepage', data, depth: 0, req })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage" DROP COLUMN "copy_manifesto";
  ALTER TABLE "homepage" DROP COLUMN "copy_numbers_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_brands_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_brands_text";
  ALTER TABLE "homepage" DROP COLUMN "copy_story_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_divisions_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_find_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_band_words";
  ALTER TABLE "homepage" DROP COLUMN "copy_cta_title";
  ALTER TABLE "homepage" DROP COLUMN "copy_cta_text";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_manifesto";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_numbers_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_brands_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_brands_text";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_story_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_divisions_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_find_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_band_words";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_cta_title";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_copy_cta_text";`)
}
