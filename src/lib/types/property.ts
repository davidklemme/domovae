// Property-related TypeScript interfaces

export interface CreatePropertyData {
	title: string;
	description?: string;
	locationDescription?: string;
	neighborhoodHighlights?: string;
	propertyHighlights?: string;
	price: number;
	propertyType: string;
	status?: string;
	bedrooms?: number;
	bathrooms?: number;
	livingArea?: number;
	yearBuilt?: number;
	// Location data
	street?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	latitude?: string;
	longitude?: string;
}

export interface UpdatePropertyData {
	title?: string;
	description?: string;
	locationDescription?: string;
	neighborhoodHighlights?: string;
	propertyHighlights?: string;
	price?: number;
	propertyType?: string;
	status?: string;
	bedrooms?: number;
	bathrooms?: number;
	squareMeters?: number;
	yearBuilt?: number;
	// Location data
	address?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	latitude?: string;
	longitude?: string;
}

export interface PropertyLocationData {
	street: string;
	city: string;
	postalCode: string;
	country: string;
	latitude?: string;
	longitude?: string;
}

export interface PropertyWithLocation {
	id: number;
	title: string;
	description?: string | null;
	locationDescription?: string | null;
	neighborhoodHighlights?: string | null;
	propertyHighlights?: string | null;
	price: number;
	propertyType: string;
	status?: string | null;
	bedrooms?: number | null;
	bathrooms?: number | null;
	livingArea?: number | null;
	yearBuilt?: number | null;
	ownerId: string;
	createdAt?: Date | null;
	updatedAt?: Date | null;
	location?: {
		id: number;
		street: string;
		city: string;
		postalCode: string;
		country: string;
		latitude?: string | null;
		longitude?: string | null;
	} | null;
	media?: Array<{
		id: number;
		mediaUrl: string;
		mediaType: string;
		mediaCategory: string;
	}>;
}

// Buyer Profile Types
export type EquityBand = 'lt10' | 'b10_30' | 'b30_50' | 'gt50';
export type PurchaseTimeline = 'immediate' | 'lt3m' | 'lt6m' | 'gt6m';
export type PurchasePurpose = 'eigennutzung' | 'kapitalanlage';

export interface BuyerProfile {
	id: number;
	userId: string;
	equityBand: EquityBand;
	timeline: PurchaseTimeline;
	purpose: PurchasePurpose;
	householdSize?: number;
	schufaAvailable: boolean;
	financingDocUrl?: string;
	financingVerified: boolean;
	consentTimestamp: Date;
	retentionUntil: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface CreateBuyerProfileData {
	equityBand: EquityBand;
	timeline: PurchaseTimeline;
	purpose: PurchasePurpose;
	householdSize?: number;
	schufaAvailable: boolean;
	financingDoc?: File;
	consentGiven: boolean;
}

export interface UpdateBuyerProfileData {
	equityBand?: EquityBand;
	timeline?: PurchaseTimeline;
	purpose?: PurchasePurpose;
	householdSize?: number;
	schufaAvailable?: boolean;
	financingDoc?: File;
	consentGiven?: boolean;
}

export interface BuyerProfileSnapshot {
	equityBand: EquityBand;
	timeline: PurchaseTimeline;
	purpose: PurchasePurpose;
	householdSize?: number;
	schufaAvailable: boolean;
	financingVerified: boolean;
	snapshotDate: Date;
}

// Trust Badge Types
export interface TrustBadge {
	type: 'financing' | 'equity' | 'timeline' | 'purpose' | 'schufa';
	label: string;
	description: string;
	icon: string;
	color: string;
	value: string;
}
