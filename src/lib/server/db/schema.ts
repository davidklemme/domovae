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

// AuthJS required tables
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: varchar('email', { length: 255 }).notNull().unique(),
	name: varchar('name', { length: 255 }),
	image: varchar('image', { length: 500 }),
	role: varchar('role', { length: 20 }).default('buyer'),
	emailVerified: timestamp('email_verified'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow(),

	// Profile information
	phone: varchar('phone', { length: 20 }),
	dateOfBirth: date('date_of_birth'),
	address: text('address'),
	city: varchar('city', { length: 100 }),
	postalCode: varchar('postal_code', { length: 10 }),
	country: varchar('country', { length: 50 }).default('Germany'),

	// Verification status
	isVerified: boolean('is_verified').default(false),
	verificationDate: timestamp('verification_date')
});

export const accounts = pgTable('accounts', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	type: varchar('type', { length: 255 }).notNull(),
	provider: varchar('provider', { length: 255 }).notNull(),
	providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
	refresh_token: text('refresh_token'),
	access_token: text('access_token'),
	expires_at: integer('expires_at'),
	token_type: varchar('token_type', { length: 255 }),
	scope: varchar('scope', { length: 255 }),
	id_token: text('id_token'),
	session_state: varchar('session_state', { length: 255 })
});

export const sessions = pgTable('sessions', {
	id: serial('id').primaryKey(),
	sessionToken: varchar('session_token', { length: 255 }).notNull().unique(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
	expires: timestamp('expires').notNull()
});

export const verificationTokens = pgTable('verification_tokens', {
	identifier: varchar('identifier', { length: 255 }).notNull(),
	token: varchar('token', { length: 255 }).notNull().unique(),
	expires: timestamp('expires').notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	accounts: many(accounts),
	sessions: many(sessions)
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
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),

	// Consent details
	consentType: varchar('consent_type', { length: 50 }).notNull(),
	consentStatus: varchar('consent_status', { length: 20 }).notNull(),
	legalBasis: varchar('legal_basis', { length: 100 }), // e.g., 'consent', 'legitimate_interest'

	// Consent metadata
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),
	consentVersion: varchar('consent_version', { length: 20 }),

	// Timestamps
	grantedAt: timestamp('granted_at'),
	withdrawnAt: timestamp('withdrawn_at'),
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const dataProcessingActivities = pgTable('data_processing_activities', {
	id: serial('id').primaryKey(),

	// Activity details
	activityName: varchar('activity_name', { length: 255 }).notNull(),
	description: text('description'),

	// Legal basis
	legalBasis: varchar('legal_basis', { length: 100 }).notNull(),
	purpose: text('purpose'),

	// Data categories
	dataCategories: jsonb('data_categories'), // Array of data types processed
	recipients: jsonb('recipients'), // Array of third-party recipients

	// Retention
	retentionPeriod: integer('retention_period'), // in days
	retentionBasis: text('retention_basis'),

	// Status
	isActive: boolean('is_active').default(true),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const dataSubjectRequests = pgTable('data_subject_requests', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),

	// Request details
	requestType: varchar('request_type', { length: 30 }).notNull(),
	status: varchar('request_status', { length: 20 }).default('pending'),

	// Request metadata
	description: text('description'),
	requestedData: jsonb('requested_data'), // Specific data requested

	// Processing
	processedAt: timestamp('processed_at'),
	processedBy: integer('processed_by').references(() => users.id),
	responseData: jsonb('response_data'), // Data provided to user

	// Timestamps
	createdAt: timestamp('created_at').defaultNow(),
	updatedAt: timestamp('updated_at').defaultNow()
});

export const auditLogs = pgTable('audit_logs', {
	id: serial('id').primaryKey(),

	// Log details
	userId: integer('user_id').references(() => users.id),
	action: varchar('action', { length: 100 }).notNull(),
	resource: varchar('resource', { length: 100 }), // e.g., 'user', 'property', 'appointment'
	resourceId: integer('resource_id'),

	// Changes
	oldValues: jsonb('old_values'),
	newValues: jsonb('new_values'),

	// Metadata
	ipAddress: varchar('ip_address', { length: 45 }),
	userAgent: text('user_agent'),

	// Timestamps
	createdAt: timestamp('created_at').defaultNow()
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
