CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"userId" text NOT NULL,
	"type" text NOT NULL,
	"provider" text NOT NULL,
	"providerAccountId" text NOT NULL,
	"refreshToken" text,
	"accessToken" text,
	"expiresAt" integer,
	"tokenType" text,
	"scope" text,
	"idToken" text,
	"sessionState" text
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"category" varchar(50) NOT NULL,
	"icon" varchar(100),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text,
	"action" varchar(100) NOT NULL,
	"resource" varchar(100),
	"resourceId" integer,
	"oldValues" jsonb,
	"newValues" jsonb,
	"ipAddress" varchar(45),
	"userAgent" text,
	"createdAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "consent_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text,
	"consentType" varchar(50) NOT NULL,
	"consentStatus" varchar(20) NOT NULL,
	"legalBasis" varchar(100),
	"ipAddress" varchar(45),
	"userAgent" text,
	"consentVersion" varchar(20),
	"grantedAt" timestamp,
	"withdrawnAt" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_processing_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"activityName" varchar(255) NOT NULL,
	"description" text,
	"legalBasis" varchar(100) NOT NULL,
	"purpose" text,
	"dataCategories" jsonb,
	"recipients" jsonb,
	"retentionPeriod" integer,
	"retentionBasis" text,
	"isActive" boolean DEFAULT true,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "data_subject_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"userId" text,
	"requestType" varchar(30) NOT NULL,
	"status" varchar(20) DEFAULT 'pending',
	"description" text,
	"requestedData" jsonb,
	"processedAt" timestamp,
	"processedBy" text,
	"responseData" jsonb,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"price" integer NOT NULL,
	"currency" varchar(3) DEFAULT 'EUR',
	"property_type" varchar(50) NOT NULL,
	"property_subtype" varchar(50),
	"bedrooms" integer,
	"bathrooms" integer,
	"living_area" integer,
	"total_area" integer,
	"year_built" integer,
	"status" varchar(20) DEFAULT 'draft',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"published_at" timestamp,
	"archived_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "property_amenities" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"amenity_id" integer NOT NULL,
	"description" text,
	"is_included" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_locations" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"street" varchar(255) NOT NULL,
	"house_number" varchar(20),
	"city" varchar(100) NOT NULL,
	"postal_code" varchar(10) NOT NULL,
	"state" varchar(100),
	"country" varchar(50) DEFAULT 'Germany',
	"latitude" varchar(20),
	"longitude" varchar(20),
	"neighborhood" varchar(100),
	"district" varchar(100),
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "property_media" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"media_type" varchar(20) NOT NULL,
	"media_url" varchar(500) NOT NULL,
	"media_thumbnail" varchar(500),
	"alt_text" varchar(255),
	"file_name" varchar(255),
	"file_size" integer,
	"mime_type" varchar(100),
	"is_hero" boolean DEFAULT false,
	"display_order" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "proximities" (
	"id" serial PRIMARY KEY NOT NULL,
	"property_id" integer NOT NULL,
	"proximity_type" varchar(50) NOT NULL,
	"proximity_name" varchar(255),
	"distance" integer,
	"distance_unit" varchar(10) DEFAULT 'm',
	"travel_time" integer,
	"travel_mode" varchar(20),
	"description" text,
	"coordinates" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" text,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"emailVerified" timestamp,
	"image" text,
	"role" varchar(20) DEFAULT 'buyer',
	"phone" varchar(20),
	"dateOfBirth" date,
	"address" text,
	"city" varchar(100),
	"postalCode" varchar(10),
	"country" varchar(50) DEFAULT 'Germany',
	"isVerified" boolean DEFAULT false,
	"verificationDate" timestamp,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now(),
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "verificationToken_token_unique" UNIQUE("token")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "data_subject_requests" ADD CONSTRAINT "data_subject_requests_processedBy_user_id_fk" FOREIGN KEY ("processedBy") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "properties" ADD CONSTRAINT "properties_owner_id_user_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_amenities" ADD CONSTRAINT "property_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_locations" ADD CONSTRAINT "property_locations_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "property_media" ADD CONSTRAINT "property_media_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "proximities" ADD CONSTRAINT "proximities_property_id_properties_id_fk" FOREIGN KEY ("property_id") REFERENCES "public"."properties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;