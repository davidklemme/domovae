CREATE TABLE "owner_availability_windows" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"date" date NOT NULL,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"slot_duration" integer DEFAULT 30,
	"is_active" boolean DEFAULT true,
	"timezone" varchar(50) DEFAULT 'Europe/Berlin',
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "owner_availability_windows" ADD CONSTRAINT "owner_availability_windows_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;