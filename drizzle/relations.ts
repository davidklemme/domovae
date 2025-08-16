import { relations } from "drizzle-orm/relations";
import { user, properties, account, auditLogs, consentRecords, dataSubjectRequests, propertyAmenities, amenities, propertyLocations, proximities, session, propertyMedia, appointments, buyerProfile, ownerAvailabilityWindows, propertyQuestions, propertyAnswers } from "./schema";

export const propertiesRelations = relations(properties, ({one, many}) => ({
	user: one(user, {
		fields: [properties.ownerId],
		references: [user.id]
	}),
	propertyAmenities: many(propertyAmenities),
	propertyLocations: many(propertyLocations),
	proximities: many(proximities),
	propertyMedias: many(propertyMedia),
	appointments: many(appointments),
	propertyQuestions: many(propertyQuestions),
}));

export const userRelations = relations(user, ({many}) => ({
	properties: many(properties),
	accounts: many(account),
	auditLogs: many(auditLogs),
	consentRecords: many(consentRecords),
	dataSubjectRequests_userId: many(dataSubjectRequests, {
		relationName: "dataSubjectRequests_userId_user_id"
	}),
	dataSubjectRequests_processedBy: many(dataSubjectRequests, {
		relationName: "dataSubjectRequests_processedBy_user_id"
	}),
	sessions: many(session),
	appointments_buyerId: many(appointments, {
		relationName: "appointments_buyerId_user_id"
	}),
	appointments_ownerId: many(appointments, {
		relationName: "appointments_ownerId_user_id"
	}),
	buyerProfiles: many(buyerProfile),
	ownerAvailabilityWindows: many(ownerAvailabilityWindows),
	propertyQuestions: many(propertyQuestions),
	propertyAnswers: many(propertyAnswers),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(user, {
		fields: [auditLogs.userId],
		references: [user.id]
	}),
}));

export const consentRecordsRelations = relations(consentRecords, ({one}) => ({
	user: one(user, {
		fields: [consentRecords.userId],
		references: [user.id]
	}),
}));

export const dataSubjectRequestsRelations = relations(dataSubjectRequests, ({one}) => ({
	user_userId: one(user, {
		fields: [dataSubjectRequests.userId],
		references: [user.id],
		relationName: "dataSubjectRequests_userId_user_id"
	}),
	user_processedBy: one(user, {
		fields: [dataSubjectRequests.processedBy],
		references: [user.id],
		relationName: "dataSubjectRequests_processedBy_user_id"
	}),
}));

export const propertyAmenitiesRelations = relations(propertyAmenities, ({one}) => ({
	property: one(properties, {
		fields: [propertyAmenities.propertyId],
		references: [properties.id]
	}),
	amenity: one(amenities, {
		fields: [propertyAmenities.amenityId],
		references: [amenities.id]
	}),
}));

export const amenitiesRelations = relations(amenities, ({many}) => ({
	propertyAmenities: many(propertyAmenities),
}));

export const propertyLocationsRelations = relations(propertyLocations, ({one}) => ({
	property: one(properties, {
		fields: [propertyLocations.propertyId],
		references: [properties.id]
	}),
}));

export const proximitiesRelations = relations(proximities, ({one}) => ({
	property: one(properties, {
		fields: [proximities.propertyId],
		references: [properties.id]
	}),
}));

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const propertyMediaRelations = relations(propertyMedia, ({one}) => ({
	property: one(properties, {
		fields: [propertyMedia.propertyId],
		references: [properties.id]
	}),
}));

export const appointmentsRelations = relations(appointments, ({one}) => ({
	property: one(properties, {
		fields: [appointments.propertyId],
		references: [properties.id]
	}),
	user_buyerId: one(user, {
		fields: [appointments.buyerId],
		references: [user.id],
		relationName: "appointments_buyerId_user_id"
	}),
	user_ownerId: one(user, {
		fields: [appointments.ownerId],
		references: [user.id],
		relationName: "appointments_ownerId_user_id"
	}),
}));

export const buyerProfileRelations = relations(buyerProfile, ({one}) => ({
	user: one(user, {
		fields: [buyerProfile.userId],
		references: [user.id]
	}),
}));

export const ownerAvailabilityWindowsRelations = relations(ownerAvailabilityWindows, ({one}) => ({
	user: one(user, {
		fields: [ownerAvailabilityWindows.ownerId],
		references: [user.id]
	}),
}));

export const propertyQuestionsRelations = relations(propertyQuestions, ({one, many}) => ({
	property: one(properties, {
		fields: [propertyQuestions.propertyId],
		references: [properties.id]
	}),
	user: one(user, {
		fields: [propertyQuestions.askedBy],
		references: [user.id]
	}),
	propertyAnswers: many(propertyAnswers),
}));

export const propertyAnswersRelations = relations(propertyAnswers, ({one}) => ({
	propertyQuestion: one(propertyQuestions, {
		fields: [propertyAnswers.questionId],
		references: [propertyQuestions.id]
	}),
	user: one(user, {
		fields: [propertyAnswers.answeredBy],
		references: [user.id]
	}),
}));