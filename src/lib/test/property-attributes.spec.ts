import { describe, it, expect } from 'vitest';
import { toNumberOrNull, validatePropertyData } from '$lib/server/services/property-service';

describe('Property Service Functions', () => {
	describe('toNumberOrNull', () => {
		it('should handle numeric field conversion correctly', () => {
			// Test valid numbers
			expect(toNumberOrNull('123')).toBe(123);
			expect(toNumberOrNull(456)).toBe(456);
			expect(toNumberOrNull(0)).toBe(0);

			// Test empty/invalid values
			expect(toNumberOrNull('')).toBeNull();
			expect(toNumberOrNull(null)).toBeNull();
			expect(toNumberOrNull(undefined)).toBeNull();
			expect(toNumberOrNull('abc')).toBeNull();
			expect(toNumberOrNull(' ')).toBeNull();
		});
	});

	describe('validatePropertyData', () => {
		it('should validate required fields', () => {
			// Test valid data
			const validData = {
				title: 'Valid Property',
				price: 250000,
				propertyType: 'apartment'
			};
			expect(validatePropertyData(validData)).toEqual([]);

			// Test missing title
			const invalidData1 = {
				price: 250000,
				propertyType: 'apartment'
			};
			expect(validatePropertyData(invalidData1)).toContain('Property title is required');

			// Test invalid price
			const invalidData2 = {
				title: 'Valid Property',
				price: -1000,
				propertyType: 'apartment'
			};
			expect(validatePropertyData(invalidData2)).toContain('Price must be a valid positive number');
		});

		it('should validate location data when provided', () => {
			// Test valid location data
			const validData = {
				title: 'Valid Property',
				price: 250000,
				propertyType: 'apartment',
				address: 'Test Street',
				city: 'Berlin',
				postalCode: '10115'
			};
			expect(validatePropertyData(validData)).toEqual([]);

			// Test missing city when address is provided
			const invalidData1 = {
				title: 'Valid Property',
				price: 250000,
				propertyType: 'apartment',
				address: 'Test Street'
				// Missing city
			};
			expect(validatePropertyData(invalidData1)).toContain(
				'City is required when address is provided'
			);

			// Test missing postal code when city is provided
			const invalidData2 = {
				title: 'Valid Property',
				price: 250000,
				propertyType: 'apartment',
				city: 'Berlin'
				// Missing postal code
			};
			expect(validatePropertyData(invalidData2)).toContain(
				'Postal code is required when city is provided'
			);
		});
	});

	describe('Data Transformation', () => {
		it('should transform form data to database format correctly', () => {
			// Simulate form data from frontend
			const formData = {
				title: 'Test Property',
				description: 'A test property',
				price: 250000,
				propertyType: 'apartment',
				status: 'draft',
				bedrooms: 2,
				bathrooms: 1,
				squareMeters: 75, // Frontend field name
				yearBuilt: 2020,
				address: 'Test Street 123',
				city: 'Berlin',
				postalCode: '10115',
				country: 'Germany'
			};

			// Simulate the transformation that happens in the service
			const dbData = {
				title: formData.title,
				description: formData.description || null,
				price: formData.price,
				propertyType: formData.propertyType || 'apartment',
				status: formData.status || 'draft',
				bedrooms: toNumberOrNull(formData.bedrooms),
				bathrooms: toNumberOrNull(formData.bathrooms),
				livingArea: toNumberOrNull(formData.squareMeters), // Transform squareMeters to livingArea
				yearBuilt: toNumberOrNull(formData.yearBuilt)
			};

			// Verify transformation
			expect(dbData.title).toBe(formData.title);
			expect(dbData.price).toBe(formData.price);
			expect(dbData.bedrooms).toBe(formData.bedrooms);
			expect(dbData.bathrooms).toBe(formData.bathrooms);
			expect(dbData.livingArea).toBe(formData.squareMeters); // Key transformation
			expect(dbData.yearBuilt).toBe(formData.yearBuilt);
		});

		it('should handle empty string values correctly', () => {
			const formData = {
				title: 'Test Property',
				price: 250000,
				propertyType: 'apartment',
				bedrooms: '',
				bathrooms: '',
				squareMeters: '',
				yearBuilt: ''
			};

			const dbData = {
				title: formData.title,
				price: formData.price,
				propertyType: formData.propertyType,
				bedrooms: toNumberOrNull(formData.bedrooms),
				bathrooms: toNumberOrNull(formData.bathrooms),
				livingArea: toNumberOrNull(formData.squareMeters),
				yearBuilt: toNumberOrNull(formData.yearBuilt)
			};

			// Verify empty strings become null
			expect(dbData.bedrooms).toBeNull();
			expect(dbData.bathrooms).toBeNull();
			expect(dbData.livingArea).toBeNull();
			expect(dbData.yearBuilt).toBeNull();
		});
	});
});
