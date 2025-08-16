CREATE TABLE "buyer_profile" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"equity_band" varchar(20) NOT NULL,
	"timeline" varchar(20) NOT NULL,
	"purpose" varchar(20) NOT NULL,
	"household_size" integer,
	"schufa_available" boolean DEFAULT false,
	"financing_doc_url" varchar(500),
	"financing_verified" boolean DEFAULT false,
	"consent_timestamp" timestamp NOT NULL,
	"retention_until" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "appointments" ADD COLUMN "buyer_profile_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "buyer_profile" ADD CONSTRAINT "buyer_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;