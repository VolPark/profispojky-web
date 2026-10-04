import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" ADD COLUMN "tech_sheet_illustration_id" integer;
  ALTER TABLE "_products_v" ADD COLUMN "version_tech_sheet_illustration_id" integer;
  ALTER TABLE "products" ADD CONSTRAINT "products_tech_sheet_illustration_id_media_id_fk" FOREIGN KEY ("tech_sheet_illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_tech_sheet_illustration_id_media_id_fk" FOREIGN KEY ("version_tech_sheet_illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "products_tech_sheet_illustration_idx" ON "products" USING btree ("tech_sheet_illustration_id");
  CREATE INDEX "_products_v_version_version_tech_sheet_illustration_idx" ON "_products_v" USING btree ("version_tech_sheet_illustration_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "products" DROP CONSTRAINT "products_tech_sheet_illustration_id_media_id_fk";
  
  ALTER TABLE "_products_v" DROP CONSTRAINT "_products_v_version_tech_sheet_illustration_id_media_id_fk";
  
  DROP INDEX "products_tech_sheet_illustration_idx";
  DROP INDEX "_products_v_version_version_tech_sheet_illustration_idx";
  ALTER TABLE "products" DROP COLUMN "tech_sheet_illustration_id";
  ALTER TABLE "_products_v" DROP COLUMN "version_tech_sheet_illustration_id";`)
}
