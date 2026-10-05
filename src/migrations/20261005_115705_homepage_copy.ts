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
  // Čisté SQL (viz předchozí migrace) – nezávisí na aktuální konfiguraci.
  await db.execute(sql`
    UPDATE "homepage" SET "title" = 'Spojujeme *vodu, plyn a teplo*.'
    WHERE "title" IN ('Spojky a armatury pro vodu, plyn a topení', 'Spojky a armatury pro *vodu, plyn a topení*');

    UPDATE "homepage" SET "eyebrow" = 'PROFI SPOJKY · od roku 2010'
    WHERE "eyebrow" = 'Dovozce spojovací techniky od roku 2010';

    UPDATE "homepage" SET "lead" = 'Dovážíme spojky a uzavírací armatury z plastu, mosazi a litiny od dvanácti zahraničních výrobců. Přes síť obchodních partnerů je dostáváme k instalatérům po celém Česku a Slovensku.'
    WHERE "lead" LIKE 'Dovážíme spojovací produkty a uzavírací armatury z plastu, mosazi a litiny.%';

    UPDATE "homepage_stats" s SET "_order" = s."_order" + 1
    FROM "homepage" h
    WHERE s."_parent_id" = h.id
      AND (SELECT count(*) FROM "homepage_stats" x WHERE x."_parent_id" = h.id) BETWEEN 1 AND 3
      AND NOT EXISTS (SELECT 1 FROM "homepage_stats" x WHERE x."_parent_id" = h.id AND x."value" = '2010');

    INSERT INTO "homepage_stats" ("_order", "_parent_id", "id", "value", "label")
    SELECT 1, h.id, substr(md5(random()::text), 1, 24), '2010', 'rok založení'
    FROM "homepage" h
    WHERE (SELECT count(*) FROM "homepage_stats" x WHERE x."_parent_id" = h.id) BETWEEN 1 AND 3
      AND NOT EXISTS (SELECT 1 FROM "homepage_stats" x WHERE x."_parent_id" = h.id AND x."value" = '2010')
      AND NOT EXISTS (SELECT 1 FROM "homepage_stats" x WHERE x."_parent_id" = h.id AND x."_order" = 1);`)
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
