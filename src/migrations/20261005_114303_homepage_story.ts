import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "homepage_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL
  );
  
  CREATE TABLE "_homepage_v_version_pillars" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "homepage" ADD COLUMN "story_image_id" integer;
  ALTER TABLE "_homepage_v" ADD COLUMN "version_story_image_id" integer;
  ALTER TABLE "homepage_pillars" ADD CONSTRAINT "homepage_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_pillars" ADD CONSTRAINT "_homepage_v_version_pillars_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "homepage_pillars_order_idx" ON "homepage_pillars" USING btree ("_order");
  CREATE INDEX "homepage_pillars_parent_id_idx" ON "homepage_pillars" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_pillars_order_idx" ON "_homepage_v_version_pillars" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_pillars_parent_id_idx" ON "_homepage_v_version_pillars" USING btree ("_parent_id");
  ALTER TABLE "homepage" ADD CONSTRAINT "homepage_story_image_id_media_id_fk" FOREIGN KEY ("story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_story_image_id_media_id_fk" FOREIGN KEY ("version_story_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "homepage_story_image_idx" ON "homepage" USING btree ("story_image_id");
  CREATE INDEX "_homepage_v_version_version_story_image_idx" ON "_homepage_v" USING btree ("version_story_image_id");`)

  // Výchozí obsah nového bloku „Kdo jsme“ – texty ze stránky O firmě; vyplní se jen prázdná pole.
  // Čisté SQL: Payload API by četlo podle aktuální konfigurace, která může mít sloupce z pozdějších migrací.
  await db.execute(sql`
    INSERT INTO "homepage_pillars" ("_order", "_parent_id", "id", "title", "text")
    SELECT v.ord, h.id, substr(md5(random()::text || v.ord), 1, 24), v.title, v.body
    FROM "homepage" h
    CROSS JOIN (VALUES
      (1, 'Dovoz a certifikace', 'Zastupujeme dvanáct zahraničních výrobců a staráme se o platnost certifikátů výrobků dle požadavků legislativy. Certifikáty mají každoroční dohled vydavatele.'),
      (2, 'Centrální sklad', 'Zboží distribuujeme partnerům z centrálního skladu v Jesenici u Prahy. Skladové zboží dodáváme do 48 hodin.'),
      (3, 'Školení a poradenství', 'Obchodní a technické poradenství a školení pro partnery v České republice i na Slovensku.')
    ) AS v(ord, title, body)
    WHERE NOT EXISTS (SELECT 1 FROM "homepage_pillars" p WHERE p."_parent_id" = h.id);

    UPDATE "homepage" SET "story_image_id" = (
      SELECT m.id FROM "media" m
      WHERE m.filename LIKE 'veletrh-vodovody-kanalizace-2025%' AND m.width > m.height
      ORDER BY m.id LIMIT 1
    ) WHERE "story_image_id" IS NULL;

    UPDATE "homepage" SET "title" = 'Spojky a armatury pro *vodu, plyn a topení*'
    WHERE "title" = 'Spojky a armatury pro vodu, plyn a topení';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_pillars" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_pillars" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "homepage_pillars" CASCADE;
  DROP TABLE "_homepage_v_version_pillars" CASCADE;
  ALTER TABLE "homepage" DROP CONSTRAINT "homepage_story_image_id_media_id_fk";
  
  ALTER TABLE "_homepage_v" DROP CONSTRAINT "_homepage_v_version_story_image_id_media_id_fk";
  
  DROP INDEX "homepage_story_image_idx";
  DROP INDEX "_homepage_v_version_version_story_image_idx";
  ALTER TABLE "homepage" DROP COLUMN "story_image_id";
  ALTER TABLE "_homepage_v" DROP COLUMN "version_story_image_id";`)
}
