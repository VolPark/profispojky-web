import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum__divisions_v_version_status" AS ENUM('active', 'upcoming', 'hidden');
  CREATE TYPE "public"."enum__partners_v_version_region" AS ENUM('praha', 'stredocesky-kraj', 'jihocesky-kraj', 'plzensky-kraj', 'karlovarsky-kraj', 'ustecky-kraj', 'liberecky-kraj', 'kralovehradecky-kraj', 'pardubicky-kraj', 'vysocina', 'moravskoslezsky-kraj', 'olomoucky-kraj', 'zlinsky-kraj', 'jihomoravsky-kraj', 'bratislavsky-kraj', 'trnavsky-kraj', 'trenciansky-kraj', 'nitransky-kraj', 'banskobystricky-kraj', 'zilinsky-kraj', 'presovsky-kraj', 'kosicky-kraj');
  CREATE TYPE "public"."enum__products_v_version_missing" AS ENUM('photo', 'params', 'series');
  CREATE TYPE "public"."enum__products_v_version_bc_status" AS ENUM('active', 'sale', 'inactive');
  CREATE TYPE "public"."enum__documents_v_version_type" AS ENUM('katalog', 'letak', 'tl', 'cert', 'shoda', 'navod', 'video', 'jine');
  CREATE TYPE "public"."enum__homepage_v_version_usps_icon" AS ENUM('clock', 'file', 'pin', 'tool', 'check', 'phone', 'box');
  CREATE TABLE "_divisions_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar,
  	"version_status" "enum__divisions_v_version_status" DEFAULT 'active',
  	"version_order" numeric DEFAULT 10,
  	"version_perex" varchar NOT NULL,
  	"version_image_id" integer,
  	"version_body" jsonb,
  	"version_catalog_document_id" integer,
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_brands_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 10,
  	"version_manufacturer" varchar,
  	"version_description" varchar NOT NULL,
  	"version_logo_id" integer,
  	"version_website" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_partners_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_address" varchar NOT NULL,
  	"version_region" "enum__partners_v_version_region" NOT NULL,
  	"version_phone" varchar,
  	"version_web" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_contacts_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_role" varchar NOT NULL,
  	"version_phone" varchar,
  	"version_email" varchar,
  	"version_photo_id" integer,
  	"version_order" numeric DEFAULT 10,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_version_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_products_v_version_missing" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__products_v_version_missing",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_products_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_code" varchar NOT NULL,
  	"version_name" varchar NOT NULL,
  	"version_subtitle" varchar,
  	"version_series_id" integer,
  	"version_shape" varchar,
  	"version_dimension" numeric,
  	"version_thread" varchar,
  	"version_product_type" varchar,
  	"version_ean" varchar,
  	"version_unit" varchar,
  	"version_bc_series_code" varchar,
  	"version_bc_status" "enum__products_v_version_bc_status" DEFAULT 'active',
  	"version_bc_active" boolean DEFAULT true,
  	"version_last_imported_at" timestamp(3) with time zone,
  	"version_show_on_web" boolean DEFAULT true,
  	"version_is_published" boolean,
  	"version_content_complete" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_products_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_series_v_version_common_params" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"value" varchar NOT NULL,
  	"highlight" boolean DEFAULT false,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_series_v_version_shapes" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"code" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_series_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_name" varchar NOT NULL,
  	"version_bc_code" varchar,
  	"version_slug" varchar,
  	"version_order" numeric DEFAULT 10,
  	"version_division_id" integer NOT NULL,
  	"version_brand_id" integer NOT NULL,
  	"version_summary" varchar NOT NULL,
  	"version_title" varchar,
  	"version_lead" varchar,
  	"version_description" jsonb,
  	"version_media" varchar,
  	"version_image_id" integer,
  	"version_dimension_label" varchar DEFAULT 'Rozměr PE trubky',
  	"version_dimension_unit" varchar DEFAULT 'mm',
  	"version_thread_label" varchar DEFAULT 'Závit',
  	"version_meta_title" varchar,
  	"version_meta_description" varchar,
  	"version_meta_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_documents_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar NOT NULL,
  	"version_type" "enum__documents_v_version_type" NOT NULL,
  	"version_edition" varchar,
  	"version_external_url" varchar,
  	"version_issued_at" timestamp(3) with time zone,
  	"version_valid_until" timestamp(3) with time zone,
  	"version_show_in_library" boolean DEFAULT true,
  	"version_featured" boolean DEFAULT false,
  	"version_prefix" varchar DEFAULT '',
  	"version__objectkey" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version_deleted_at" timestamp(3) with time zone,
  	"version_url" varchar,
  	"version_thumbnail_u_r_l" varchar,
  	"version_filename" varchar,
  	"version_mime_type" varchar,
  	"version_filesize" numeric,
  	"version_width" numeric,
  	"version_height" numeric,
  	"version_focal_x" numeric,
  	"version_focal_y" numeric,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_documents_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"series_id" integer,
  	"products_id" integer,
  	"divisions_id" integer,
  	"brands_id" integer
  );
  
  CREATE TABLE "_homepage_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar NOT NULL,
  	"label" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v_version_usps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__homepage_v_version_usps_icon" DEFAULT 'check',
  	"text" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_homepage_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_eyebrow" varchar,
  	"version_title" varchar NOT NULL,
  	"version_lead" varchar,
  	"version_featured_series_id" integer,
  	"version_featured_text" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "_homepage_v_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "_site_settings_v_version_footer_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_settings_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_phone" varchar DEFAULT '+420 274 776 066' NOT NULL,
  	"version_phone2" varchar,
  	"version_email" varchar DEFAULT 'objednavky@profispojky.cz' NOT NULL,
  	"version_email2" varchar,
  	"version_hours" varchar DEFAULT 'Po–Pá 8:00–15:30',
  	"version_warehouse_street" varchar DEFAULT 'Krajní 801',
  	"version_warehouse_city" varchar DEFAULT '252 42 Jesenice',
  	"version_company_name" varchar DEFAULT 'PROFI SPOJKY s.r.o.',
  	"version_seat" varchar DEFAULT 'Hostivařská 497/34, 102 00 Praha 10 – Hostivař',
  	"version_ico" varchar DEFAULT '21111651',
  	"version_dic" varchar DEFAULT 'CZ21111651',
  	"version_registry" varchar,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "news" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_news_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "divisions" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "brands" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "pages" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_pages_v" ADD COLUMN "version_deleted_at" timestamp(3) with time zone;
  ALTER TABLE "partners" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "contacts" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "media" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "products" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "series" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "documents" ADD COLUMN "deleted_at" timestamp(3) with time zone;
  ALTER TABLE "_divisions_v" ADD CONSTRAINT "_divisions_v_parent_id_divisions_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."divisions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_divisions_v" ADD CONSTRAINT "_divisions_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_divisions_v" ADD CONSTRAINT "_divisions_v_version_catalog_document_id_documents_id_fk" FOREIGN KEY ("version_catalog_document_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_divisions_v" ADD CONSTRAINT "_divisions_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_parent_id_brands_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_brands_v" ADD CONSTRAINT "_brands_v_version_logo_id_media_id_fk" FOREIGN KEY ("version_logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_partners_v" ADD CONSTRAINT "_partners_v_parent_id_partners_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."partners"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_v" ADD CONSTRAINT "_contacts_v_parent_id_contacts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_contacts_v" ADD CONSTRAINT "_contacts_v_version_photo_id_media_id_fk" FOREIGN KEY ("version_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_version_params" ADD CONSTRAINT "_products_v_version_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_version_missing" ADD CONSTRAINT "_products_v_version_missing_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_parent_id_products_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."products"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v" ADD CONSTRAINT "_products_v_version_series_id_series_id_fk" FOREIGN KEY ("version_series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_products_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_products_v_rels" ADD CONSTRAINT "_products_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_series_v_version_common_params" ADD CONSTRAINT "_series_v_version_common_params_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_series_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_series_v_version_shapes" ADD CONSTRAINT "_series_v_version_shapes_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_series_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_parent_id_series_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_division_id_divisions_id_fk" FOREIGN KEY ("version_division_id") REFERENCES "public"."divisions"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_brand_id_brands_id_fk" FOREIGN KEY ("version_brand_id") REFERENCES "public"."brands"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_series_v" ADD CONSTRAINT "_series_v_version_meta_image_id_media_id_fk" FOREIGN KEY ("version_meta_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v" ADD CONSTRAINT "_documents_v_parent_id_documents_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."documents"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_documents_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_series_fk" FOREIGN KEY ("series_id") REFERENCES "public"."series"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_products_fk" FOREIGN KEY ("products_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_divisions_fk" FOREIGN KEY ("divisions_id") REFERENCES "public"."divisions"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_documents_v_rels" ADD CONSTRAINT "_documents_v_rels_brands_fk" FOREIGN KEY ("brands_id") REFERENCES "public"."brands"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_stats" ADD CONSTRAINT "_homepage_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_version_usps" ADD CONSTRAINT "_homepage_v_version_usps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v" ADD CONSTRAINT "_homepage_v_version_featured_series_id_series_id_fk" FOREIGN KEY ("version_featured_series_id") REFERENCES "public"."series"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_homepage_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_homepage_v_rels" ADD CONSTRAINT "_homepage_v_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_settings_v_version_footer_links" ADD CONSTRAINT "_site_settings_v_version_footer_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_settings_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "_divisions_v_parent_idx" ON "_divisions_v" USING btree ("parent_id");
  CREATE INDEX "_divisions_v_version_version_slug_idx" ON "_divisions_v" USING btree ("version_slug");
  CREATE INDEX "_divisions_v_version_version_image_idx" ON "_divisions_v" USING btree ("version_image_id");
  CREATE INDEX "_divisions_v_version_version_catalog_document_idx" ON "_divisions_v" USING btree ("version_catalog_document_id");
  CREATE INDEX "_divisions_v_version_meta_version_meta_image_idx" ON "_divisions_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_divisions_v_version_version_updated_at_idx" ON "_divisions_v" USING btree ("version_updated_at");
  CREATE INDEX "_divisions_v_version_version_created_at_idx" ON "_divisions_v" USING btree ("version_created_at");
  CREATE INDEX "_divisions_v_version_version_deleted_at_idx" ON "_divisions_v" USING btree ("version_deleted_at");
  CREATE INDEX "_divisions_v_created_at_idx" ON "_divisions_v" USING btree ("created_at");
  CREATE INDEX "_divisions_v_updated_at_idx" ON "_divisions_v" USING btree ("updated_at");
  CREATE INDEX "_brands_v_parent_idx" ON "_brands_v" USING btree ("parent_id");
  CREATE INDEX "_brands_v_version_version_slug_idx" ON "_brands_v" USING btree ("version_slug");
  CREATE INDEX "_brands_v_version_version_logo_idx" ON "_brands_v" USING btree ("version_logo_id");
  CREATE INDEX "_brands_v_version_version_updated_at_idx" ON "_brands_v" USING btree ("version_updated_at");
  CREATE INDEX "_brands_v_version_version_created_at_idx" ON "_brands_v" USING btree ("version_created_at");
  CREATE INDEX "_brands_v_version_version_deleted_at_idx" ON "_brands_v" USING btree ("version_deleted_at");
  CREATE INDEX "_brands_v_created_at_idx" ON "_brands_v" USING btree ("created_at");
  CREATE INDEX "_brands_v_updated_at_idx" ON "_brands_v" USING btree ("updated_at");
  CREATE INDEX "_partners_v_parent_idx" ON "_partners_v" USING btree ("parent_id");
  CREATE INDEX "_partners_v_version_version_region_idx" ON "_partners_v" USING btree ("version_region");
  CREATE INDEX "_partners_v_version_version_updated_at_idx" ON "_partners_v" USING btree ("version_updated_at");
  CREATE INDEX "_partners_v_version_version_created_at_idx" ON "_partners_v" USING btree ("version_created_at");
  CREATE INDEX "_partners_v_version_version_deleted_at_idx" ON "_partners_v" USING btree ("version_deleted_at");
  CREATE INDEX "_partners_v_created_at_idx" ON "_partners_v" USING btree ("created_at");
  CREATE INDEX "_partners_v_updated_at_idx" ON "_partners_v" USING btree ("updated_at");
  CREATE INDEX "_contacts_v_parent_idx" ON "_contacts_v" USING btree ("parent_id");
  CREATE INDEX "_contacts_v_version_version_photo_idx" ON "_contacts_v" USING btree ("version_photo_id");
  CREATE INDEX "_contacts_v_version_version_updated_at_idx" ON "_contacts_v" USING btree ("version_updated_at");
  CREATE INDEX "_contacts_v_version_version_created_at_idx" ON "_contacts_v" USING btree ("version_created_at");
  CREATE INDEX "_contacts_v_version_version_deleted_at_idx" ON "_contacts_v" USING btree ("version_deleted_at");
  CREATE INDEX "_contacts_v_created_at_idx" ON "_contacts_v" USING btree ("created_at");
  CREATE INDEX "_contacts_v_updated_at_idx" ON "_contacts_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_version_params_order_idx" ON "_products_v_version_params" USING btree ("_order");
  CREATE INDEX "_products_v_version_params_parent_id_idx" ON "_products_v_version_params" USING btree ("_parent_id");
  CREATE INDEX "_products_v_version_missing_order_idx" ON "_products_v_version_missing" USING btree ("order");
  CREATE INDEX "_products_v_version_missing_parent_idx" ON "_products_v_version_missing" USING btree ("parent_id");
  CREATE INDEX "_products_v_parent_idx" ON "_products_v" USING btree ("parent_id");
  CREATE INDEX "_products_v_version_version_code_idx" ON "_products_v" USING btree ("version_code");
  CREATE INDEX "_products_v_version_version_series_idx" ON "_products_v" USING btree ("version_series_id");
  CREATE INDEX "_products_v_version_version_shape_idx" ON "_products_v" USING btree ("version_shape");
  CREATE INDEX "_products_v_version_version_dimension_idx" ON "_products_v" USING btree ("version_dimension");
  CREATE INDEX "_products_v_version_version_product_type_idx" ON "_products_v" USING btree ("version_product_type");
  CREATE INDEX "_products_v_version_version_is_published_idx" ON "_products_v" USING btree ("version_is_published");
  CREATE INDEX "_products_v_version_version_content_complete_idx" ON "_products_v" USING btree ("version_content_complete");
  CREATE INDEX "_products_v_version_version_updated_at_idx" ON "_products_v" USING btree ("version_updated_at");
  CREATE INDEX "_products_v_version_version_created_at_idx" ON "_products_v" USING btree ("version_created_at");
  CREATE INDEX "_products_v_version_version_deleted_at_idx" ON "_products_v" USING btree ("version_deleted_at");
  CREATE INDEX "_products_v_created_at_idx" ON "_products_v" USING btree ("created_at");
  CREATE INDEX "_products_v_updated_at_idx" ON "_products_v" USING btree ("updated_at");
  CREATE INDEX "_products_v_rels_order_idx" ON "_products_v_rels" USING btree ("order");
  CREATE INDEX "_products_v_rels_parent_idx" ON "_products_v_rels" USING btree ("parent_id");
  CREATE INDEX "_products_v_rels_path_idx" ON "_products_v_rels" USING btree ("path");
  CREATE INDEX "_products_v_rels_media_id_idx" ON "_products_v_rels" USING btree ("media_id");
  CREATE INDEX "_series_v_version_common_params_order_idx" ON "_series_v_version_common_params" USING btree ("_order");
  CREATE INDEX "_series_v_version_common_params_parent_id_idx" ON "_series_v_version_common_params" USING btree ("_parent_id");
  CREATE INDEX "_series_v_version_shapes_order_idx" ON "_series_v_version_shapes" USING btree ("_order");
  CREATE INDEX "_series_v_version_shapes_parent_id_idx" ON "_series_v_version_shapes" USING btree ("_parent_id");
  CREATE INDEX "_series_v_parent_idx" ON "_series_v" USING btree ("parent_id");
  CREATE INDEX "_series_v_version_version_bc_code_idx" ON "_series_v" USING btree ("version_bc_code");
  CREATE INDEX "_series_v_version_version_slug_idx" ON "_series_v" USING btree ("version_slug");
  CREATE INDEX "_series_v_version_version_division_idx" ON "_series_v" USING btree ("version_division_id");
  CREATE INDEX "_series_v_version_version_brand_idx" ON "_series_v" USING btree ("version_brand_id");
  CREATE INDEX "_series_v_version_version_image_idx" ON "_series_v" USING btree ("version_image_id");
  CREATE INDEX "_series_v_version_meta_version_meta_image_idx" ON "_series_v" USING btree ("version_meta_image_id");
  CREATE INDEX "_series_v_version_version_updated_at_idx" ON "_series_v" USING btree ("version_updated_at");
  CREATE INDEX "_series_v_version_version_created_at_idx" ON "_series_v" USING btree ("version_created_at");
  CREATE INDEX "_series_v_version_version_deleted_at_idx" ON "_series_v" USING btree ("version_deleted_at");
  CREATE INDEX "_series_v_created_at_idx" ON "_series_v" USING btree ("created_at");
  CREATE INDEX "_series_v_updated_at_idx" ON "_series_v" USING btree ("updated_at");
  CREATE INDEX "_documents_v_parent_idx" ON "_documents_v" USING btree ("parent_id");
  CREATE INDEX "_documents_v_version_version_valid_until_idx" ON "_documents_v" USING btree ("version_valid_until");
  CREATE INDEX "_documents_v_version_version_updated_at_idx" ON "_documents_v" USING btree ("version_updated_at");
  CREATE INDEX "_documents_v_version_version_created_at_idx" ON "_documents_v" USING btree ("version_created_at");
  CREATE INDEX "_documents_v_version_version_deleted_at_idx" ON "_documents_v" USING btree ("version_deleted_at");
  CREATE INDEX "_documents_v_version_version_filename_idx" ON "_documents_v" USING btree ("version_filename");
  CREATE INDEX "_documents_v_created_at_idx" ON "_documents_v" USING btree ("created_at");
  CREATE INDEX "_documents_v_updated_at_idx" ON "_documents_v" USING btree ("updated_at");
  CREATE INDEX "_documents_v_rels_order_idx" ON "_documents_v_rels" USING btree ("order");
  CREATE INDEX "_documents_v_rels_parent_idx" ON "_documents_v_rels" USING btree ("parent_id");
  CREATE INDEX "_documents_v_rels_path_idx" ON "_documents_v_rels" USING btree ("path");
  CREATE INDEX "_documents_v_rels_series_id_idx" ON "_documents_v_rels" USING btree ("series_id");
  CREATE INDEX "_documents_v_rels_products_id_idx" ON "_documents_v_rels" USING btree ("products_id");
  CREATE INDEX "_documents_v_rels_divisions_id_idx" ON "_documents_v_rels" USING btree ("divisions_id");
  CREATE INDEX "_documents_v_rels_brands_id_idx" ON "_documents_v_rels" USING btree ("brands_id");
  CREATE INDEX "_homepage_v_version_stats_order_idx" ON "_homepage_v_version_stats" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_stats_parent_id_idx" ON "_homepage_v_version_stats" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_usps_order_idx" ON "_homepage_v_version_usps" USING btree ("_order");
  CREATE INDEX "_homepage_v_version_usps_parent_id_idx" ON "_homepage_v_version_usps" USING btree ("_parent_id");
  CREATE INDEX "_homepage_v_version_version_featured_series_idx" ON "_homepage_v" USING btree ("version_featured_series_id");
  CREATE INDEX "_homepage_v_created_at_idx" ON "_homepage_v" USING btree ("created_at");
  CREATE INDEX "_homepage_v_updated_at_idx" ON "_homepage_v" USING btree ("updated_at");
  CREATE INDEX "_homepage_v_rels_order_idx" ON "_homepage_v_rels" USING btree ("order");
  CREATE INDEX "_homepage_v_rels_parent_idx" ON "_homepage_v_rels" USING btree ("parent_id");
  CREATE INDEX "_homepage_v_rels_path_idx" ON "_homepage_v_rels" USING btree ("path");
  CREATE INDEX "_homepage_v_rels_media_id_idx" ON "_homepage_v_rels" USING btree ("media_id");
  CREATE INDEX "_site_settings_v_version_footer_links_order_idx" ON "_site_settings_v_version_footer_links" USING btree ("_order");
  CREATE INDEX "_site_settings_v_version_footer_links_parent_id_idx" ON "_site_settings_v_version_footer_links" USING btree ("_parent_id");
  CREATE INDEX "_site_settings_v_created_at_idx" ON "_site_settings_v" USING btree ("created_at");
  CREATE INDEX "_site_settings_v_updated_at_idx" ON "_site_settings_v" USING btree ("updated_at");
  CREATE INDEX "news_deleted_at_idx" ON "news" USING btree ("deleted_at");
  CREATE INDEX "_news_v_version_version_deleted_at_idx" ON "_news_v" USING btree ("version_deleted_at");
  CREATE INDEX "divisions_deleted_at_idx" ON "divisions" USING btree ("deleted_at");
  CREATE INDEX "brands_deleted_at_idx" ON "brands" USING btree ("deleted_at");
  CREATE INDEX "pages_deleted_at_idx" ON "pages" USING btree ("deleted_at");
  CREATE INDEX "_pages_v_version_version_deleted_at_idx" ON "_pages_v" USING btree ("version_deleted_at");
  CREATE INDEX "partners_deleted_at_idx" ON "partners" USING btree ("deleted_at");
  CREATE INDEX "contacts_deleted_at_idx" ON "contacts" USING btree ("deleted_at");
  CREATE INDEX "media_deleted_at_idx" ON "media" USING btree ("deleted_at");
  CREATE INDEX "products_deleted_at_idx" ON "products" USING btree ("deleted_at");
  CREATE INDEX "series_deleted_at_idx" ON "series" USING btree ("deleted_at");
  CREATE INDEX "documents_deleted_at_idx" ON "documents" USING btree ("deleted_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "_divisions_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_brands_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_partners_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_contacts_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_version_missing" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_products_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_series_v_version_common_params" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_series_v_version_shapes" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_series_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_documents_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_stats" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_version_usps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_homepage_v_rels" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v_version_footer_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_site_settings_v" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "_divisions_v" CASCADE;
  DROP TABLE "_brands_v" CASCADE;
  DROP TABLE "_partners_v" CASCADE;
  DROP TABLE "_contacts_v" CASCADE;
  DROP TABLE "_products_v_version_params" CASCADE;
  DROP TABLE "_products_v_version_missing" CASCADE;
  DROP TABLE "_products_v" CASCADE;
  DROP TABLE "_products_v_rels" CASCADE;
  DROP TABLE "_series_v_version_common_params" CASCADE;
  DROP TABLE "_series_v_version_shapes" CASCADE;
  DROP TABLE "_series_v" CASCADE;
  DROP TABLE "_documents_v" CASCADE;
  DROP TABLE "_documents_v_rels" CASCADE;
  DROP TABLE "_homepage_v_version_stats" CASCADE;
  DROP TABLE "_homepage_v_version_usps" CASCADE;
  DROP TABLE "_homepage_v" CASCADE;
  DROP TABLE "_homepage_v_rels" CASCADE;
  DROP TABLE "_site_settings_v_version_footer_links" CASCADE;
  DROP TABLE "_site_settings_v" CASCADE;
  DROP INDEX "news_deleted_at_idx";
  DROP INDEX "_news_v_version_version_deleted_at_idx";
  DROP INDEX "divisions_deleted_at_idx";
  DROP INDEX "brands_deleted_at_idx";
  DROP INDEX "pages_deleted_at_idx";
  DROP INDEX "_pages_v_version_version_deleted_at_idx";
  DROP INDEX "partners_deleted_at_idx";
  DROP INDEX "contacts_deleted_at_idx";
  DROP INDEX "media_deleted_at_idx";
  DROP INDEX "products_deleted_at_idx";
  DROP INDEX "series_deleted_at_idx";
  DROP INDEX "documents_deleted_at_idx";
  ALTER TABLE "news" DROP COLUMN "deleted_at";
  ALTER TABLE "_news_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "divisions" DROP COLUMN "deleted_at";
  ALTER TABLE "brands" DROP COLUMN "deleted_at";
  ALTER TABLE "pages" DROP COLUMN "deleted_at";
  ALTER TABLE "_pages_v" DROP COLUMN "version_deleted_at";
  ALTER TABLE "partners" DROP COLUMN "deleted_at";
  ALTER TABLE "contacts" DROP COLUMN "deleted_at";
  ALTER TABLE "media" DROP COLUMN "deleted_at";
  ALTER TABLE "products" DROP COLUMN "deleted_at";
  ALTER TABLE "series" DROP COLUMN "deleted_at";
  ALTER TABLE "documents" DROP COLUMN "deleted_at";
  DROP TYPE "public"."enum__divisions_v_version_status";
  DROP TYPE "public"."enum__partners_v_version_region";
  DROP TYPE "public"."enum__products_v_version_missing";
  DROP TYPE "public"."enum__products_v_version_bc_status";
  DROP TYPE "public"."enum__documents_v_version_type";
  DROP TYPE "public"."enum__homepage_v_version_usps_icon";`)
}
