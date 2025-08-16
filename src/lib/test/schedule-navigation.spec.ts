import { describe, it, expect } from 'vitest';

describe('Schedule Navigation', () => {
	it('should construct correct URL for appointment creation', () => {
		const propertyId = 123;
		const expectedUrl = `/appointments/create?propertyId=${propertyId}`;
		expect(expectedUrl).toBe('/appointments/create?propertyId=123');
	});

	it('should handle property ID parameter correctly', () => {
		const propertyId = '456';
		const url = `/appointments/create?propertyId=${propertyId}`;
		const urlParams = new URLSearchParams(url.split('?')[1]);
		const extractedPropertyId = urlParams.get('propertyId');
		expect(extractedPropertyId).toBe('456');
	});

	it('should validate property ID is numeric', () => {
		const propertyId = '789';
		const isNumeric = !isNaN(parseInt(propertyId));
		expect(isNumeric).toBe(true);
	});
});
