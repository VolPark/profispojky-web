import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "products_dimensions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL
  );
  
  CREATE TABLE "_products_v_version_dimensions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "series_shapes_sheets" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"illustration_id" integer NOT NULL,
  	"columns" varchar NOT NULL
  );
  
  CREATE TABLE "_series_v_version_shapes_sheets" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"illustration_id" integer NOT NULL,
  	"columns" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  ALTER TABLE "products_dimensions" ADD CONSTRAINT "products_dimensions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_dimensions" ADD CONSTRAINT "_products_v_version_dimensions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "series_shapes_sheets" ADD CONSTRAINT "series_shapes_sheets_illustration_id_media_id_fk" FOREIGN KEY ("illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "series_shapes_sheets" ADD CONSTRAINT "series_shapes_sheets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."series_shapes"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_series_v_version_shapes_sheets" ADD CONSTRAINT "_series_v_version_shapes_sheets_illustration_id_media_id_fk" FOREIGN KEY ("illustration_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v_version_shapes_sheets" ADD CONSTRAINT "_series_v_version_shapes_sheets_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_series_v_version_shapes"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "products_dimensions_order_idx" ON "products_dimensions" USING btree ("_order");
  CREATE INDEX "products_dimensions_parent_id_idx" ON "products_dimensions" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_dimensions_order_idx" ON "_products_v_version_dimensions" USING btree ("_order");
  CREATE INDEX "_products_v_version_dimensions_parent_id_idx" ON "_products_v_version_dimensions" USING btree ("_parent_id");
  CREATE INDEX "series_shapes_sheets_order_idx" ON "series_shapes_sheets" USING btree ("_order");
  CREATE INDEX "series_shapes_sheets_parent_id_idx" ON "series_shapes_sheets" USING btree ("_parent_id");
  CREATE INDEX "series_shapes_sheets_illustration_idx" ON "series_shapes_sheets" USING btree ("illustration_id");
  CREATE INDEX "_series_v_version_shapes_sheets_order_idx" ON "_series_v_version_shapes_sheets" USING btree ("_order");
  CREATE INDEX "_series_v_version_shapes_sheets_parent_id_idx" ON "_series_v_version_shapes_sheets" USING btree ("_parent_id");
  CREATE INDEX "_series_v_version_shapes_sheets_illustration_idx" ON "_series_v_version_shapes_sheets" USING btree ("illustration_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "products_dimensions" CASCADE;
  DROP TABLE "_products_v_version_dimensions" CASCADE;
  DROP TABLE "series_shapes_sheets" CASCADE;
  DROP TABLE "_series_v_version_shapes_sheets" CASCADE;`)
}
