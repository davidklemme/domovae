import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import type { ownerAvailabilityWindows } from '../server/db/schema';

// Availability Window Types
export type AvailabilityWindow = InferSelectModel<typeof ownerAvailabilityWindows>;
export type NewAvailabilityWindow = InferInsertModel<typeof ownerAvailabilityWindows>;

// Availability Window Form Data
export interface AvailabilityWindowFormData {
	date: string; // YYYY-MM-DD format
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	slotDuration: number; // minutes
	notes?: string;
	timezone: string;
}

// Generated Time Slots
export interface TimeSlot {
	startTime: string; // HH:MM format
	endTime: string; // HH:MM format
	isAvailable: boolean;
	appointmentId?: number; // if booked
	timezone?: string; // timezone of the availability window
}

// Calendar Export Types
export interface CalendarEvent {
	id: string;
	title: string;
	start: Date;
	end: Date;
	description?: string;
	location?: string;
}

// iCal Feed Types
export interface ICalFeed {
	url: string;
	calendarId: string;
	ownerId: string;
}
