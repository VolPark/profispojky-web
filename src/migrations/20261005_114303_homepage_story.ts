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
  const home = await payload.findGlobal({ slug: 'homepage', depth: 0, req })
  const data: Record<string, unknown> = {}
  if (!home.pillars?.length) {
    data.pillars = [
      {
        title: 'Dovoz a certifikace',
        text: 'Zastupujeme dvanáct zahraničních výrobců a staráme se o platnost certifikátů výrobků dle požadavků legislativy. Certifikáty mají každoroční dohled vydavatele.',
      },
      {
        title: 'Centrální sklad',
        text: 'Zboží distribuujeme partnerům z centrálního skladu v Jesenici u Prahy. Skladové zboží dodáváme do 48 hodin.',
      },
      {
        title: 'Školení a poradenství',
        text: 'Obchodní a technické poradenství a školení pro partnery v České republice i na Slovensku.',
      },
    ]
  }
  if (!home.storyImage) {
    const photos = await payload.find({
      collection: 'media',
      where: { filename: { like: 'veletrh-vodovody-kanalizace-2025' } },
      depth: 0,
      limit: 10,
      req,
    })
    const landscape = photos.docs.find((m) => (m.width ?? 0) > (m.height ?? 0))
    if (landscape) data.storyImage = landscape.id
  }
  if (home.title === 'Spojky a armatury pro vodu, plyn a topení') data.title = 'Spojky a armatury pro *vodu, plyn a topení*'
  if (Object.keys(data).length) await payload.updateGlobal({ slug: 'homepage', data, depth: 0, req })
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
