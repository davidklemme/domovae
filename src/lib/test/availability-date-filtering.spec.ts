import { describe, it, expect } from 'vitest';
import { AvailabilityService } from '../server/services/availability-service';

describe('AvailabilityService Date Filtering', () => {
	describe('Service Instantiation', () => {
		it('should create service instance without errors', () => {
			const service = new AvailabilityService();
			expect(service).toBeInstanceOf(AvailabilityService);
		});
	});

	describe('Method Signatures', () => {
		it('should have hasAvailabilityForDate method', () => {
			const service = new AvailabilityService();
			expect(typeof service.hasAvailabilityForDate).toBe('function');
		});

		it('should have getAvailableDates method', () => {
			const service = new AvailabilityService();
			expect(typeof service.getAvailableDates).toBe('function');
		});
	});
});
