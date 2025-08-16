import {
	pgTable,
	serial,
	integer,
	varchar,
	text,
	timestamp,
	boolean,
	date,
	jsonb
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// AuthJS required tables - using exact AuthJS schema
export const users = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name'),
	email: text('email').notNull().unique(),
	emailVerified: timestamp('emailVerified'),
	image: text('image'),
	// Custom fields
	role: varchar('role', { length: 20 }).default('buyer'),
	phone: varchar('phone', { length: 20 }),
	dateOfBirth: date('dateOfBirth'),
	address: text('address'),
	city: varchar('city', { length: 100 }),
	postalCode: varchar('postalCode', { length: 10 }),
	country: varchar('country', { length: 50 }).default('Germany'),
	isVerified: boolean('isVerified').default(false),
	verificationDate: timestamp('verificationDate'),
	createdAt: timestamp('createdAt').defaultNow(),
	updatedAt: timestamp('updatedAt').defaultNow()
});

export const accounts = pgTable('account', {
	id: text('id').primaryKey(),
	userId: text('userId')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	type: text('type').notNull(),
	provider: text('provider').notNull(),
	providerAccountId: text('providerAccountId').notNull(),
	refreshToken: text('refreshToken'),
	accessToken: text('accessToken'),
	expiresAt: integer('expiresAt'),
	tokenType: text('tokenType'),
	scope: text('scope'),
	idToken: text('idToken'),
	sessionState: text('sessionState')
});

export const sessions = pgTable('session', {
	sessionToken: varchar('sessionToken', { length: 255 }).primaryKey(),
	userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires').notNull()
});

export const verificationTokens = pgTable('verificationToken', {
	identifier: varchar('identifier', { length: 255 }).notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	expires: timestamp('expires').notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions),
	buyerAppointments: many(appointments, { relationName: 'buyerAppointments' }),
	ownerAppointments: many(appointments, { relationName: 'ownerAppointments' }),
	availabilityWindows: many(ownerAvailabilityWindows)
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
	user: one(users, {
		fields: [accounts.userId],
		references: [users.id]
	})
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	user: one(users, {
		fields: [sessions.userId],
		references: [users.id]
	})
}));

// GDPR & Privacy Compliance Tables
export const consentRecords = pgTable('consent_records', {
	id: serial('id').primaryKey(),
	userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),

	// Consent details
	consentType: varchar('consentType', { length: 50 }).notNull(),
	consentStatus: varchar('consentStatus', { length: 20 }).notNull(),
	legalBasis: varchar('legalBasis', { length: 100 }), // e.g., 'consent', 'legitimate_interest'

	// Consent metadata
	ipAddress: varchar('ipAddress', { length: 45 }),
	userAgent: text('userAgent'),
	consentVersion: varchar('consentVersion', { length: 20 }),

	// Timestamps
	grantedAt: timestamp('grantedAt'),
	withdrawnAt: timestamp('withdrawnAt'),
	createdAt: timestamp('createdAt').defaultNow(),
	updatedAt: timestamp('updatedAt').defaultNow()
});

export const dataProcessingActivities = pgTable('data_processing_activities', {
	id: serial('id').primaryKey(),

	// Activity details
	activityName: varchar('activityName', { length: 255 }).notNull(),
	description: text('description'),

	// Legal basis
	legalBasis: varchar('legalBasis', { length: 100 }).notNull(),
	purpose: text('purpose'),

	// Data categories
	dataCategories: jsonb('dataCategories'), // Array of data types processed
	recipients: jsonb('recipients'), // Array of third-party recipients

	// Retention
	retentionPeriod: integer('retentionPeriod'), // in days
	retentionBasis: text('retentionBasis'),

	// Status
	isActive: boolean('isActive').default(true),

	// Timestamps
	createdAt: timestamp('createdAt').defaultNow(),
	updatedAt: timestamp('updatedAt').defaultNow()
});

export const dataSubjectRequests = pgTable('data_subject_requests', {
	id: serial('id').primaryKey(),
	userId: text('userId').references(() => users.id, { onDelete: 'cascade' }),

	// Request details
	requestType: varchar('requestType', { length: 30 }).notNull(),
	status: varchar('status', { length: 20 }).default('pending'),

	// Request metadata
	description: text('description'),
	requestedData: jsonb('requestedData'), // Specific data requested

	// Processing
	processedAt: timestamp('processedAt'),
	processedBy: text('processedBy').references(() => users.id),
	responseData: jsonb('responseData'), // Data provided to user

	// Timestamps
	createdAt: timestamp('createdAt').defaultNow(),
	updatedAt: timestamp('updatedAt').defaultNow()
});

export const auditLogs = pgTable('audit_logs', {
	id: serial('id').primaryKey(),

	// Log details
	userId: text('userId').references(() => users.id),
	action: varchar('action', { length: 100 }).notNull(),
	resource: varchar('resource', { length: 100 }), // e.g., 'user', 'property', 'appointment'
	resourceId: integer('resourceId'),

	// Changes
	oldValues: jsonb('oldValues'),
	newValues: jsonb('newValues'),

	// Metadata
	ipAddress: varchar('ipAddress', { length: 45 }),
	userAgent: text('userAgent'),

	// Timestamps
	createdAt: timestamp('createdAt').defaultNow()
});

// GDPR Relations
export const consentRecordsRelations = relations(consentRecords, ({ one }) => ({
	user: one(users, {
		fields: [consentRecords.userId],
		references: [users.id]
	})
}));

export const dataSubjectRequestsRelations = relations(dataSubjectRequests, ({ one }) => ({
	user: one(users, {
		fields: [dataSubjectRequests.userId],
		references: [users.id]
	}),
	processedByUser: one(users, {
		fields: [dataSubjectRequests.processedBy],
		references: [users.id]
	})
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	})
}));

// Property Management Tables
export const properties = pgTable('properties', {
	id: serial('id').primaryKey(),
	ownerId: text('owner_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// Basic property information
	title: varchar('title', { length: 255 }).notNull(),
	description: text('description'),
	locationDescription: text('location_description'),
	neighborhoodHighlights: text('neighborhood_highlights'),
	propertyHighlights: text('property_highlights'),
	price: integer('price').notNull(), // Price in cents
	currency: varchar('currency', { length: 3 }).default('EUR'),

	// Property type and details
	propertyType: varchar('property_type', { length: 50 }).notNull(), // house, apartment, etc.
	propertySubtype: varchar('property_subtype', { length: 50 }), // detached, semi-detached, etc.

	// Property characteristics
	bedrooms: integer('bedrooms'),
	bathrooms: integer('bathrooms'),
	livingArea: integer('living_area'), // in square meters
	totalArea: integer('total_area'), // in square meters
	yearBuilt: integer('year_built'),

	// Status management
	status: varchar('status', { length: 20 }).default('draft'), // draft, published, live, in_negotiation, removed, archived

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	publishedAt: timestamp('published_at'),
	archivedAt: timestamp('archived_at')
});

export const propertyLocations = pgTable('property_locations', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),

	// Address information
	street: varchar('street', { length: 255 }).notNull(),
	houseNumber: varchar('house_number', { length: 20 }),
	city: varchar('city', { length: 100 }).notNull(),
	postalCode: varchar('postal_code', { length: 10 }).notNull(),
	state: varchar('state', { length: 100 }),
	country: varchar('country', { length: 50 }).default('Germany'),

	// Geographic coordinates
	latitude: varchar('latitude', { length: 20 }),
	longitude: varchar('longitude', { length: 20 }),

	// Additional location details
	neighborhood: varchar('neighborhood', { length: 100 }),
	district: varchar('district', { length: 100 }),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const propertyMedia = pgTable('property_media', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),

	// Media details
	mediaType: varchar('media_type', { length: 20 }).notNull(), // image, video, document
	mediaCategory: varchar('media_category', { length: 20 }).notNull(), // hero, slideshow, layout
	mediaUrl: varchar('media_url', { length: 500 }).notNull(),
	mediaThumbnail: varchar('media_thumbnail', { length: 500 }),
	altText: varchar('alt_text', { length: 255 }),

	// Media metadata
	fileName: varchar('file_name', { length: 255 }),
	fileSize: integer('file_size'), // in bytes
	mimeType: varchar('mime_type', { length: 100 }),

	// Display settings
	displayOrder: integer('display_order').default(0),
	isActive: boolean('is_active').default(true),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const amenities = pgTable('amenities', {
	id: serial('id').primaryKey(),

	// Amenity details
	name: varchar('name', { length: 100 }).notNull(),
	description: text('description'),
	category: varchar('category', { length: 50 }).notNull(), // kitchen, bathroom, outdoor, etc.
	icon: varchar('icon', { length: 100 }), // Icon identifier

	// Status
	isActive: boolean('is_active').default(true),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const propertyAmenities = pgTable('property_amenities', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),
	amenityId: integer('amenity_id')
		.references(() => amenities.id, { onDelete: 'cascade' })
		.notNull(),

	// Additional details
	description: text('description'), // Custom description for this property
	isIncluded: boolean('is_included').default(true),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow()
});

export const proximities = pgTable('proximities', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),

	// Proximity details (Germany-specific, following Immobilienscout24 patterns)
	proximityType: varchar('proximity_type', { length: 50 }).notNull(), // public_transport, school, shopping, hospital, park, etc.
	proximityName: varchar('proximity_name', { length: 255 }),

	// Distance information
	distance: integer('distance'), // in meters
	distanceUnit: varchar('distance_unit', { length: 10 }).default('m'),
	travelTime: integer('travel_time'), // in minutes
	travelMode: varchar('travel_mode', { length: 20 }), // walking, driving, public_transport

	// Additional details
	description: text('description'),
	coordinates: jsonb('coordinates'), // {lat, lng} for mapping

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Property Relations
export const propertiesRelations = relations(properties, ({ one, many }) => ({
	owner: one(users, {
		fields: [properties.ownerId],
		references: [users.id]
	}),
	location: one(propertyLocations, {
		fields: [properties.id],
		references: [propertyLocations.propertyId]
	}),
	media: many(propertyMedia),
	amenities: many(propertyAmenities),
	proximities: many(proximities),
	questions: many(propertyQuestions),
	appointments: many(appointments)
}));

export const propertyLocationsRelations = relations(propertyLocations, ({ one }) => ({
	property: one(properties, {
		fields: [propertyLocations.propertyId],
		references: [properties.id]
	})
}));

export const propertyMediaRelations = relations(propertyMedia, ({ one }) => ({
	property: one(properties, {
		fields: [propertyMedia.propertyId],
		references: [properties.id]
	})
}));

export const amenitiesRelations = relations(amenities, ({ many }) => ({
	properties: many(propertyAmenities)
}));

export const propertyAmenitiesRelations = relations(propertyAmenities, ({ one }) => ({
	property: one(properties, {
		fields: [propertyAmenities.propertyId],
		references: [properties.id]
	}),
	amenity: one(amenities, {
		fields: [propertyAmenities.amenityId],
		references: [amenities.id]
	})
}));

export const proximitiesRelations = relations(proximities, ({ one }) => ({
	property: one(properties, {
		fields: [proximities.propertyId],
		references: [properties.id]
	})
}));

// Q&A Tables
export const propertyQuestions = pgTable('property_questions', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),
	askedBy: text('asked_by')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// Question details
	question: text('question').notNull(),
	status: varchar('status', { length: 20 }).default('pending'), // pending, answered, published, rejected

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const propertyAnswers = pgTable('property_answers', {
	id: serial('id').primaryKey(),
	questionId: integer('question_id')
		.references(() => propertyQuestions.id, { onDelete: 'cascade' })
		.notNull(),
	answeredBy: text('answered_by')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// Answer details
	answer: text('answer').notNull(),
	isPublished: boolean('is_published').default(false),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Q&A Relations
export const propertyQuestionsRelations = relations(propertyQuestions, ({ one, many }) => ({
	property: one(properties, {
		fields: [propertyQuestions.propertyId],
		references: [properties.id]
	}),
	askedByUser: one(users, {
		fields: [propertyQuestions.askedBy],
		references: [users.id]
	}),
	answers: many(propertyAnswers)
}));

export const propertyAnswersRelations = relations(propertyAnswers, ({ one }) => ({
	question: one(propertyQuestions, {
		fields: [propertyAnswers.questionId],
		references: [propertyQuestions.id]
	}),
	answeredByUser: one(users, {
		fields: [propertyAnswers.answeredBy],
		references: [users.id]
	})
}));

// Appointment Tables
export const appointments = pgTable('appointments', {
	id: serial('id').primaryKey(),
	propertyId: integer('property_id')
		.references(() => properties.id, { onDelete: 'cascade' })
		.notNull(),
	buyerId: text('buyer_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),
	ownerId: text('owner_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// Appointment details
	scheduledAt: timestamp('scheduled_at').notNull(),
	duration: integer('duration').default(60), // minutes
	type: varchar('type', { length: 20 }).default('viewing'), // viewing, consultation, negotiation

	// Status
	status: varchar('status', { length: 20 }).default('requested'), // requested, confirmed, cancelled, completed, no_show

	// Communication
	notes: text('notes'),
	buyerNotes: text('buyer_notes'),
	ownerNotes: text('owner_notes'),

	// Calendar integration
	externalCalendarId: varchar('external_calendar_id', { length: 255 }),
	externalEventId: varchar('external_event_id', { length: 255 }),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),
	confirmedAt: timestamp('confirmed_at'),
	cancelledAt: timestamp('cancelled_at')
});

// Appointment Relations
export const appointmentsRelations = relations(appointments, ({ one }) => ({
	property: one(properties, {
		fields: [appointments.propertyId],
		references: [properties.id]
	}),
	buyer: one(users, {
		fields: [appointments.buyerId],
		references: [users.id],
		relationName: 'buyerAppointments'
	}),
	owner: one(users, {
		fields: [appointments.ownerId],
		references: [users.id],
		relationName: 'ownerAppointments'
	})
}));

// Owner Availability Windows (specific time slots, no recurring)
export const ownerAvailabilityWindows = pgTable('owner_availability_windows', {
	id: serial('id').primaryKey(),
	ownerId: text('owner_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// Specific date and time slot
	date: date('date').notNull(),
	startTime: varchar('start_time', { length: 5 }).notNull(), // HH:MM format
	endTime: varchar('end_time', { length: 5 }).notNull(), // HH:MM format
	slotDuration: integer('slot_duration').default(30), // minutes per slot

	// Window settings
	isActive: boolean('is_active').default(true),
	timezone: varchar('timezone', { length: 50 }).default('Europe/Berlin'),
	isRecurring: boolean('is_recurring').default(false), // Weekly recurring slot

	// Metadata
	notes: text('notes'), // Optional notes about this time slot
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

// Availability Windows Relations
export const ownerAvailabilityWindowsRelations = relations(ownerAvailabilityWindows, ({ one }) => ({
	owner: one(users, {
		fields: [ownerAvailabilityWindows.ownerId],
		references: [users.id]
	})
}));
