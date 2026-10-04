import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media" ADD COLUMN "source_url" varchar;
  ALTER TABLE "products" ADD COLUMN "description" varchar;
  ALTER TABLE "_products_v" ADD COLUMN "version_description" varchar;
  ALTER TABLE "documents" ADD COLUMN "source_url" varchar;
  ALTER TABLE "_documents_v" ADD COLUMN "version_source_url" varchar;
  CREATE INDEX "media_source_url_idx" ON "media" USING btree ("source_url");
  CREATE INDEX "documents_source_url_idx" ON "documents" USING btree ("source_url");
  CREATE INDEX "_documents_v_version_version_source_url_idx" ON "_documents_v" USING btree ("version_source_url");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX "media_source_url_idx";
  DROP INDEX "documents_source_url_idx";
  DROP INDEX "_documents_v_version_version_source_url_idx";
  ALTER TABLE "media" DROP COLUMN "source_url";
  ALTER TABLE "products" DROP COLUMN "description";
  ALTER TABLE "_products_v" DROP COLUMN "version_description";
  ALTER TABLE "documents" DROP COLUMN "source_url";
  ALTER TABLE "_documents_v" DROP COLUMN "version_source_url";`)
}
