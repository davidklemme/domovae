// Property-related TypeScript interfaces

export interface CreatePropertyData {
	title: string;
	description?: string;
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
