import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "series_shapes_sheets" ALTER COLUMN "columns" DROP NOT NULL;
  ALTER TABLE "_series_v_version_shapes_sheets" ALTER COLUMN "columns" DROP NOT NULL;
  ALTER TABLE "series_shapes_sheets" ADD COLUMN "note" varchar;
  ALTER TABLE "_series_v_version_shapes_sheets" ADD COLUMN "note" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "series_shapes_sheets" ALTER COLUMN "columns" SET NOT NULL;
  ALTER TABLE "_series_v_version_shapes_sheets" ALTER COLUMN "columns" SET NOT NULL;
  ALTER TABLE "series_shapes_sheets" DROP COLUMN "note";
  ALTER TABLE "_series_v_version_shapes_sheets" DROP COLUMN "note";`)
}
