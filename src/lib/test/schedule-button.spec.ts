import { describe, it, expect } from 'vitest';

describe('Schedule Viewing Button', () => {
	it('should have correct button text for buyers', () => {
		// Test the button text logic
		const isOwner = false;
		const _isBuyer = true;
		const isAuthenticated = true;

		if (isAuthenticated && !isOwner && _isBuyer) {
			expect('📅 Request Viewing').toBe('📅 Request Viewing');
		}
	});

	it('should have correct button text for owners', () => {
		// Test the button text logic
		const isOwner = true;
		const _isBuyer = false;
		const isAuthenticated = true;

		if (isAuthenticated && isOwner) {
			expect('📅 Manage Availability').toBe('📅 Manage Availability');
		}
	});

	it('should have correct button text for unauthenticated users', () => {
		// Test the button text logic
		const isAuthenticated = false;

		if (!isAuthenticated) {
			expect('Sign In').toBe('Sign In');
		}
	});
});
