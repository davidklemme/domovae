import type { PropertyWithLocation } from '$lib/types/property';

export interface SEOMeta {
	title: string;
	description: string;
	image: string;
	url: string;
	type: string;
}

export interface StructuredData {
	'@context': string;
	'@type': string;
	[key: string]: unknown;
}

export function generateSEOMeta(property: PropertyWithLocation, baseUrl: string): SEOMeta {
	const title = `${property.title} - ${property.location?.city || 'Property'} | Brickly`;

	let description: string;
	if (property.description) {
		description =
			property.description.length > 157
				? `${property.description.substring(0, 157)}...`
				: property.description;
	} else {
		description = `${property.title} in ${property.location?.city || 'Germany'}. ${property.price ? `Price: ${formatPrice(property.price)}` : ''}`;
	}

	const image =
		property.media && property.media.length > 0
			? `${baseUrl}${property.media[0].mediaUrl}`
			: `${baseUrl}/default-property-image.jpg`;

	const url = `${baseUrl}/properties/${property.id}`;

	return {
		title,
		description,
		image,
		url,
		type: 'website'
	};
}

export function generateStructuredData(
	property: PropertyWithLocation,
	baseUrl: string
): StructuredData[] {
	const structuredData: StructuredData[] = [];

	// Property schema (SingleFamilyResidence)
	const propertySchema: StructuredData = {
		'@context': 'https://schema.org',
		'@type': 'SingleFamilyResidence',
		name: property.title,
		description: property.description || '',
		numberOfRooms: property.bedrooms || 0,
		floorSize: {
			'@type': 'QuantitativeValue',
			value: property.livingArea || 0,
			unitCode: 'MTK' // Square meters
		},
		address: {
			'@type': 'PostalAddress',
			streetAddress: property.location?.street || '',
			addressLocality: property.location?.city || '',
			postalCode: property.location?.postalCode || '',
			addressCountry: property.location?.country || 'DE'
		}
	};

	if (property.location?.latitude && property.location?.longitude) {
		propertySchema.geo = {
			'@type': 'GeoCoordinates',
			latitude: property.location.latitude,
			longitude: property.location.longitude
		};
	}

	structuredData.push(propertySchema);

	// Offer schema
	const offerSchema: StructuredData = {
		'@context': 'https://schema.org',
		'@type': 'Offer',
		itemOffered: {
			'@type': 'SingleFamilyResidence',
			'@id': `${baseUrl}/properties/${property.id}#property`
		},
		price: property.price || 0,
		priceCurrency: 'EUR',
		availability:
			property.status === 'live' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
		url: `${baseUrl}/properties/${property.id}`
	};

	structuredData.push(offerSchema);

	// Breadcrumb schema
	const breadcrumbSchema: StructuredData = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{
				'@type': 'ListItem',
				position: 1,
				name: 'Home',
				item: baseUrl
			},
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Properties',
				item: `${baseUrl}/properties`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: property.location?.city || 'Property',
				item: `${baseUrl}/properties?city=${encodeURIComponent(property.location?.city || '')}`
			},
			{
				'@type': 'ListItem',
				position: 4,
				name: property.title,
				item: `${baseUrl}/properties/${property.id}`
			}
		]
	};

	structuredData.push(breadcrumbSchema);

	// Note: FAQ schema removed as questions are not part of PropertyWithLocation type

	return structuredData;
}

export function generateAltText(property: PropertyWithLocation, imageIndex: number): string {
	const baseText = `${property.title} in ${property.location?.city || 'Germany'}`;

	if (imageIndex === 0) {
		return `${baseText} - Main photo`;
	}

	return `${baseText} - Photo ${imageIndex + 1}`;
}

export function generateCanonicalUrl(property: PropertyWithLocation, baseUrl: string): string {
	return `${baseUrl}/properties/${property.id}`;
}

export function generateSlug(title: string, city: string): string {
	const slug = `${title}-${city}`
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, '')
		.replace(/\s+/g, '-')
		.replace(/-+/g, '-')
		.trim();

	return slug.replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

function formatPrice(price: number): string {
	return new Intl.NumberFormat('de-DE', {
		style: 'currency',
		currency: 'EUR'
	}).format(price);
}
