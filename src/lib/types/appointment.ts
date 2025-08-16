export type AppointmentStatus = 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type AppointmentType = 'viewing' | 'consultation' | 'negotiation';

export interface NewAppointment {
	propertyId: number;
	buyerId: string;
	ownerId: string;
	scheduledAt: Date;
	duration?: number; // in minutes, default 60
	type?: AppointmentType;
	notes?: string;
	buyerNotes?: string;
	ownerNotes?: string;
}

export interface Appointment {
	id: number;
	propertyId: number;
	buyerId: string;
	ownerId: string;
	scheduledAt: Date;
	duration: number;
	type: AppointmentType;
	status: AppointmentStatus;
	notes?: string;
	buyerNotes?: string;
	ownerNotes?: string;
	externalCalendarId?: string;
	externalEventId?: string;
	createdAt: Date;
	updatedAt: Date;
	confirmedAt?: Date;
	cancelledAt?: Date;
}

export interface AppointmentWithRelations extends Appointment {
	property?: {
		id: number;
		title: string;
		price: number;
		propertyType: string;
		location?: {
			street: string;
			city: string;
			postalCode: string;
			country: string;
		};
		media?: Array<{
			id: number;
			mediaUrl: string;
			mediaThumbnail?: string;
		}>;
	};
	buyer?: {
		id: string;
		name?: string;
		email: string;
		image?: string;
	};
	owner?: {
		id: string;
		name?: string;
		email: string;
		image?: string;
	};
}

export interface TimeSlot {
	start: Date;
	end: Date;
	formatted: string;
}

export interface AppointmentFormData {
	propertyId: number;
	scheduledAt: string; // ISO string
	duration: number;
	type: AppointmentType;
	notes?: string;
}

export interface AppointmentUpdateData {
	status?: AppointmentStatus;
	notes?: string;
	buyerNotes?: string;
	ownerNotes?: string;
}
