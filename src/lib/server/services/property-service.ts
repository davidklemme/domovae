import { db } from '$lib/server/db';
import { properties, propertyLocations } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Session } from '@auth/core/types';
import type { CreatePropertyData } from '$lib/types/property';

// Helper function to convert string to number or null
export const toNumberOrNull = (value: unknown): number | null => {
	if (value === '' || value === null || value === undefined) return null;
	const num = parseInt(String(value));
	return isNaN(num) ? null : num;
};

// Validation functions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validatePropertyData = (data: any): string[] => {
	const errors: string[] = [];

	if (!data.title || !data.title.trim()) {
		errors.push('Property title is required');
	}

	if (!data.price) {
		errors.push('Property price is required');
	} else {
		const price = toNumberOrNull(data.price);
		if (price === null || price <= 0) {
			errors.push('Price must be a valid positive number');
		}
	}

	if (!data.propertyType) {
		errors.push('Property type is required');
	}

	// Validate location data if provided
	if (data.address && !data.city) {
		errors.push('City is required when address is provided');
	}

	if (data.city && !data.postalCode) {
		errors.push('Postal code is required when city is provided');
	}

	return errors;
};

// Generic check function that always returns true for now
export const canCreateProperty = (): boolean => {
	// TODO: Add validation logic here (e.g., role checks, limits, etc.)
	return true;
};

// Property creation function
export const createProperty = async (propertyData: CreatePropertyData, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Check if user can create properties
	if (!canCreateProperty()) {
		throw new Error('Forbidden: You cannot create properties');
	}

	// Validate data
	const validationErrors = validatePropertyData(propertyData);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.join(', '));
	}

	const price = toNumberOrNull(propertyData.price);
	if (price === null || price <= 0) {
		throw new Error('Price must be a valid positive number');
	}

	// Create property
	const newProperty = await db
		.insert(properties)
		.values({
			title: propertyData.title,
			description: propertyData.description || null,
			price: price,
			propertyType: propertyData.propertyType,
			status: propertyData.status || 'draft',
			bedrooms: toNumberOrNull(propertyData.bedrooms),
			bathrooms: toNumberOrNull(propertyData.bathrooms),
			livingArea: toNumberOrNull(propertyData.livingArea),
			yearBuilt: toNumberOrNull(propertyData.yearBuilt),
			ownerId: session.user.id
		})
		.returning();

	// Create location
	if (propertyData.street || propertyData.city || propertyData.postalCode || propertyData.country) {
		await db.insert(propertyLocations).values({
			propertyId: newProperty[0].id,
			street: propertyData.street || '',
			city: propertyData.city || '',
			postalCode: propertyData.postalCode || '',
			country: propertyData.country || 'Germany',
			latitude: propertyData.latitude,
			longitude: propertyData.longitude
		});
	}

	return newProperty[0];
};

// Property update function
export const updateProperty = async (
	propertyId: number,
	propertyData: CreatePropertyData,
	session: Session
) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Check if user owns this property or is admin
	const existingProperty = await db.query.properties.findFirst({
		where: eq(properties.id, propertyId)
	});

	if (!existingProperty) {
		throw new Error('Property not found');
	}

	if (existingProperty.ownerId !== session.user.id && session.user.role !== 'admin') {
		throw new Error('Forbidden: You can only edit your own properties');
	}

	// Validate data
	const validationErrors = validatePropertyData(propertyData);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.join(', '));
	}

	const price = toNumberOrNull(propertyData.price);
	if (price === null || price <= 0) {
		throw new Error('Price must be a valid positive number');
	}

	// Update property
	const updatedProperty = await db
		.update(properties)
		.set({
			title: propertyData.title as string,
			description: (propertyData.description as string) || null,
			price: price,
			propertyType: (propertyData.propertyType as string) || 'apartment',
			status: (propertyData.status as string) || 'draft',
			bedrooms: toNumberOrNull(propertyData.bedrooms),
			bathrooms: toNumberOrNull(propertyData.bathrooms),
			livingArea: toNumberOrNull(propertyData.livingArea),
			yearBuilt: toNumberOrNull(propertyData.yearBuilt),
			updatedAt: new Date()
		})
		.where(eq(properties.id, propertyId))
		.returning();

	// Handle location - create or update
	if (
		propertyData.street ||
		propertyData.city ||
		propertyData.postalCode ||
		propertyData.country ||
		propertyData.latitude ||
		propertyData.longitude
	) {
		// Check if location exists
		const existingLocation = await db.query.propertyLocations.findFirst({
			where: eq(propertyLocations.propertyId, propertyId)
		});

		if (existingLocation) {
			// Update existing location
			await db
				.update(propertyLocations)
				.set({
					street: (propertyData.street as string) || '',
					city: (propertyData.city as string) || '',
					postalCode: (propertyData.postalCode as string) || '',
					country: (propertyData.country as string) || 'Germany',
					latitude: propertyData.latitude as string,
					longitude: propertyData.longitude as string,
					updatedAt: new Date()
				})
				.where(eq(propertyLocations.propertyId, propertyId));
		} else {
			// Create new location
			await db.insert(propertyLocations).values({
				propertyId: propertyId as number,
				street: (propertyData.street as string) || '',
				city: (propertyData.city as string) || '',
				postalCode: (propertyData.postalCode as string) || '',
				country: (propertyData.country as string) || 'Germany',
				latitude: propertyData.latitude as string,
				longitude: propertyData.longitude as string
			});
		}
	}

	return updatedProperty[0];
};

// Property deletion (soft delete) function
export const archiveProperty = async (propertyId: number, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Check if user owns this property or is admin
	const existingProperty = await db.query.properties.findFirst({
		where: eq(properties.id, propertyId)
	});

	if (!existingProperty) {
		throw new Error('Property not found');
	}

	if (existingProperty.ownerId !== session.user.id && session.user.role !== 'admin') {
		throw new Error('Forbidden: You can only delete your own properties');
	}

	// Soft delete by setting status to archived
	await db
		.update(properties)
		.set({
			status: 'archived',
			updatedAt: new Date()
		})
		.where(eq(properties.id, propertyId));

	return { message: 'Property archived successfully' };
};

// Get property by ID function
export const getPropertyById = async (propertyId: number) => {
	const property = await db.query.properties.findFirst({
		where: eq(properties.id, propertyId),
		with: {
			location: true,
			media: true,
			amenities: {
				with: {
					amenity: true
				}
			}
		}
	});

	if (!property) {
		throw new Error('Property not found');
	}

	return property;
};

// Get all properties function
export const getAllProperties = async (session?: Session) => {
	const allProperties = await db.query.properties.findMany({
		with: {
			location: true,
			media: true,
			amenities: {
				with: {
					amenity: true
				}
			}
		}
	});

	// Filter and sort properties based on user authentication
	if (!session?.user) {
		// Non-authenticated users only see 'live' properties
		return allProperties
			.filter((property) => property.status === 'live')
			.sort(
				(a, b) =>
					new Date(b.createdAt || new Date()).getTime() -
					new Date(a.createdAt || new Date()).getTime()
			);
	} else {
		// Authenticated users see:
		// - All 'live', 'published', 'in_negotiation' properties from everyone
		// - All their own properties (including drafts and archived)
		const filteredProperties = allProperties.filter(
			(property) =>
				property.status === 'live' ||
				property.status === 'published' ||
				property.status === 'in_negotiation' ||
				property.ownerId === session.user.id
		);

		// Sort them: own properties first (drafts first), then others by creation date
		return filteredProperties.sort((a, b) => {
			const isOwnA = a.ownerId === session.user.id;
			const isOwnB = b.ownerId === session.user.id;

			// If both are own properties, sort by status (draft first) then by creation date
			if (isOwnA && isOwnB) {
				if (a.status === 'draft' && b.status !== 'draft') return -1;
				if (b.status === 'draft' && a.status !== 'draft') return 1;
				return (
					new Date(b.createdAt || new Date()).getTime() -
					new Date(a.createdAt || new Date()).getTime()
				);
			}

			// If only one is own property, put it first
			if (isOwnA && !isOwnB) return -1;
			if (!isOwnA && isOwnB) return 1;

			// Both are other properties, sort by creation date
			return (
				new Date(b.createdAt || new Date()).getTime() -
				new Date(a.createdAt || new Date()).getTime()
			);
		});
	}
};
