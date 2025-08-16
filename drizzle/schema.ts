import { pgTable, serial, varchar, text, jsonb, integer, boolean, timestamp, foreignKey, unique, date } from "drizzle-orm/pg-core"
// import { sql } from "drizzle-orm"



export const dataProcessingActivities = pgTable("data_processing_activities", {
	id: serial().primaryKey().notNull(),
	activityName: varchar({ length: 255 }).notNull(),
	description: text(),
	legalBasis: varchar({ length: 100 }).notNull(),
	purpose: text(),
	dataCategories: jsonb(),
	recipients: jsonb(),
	retentionPeriod: integer(),
	retentionBasis: text(),
	isActive: boolean().default(true),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
});

export const properties = pgTable("properties", {
	id: serial().primaryKey().notNull(),
	ownerId: text("owner_id").notNull(),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	price: integer().notNull(),
	currency: varchar({ length: 3 }).default('EUR'),
	propertyType: varchar("property_type", { length: 50 }).notNull(),
	propertySubtype: varchar("property_subtype", { length: 50 }),
	bedrooms: integer(),
	bathrooms: integer(),
	livingArea: integer("living_area"),
	totalArea: integer("total_area"),
	yearBuilt: integer("year_built"),
	status: varchar({ length: 20 }).default('draft'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	publishedAt: timestamp("published_at", { mode: 'string' }),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	locationDescription: text("location_description"),
	neighborhoodHighlights: text("neighborhood_highlights"),
	propertyHighlights: text("property_highlights"),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "properties_owner_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const verificationToken = pgTable("verificationToken", {
	identifier: varchar({ length: 255 }).notNull(),
	token: varchar({ length: 255 }).notNull(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	unique("verificationToken_token_unique").on(table.token),
]);

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text(),
	email: text().notNull(),
	emailVerified: timestamp({ mode: 'string' }),
	image: text(),
	role: varchar({ length: 20 }).default('buyer'),
	phone: varchar({ length: 20 }),
	dateOfBirth: date(),
	address: text(),
	city: varchar({ length: 100 }),
	postalCode: varchar({ length: 10 }),
	country: varchar({ length: 50 }).default('Germany'),
	isVerified: boolean().default(false),
	verificationDate: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	userId: text().notNull(),
	type: text().notNull(),
	provider: text().notNull(),
	providerAccountId: text().notNull(),
	refreshToken: text(),
	accessToken: text(),
	expiresAt: integer(),
	tokenType: text(),
	scope: text(),
	idToken: text(),
	sessionState: text(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const auditLogs = pgTable("audit_logs", {
	id: serial().primaryKey().notNull(),
	userId: text(),
	action: varchar({ length: 100 }).notNull(),
	resource: varchar({ length: 100 }),
	resourceId: integer(),
	oldValues: jsonb(),
	newValues: jsonb(),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "audit_logs_userId_user_id_fk"
		}),
]);

export const consentRecords = pgTable("consent_records", {
	id: serial().primaryKey().notNull(),
	userId: text(),
	consentType: varchar({ length: 50 }).notNull(),
	consentStatus: varchar({ length: 20 }).notNull(),
	legalBasis: varchar({ length: 100 }),
	ipAddress: varchar({ length: 45 }),
	userAgent: text(),
	consentVersion: varchar({ length: 20 }),
	grantedAt: timestamp({ mode: 'string' }),
	withdrawnAt: timestamp({ mode: 'string' }),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "consent_records_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const dataSubjectRequests = pgTable("data_subject_requests", {
	id: serial().primaryKey().notNull(),
	userId: text(),
	requestType: varchar({ length: 30 }).notNull(),
	status: varchar({ length: 20 }).default('pending'),
	description: text(),
	requestedData: jsonb(),
	processedAt: timestamp({ mode: 'string' }),
	processedBy: text(),
	responseData: jsonb(),
	createdAt: timestamp({ mode: 'string' }).defaultNow(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "data_subject_requests_userId_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.processedBy],
			foreignColumns: [user.id],
			name: "data_subject_requests_processedBy_user_id_fk"
		}),
]);

export const propertyAmenities = pgTable("property_amenities", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	amenityId: integer("amenity_id").notNull(),
	description: text(),
	isIncluded: boolean("is_included").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_amenities_property_id_properties_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.amenityId],
			foreignColumns: [amenities.id],
			name: "property_amenities_amenity_id_amenities_id_fk"
		}).onDelete("cascade"),
]);

export const amenities = pgTable("amenities", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	description: text(),
	category: varchar({ length: 50 }).notNull(),
	icon: varchar({ length: 100 }),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const propertyLocations = pgTable("property_locations", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	street: varchar({ length: 255 }).notNull(),
	houseNumber: varchar("house_number", { length: 20 }),
	city: varchar({ length: 100 }).notNull(),
	postalCode: varchar("postal_code", { length: 10 }).notNull(),
	state: varchar({ length: 100 }),
	country: varchar({ length: 50 }).default('Germany'),
	latitude: varchar({ length: 20 }),
	longitude: varchar({ length: 20 }),
	neighborhood: varchar({ length: 100 }),
	district: varchar({ length: 100 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_locations_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const proximities = pgTable("proximities", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	proximityType: varchar("proximity_type", { length: 50 }).notNull(),
	proximityName: varchar("proximity_name", { length: 255 }),
	distance: integer(),
	distanceUnit: varchar("distance_unit", { length: 10 }).default('m'),
	travelTime: integer("travel_time"),
	travelMode: varchar("travel_mode", { length: 20 }),
	description: text(),
	coordinates: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "proximities_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	sessionToken: varchar({ length: 255 }).primaryKey().notNull(),
	userId: text(),
	expires: timestamp({ mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_userId_user_id_fk"
		}).onDelete("cascade"),
]);

export const propertyMedia = pgTable("property_media", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	mediaType: varchar("media_type", { length: 20 }).notNull(),
	mediaUrl: varchar("media_url", { length: 500 }).notNull(),
	mediaThumbnail: varchar("media_thumbnail", { length: 500 }),
	altText: varchar("alt_text", { length: 255 }),
	fileName: varchar("file_name", { length: 255 }),
	fileSize: integer("file_size"),
	mimeType: varchar("mime_type", { length: 100 }),
	displayOrder: integer("display_order").default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	mediaCategory: varchar("media_category", { length: 20 }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_media_property_id_properties_id_fk"
		}).onDelete("cascade"),
]);

export const appointments = pgTable("appointments", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	buyerId: text("buyer_id").notNull(),
	ownerId: text("owner_id").notNull(),
	scheduledAt: timestamp("scheduled_at", { mode: 'string' }).notNull(),
	duration: integer().default(60),
	type: varchar({ length: 20 }).default('viewing'),
	status: varchar({ length: 20 }).default('requested'),
	notes: text(),
	buyerNotes: text("buyer_notes"),
	ownerNotes: text("owner_notes"),
	externalCalendarId: varchar("external_calendar_id", { length: 255 }),
	externalEventId: varchar("external_event_id", { length: 255 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
	confirmedAt: timestamp("confirmed_at", { mode: 'string' }),
	cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "appointments_property_id_properties_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.buyerId],
			foreignColumns: [user.id],
			name: "appointments_buyer_id_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "appointments_owner_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const ownerAvailabilityWindows = pgTable("owner_availability_windows", {
	id: serial().primaryKey().notNull(),
	ownerId: text("owner_id").notNull(),
	date: date().notNull(),
	startTime: varchar("start_time", { length: 5 }).notNull(),
	endTime: varchar("end_time", { length: 5 }).notNull(),
	slotDuration: integer("slot_duration").default(30),
	isActive: boolean("is_active").default(true),
	timezone: varchar({ length: 50 }).default('Europe/Berlin'),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.ownerId],
			foreignColumns: [user.id],
			name: "owner_availability_windows_owner_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const propertyQuestions = pgTable("property_questions", {
	id: serial().primaryKey().notNull(),
	propertyId: integer("property_id").notNull(),
	askedBy: text("asked_by").notNull(),
	question: text().notNull(),
	status: varchar({ length: 20 }).default('pending'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.propertyId],
			foreignColumns: [properties.id],
			name: "property_questions_property_id_properties_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.askedBy],
			foreignColumns: [user.id],
			name: "property_questions_asked_by_user_id_fk"
		}).onDelete("cascade"),
]);

export const propertyAnswers = pgTable("property_answers", {
	id: serial().primaryKey().notNull(),
	questionId: integer("question_id").notNull(),
	answeredBy: text("answered_by").notNull(),
	answer: text().notNull(),
	isPublished: boolean("is_published").default(false),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.questionId],
			foreignColumns: [propertyQuestions.id],
			name: "property_answers_question_id_property_questions_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.answeredBy],
			foreignColumns: [user.id],
			name: "property_answers_answered_by_user_id_fk"
		}).onDelete("cascade"),
]);
