import { describe, it, expect } from 'vitest';
import {
	generateSEOMeta,
	generateStructuredData,
	generateAltText,
	generateCanonicalUrl,
	generateSlug
} from '$lib/server/services/seo-service';
import type { PropertyWithLocation } from '$lib/types/property';

describe('SEO Service', () => {
	const mockProperty: PropertyWithLocation = {
		id: 1,
		title: 'Beautiful 3-Bedroom Apartment in Berlin',
		description:
			'This stunning apartment features modern amenities, a spacious living room, and a beautiful balcony with city views. Located in the heart of Berlin, this property offers excellent connectivity and is close to shopping centers, schools, and public transport.',
		price: 450000,
		propertyType: 'apartment',
		status: 'live',
		ownerId: 'user123',
		bedrooms: 2,
		bathrooms: 1,
		livingArea: 85,
		location: {
			id: 1,
			street: 'Musterstraße 123',
			city: 'Berlin',
			postalCode: '10115',
			country: 'DE',
			latitude: '52.5200',
			longitude: '13.4050'
		},
		media: [
			{
				id: 1,
				mediaUrl: '/uploads/property1-main.jpg',
				mediaType: 'image',
				mediaCategory: 'main'
			}
		],
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-15')
	};

	const baseUrl = 'https://domovae.com';

	describe('generateSEOMeta', () => {
		it('should generate proper SEO meta data', () => {
			const seoMeta = generateSEOMeta(mockProperty, baseUrl);

			expect(seoMeta.title).toBe('Beautiful 3-Bedroom Apartment in Berlin - Berlin | Domovae');
			expect(seoMeta.description).toContain('This stunning apartment features modern amenities');
			expect(seoMeta.description.length).toBeLessThanOrEqual(160);
			expect(seoMeta.image).toBe('https://domovae.com/uploads/property1-main.jpg');
			expect(seoMeta.url).toBe('https://domovae.com/properties/1');
			expect(seoMeta.type).toBe('website');
		});

		it('should handle properties without media', () => {
			const propertyWithoutMedia = { ...mockProperty, media: [] };
			const seoMeta = generateSEOMeta(propertyWithoutMedia, baseUrl);

			expect(seoMeta.image).toBe('https://domovae.com/default-property-image.jpg');
		});

		it('should handle properties without description', () => {
			const propertyWithoutDesc = { ...mockProperty, description: '' };
			const seoMeta = generateSEOMeta(propertyWithoutDesc, baseUrl);

			expect(seoMeta.description).toContain('Beautiful 3-Bedroom Apartment in Berlin in Berlin');
			expect(seoMeta.description).toContain('Price: 450.000,00');
		});
	});

	describe('generateStructuredData', () => {
		it('should generate property schema', () => {
			const structuredData = generateStructuredData(mockProperty, baseUrl);

			expect(structuredData).toHaveLength(3); // Property, Offer, Breadcrumb

			const propertySchema = structuredData[0];
			expect(propertySchema['@type']).toBe('SingleFamilyResidence');
			expect(propertySchema.name).toBe(mockProperty.title);
			expect(propertySchema.numberOfRooms).toBe(2);
			expect(propertySchema.floorSize.value).toBe(85);
			expect(propertySchema.address.addressLocality).toBe('Berlin');
		});

		it('should generate offer schema', () => {
			const structuredData = generateStructuredData(mockProperty, baseUrl);
			const offerSchema = structuredData[1];

			expect(offerSchema['@type']).toBe('Offer');
			expect(offerSchema.price).toBe(450000);
			expect(offerSchema.priceCurrency).toBe('EUR');
			expect(offerSchema.availability).toBe('https://schema.org/InStock');
		});

		it('should generate breadcrumb schema', () => {
			const structuredData = generateStructuredData(mockProperty, baseUrl);
			const breadcrumbSchema = structuredData[2];

			expect(breadcrumbSchema['@type']).toBe('BreadcrumbList');
			expect(breadcrumbSchema.itemListElement).toHaveLength(4);
			expect(breadcrumbSchema.itemListElement[0].name).toBe('Home');
			expect(breadcrumbSchema.itemListElement[3].name).toBe(mockProperty.title);
		});
	});

	describe('generateAltText', () => {
		it('should generate proper alt text for main photo', () => {
			const altText = generateAltText(mockProperty, 0);
			expect(altText).toBe('Beautiful 3-Bedroom Apartment in Berlin in Berlin - Main photo');
		});

		it('should generate proper alt text for additional photos', () => {
			const altText = generateAltText(mockProperty, 2);
			expect(altText).toBe('Beautiful 3-Bedroom Apartment in Berlin in Berlin - Photo 3');
		});
	});

	describe('generateCanonicalUrl', () => {
		it('should generate proper canonical URL', () => {
			const canonicalUrl = generateCanonicalUrl(mockProperty, baseUrl);
			expect(canonicalUrl).toBe('https://domovae.com/properties/1');
		});
	});

	describe('generateSlug', () => {
		it('should generate proper slug from title and city', () => {
			const slug = generateSlug('Beautiful 3-Bedroom Apartment', 'Berlin');
			expect(slug).toBe('beautiful-3-bedroom-apartment-berlin');
		});

		it('should handle special characters', () => {
			const slug = generateSlug('Luxury Apartment & Villa!', 'München');
			expect(slug).toBe('luxury-apartment-villa-mnchen');
		});

		it('should handle multiple spaces', () => {
			const slug = generateSlug('  Beautiful   Apartment  ', 'Berlin');
			expect(slug).toBe('beautiful-apartment-berlin');
		});
	});
});
