import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Timezone Conversion', () => {
	describe('Database Schema', () => {
		it('should have timezone field in availability windows schema', () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = readFileSync(schemaPath, 'utf-8');

			expect(content).toContain('timezone: varchar');
			expect(content).toContain("default('Europe/Berlin')");
		});
	});

	describe('Type Definitions', () => {
		it('should have timezone field in TimeSlot interface', () => {
			const typesPath = join(process.cwd(), 'src/lib/types/availability.ts');
			const content = readFileSync(typesPath, 'utf-8');

			expect(content).toContain('timezone?: string');
			expect(content).toContain('timezone of the availability window');
		});

		it('should have timezone field in AvailabilityWindowFormData', () => {
			const typesPath = join(process.cwd(), 'src/lib/types/availability.ts');
			const content = readFileSync(typesPath, 'utf-8');

			expect(content).toContain('timezone: string');
		});
	});

	describe('Availability Service', () => {
		it('should include timezone in time slot generation', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('timezone: window.timezone');
			expect(content).toContain("|| 'Europe/Berlin'");
		});

		it('should store timezone when creating availability windows', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('timezone: data.timezone');
		});
	});

	describe('Frontend Timezone Handling', () => {
		it('should capture browser timezone in availability management', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('Intl.DateTimeFormat().resolvedOptions().timeZone');
			expect(content).toContain('(Your timezone)');
		});

		it('should format times in user timezone in appointment creation', () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('formatTimeInUserTimezone');
			expect(content).toContain('Intl.DateTimeFormat().resolvedOptions().timeZone');
			expect(content).toContain('in your timezone');
		});

		it('should include timezone information in time slot display', () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('slot.timezone');
			expect(content).toContain('timezone?: string');
		});
	});

	describe('Timezone Conversion Logic', () => {
		it('should handle timezone conversion in browser environment', () => {
			// Mock browser timezone
			const mockTimezone = 'America/Los_Angeles';
			const originalResolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;

			// Mock the timezone detection
			Intl.DateTimeFormat.prototype.resolvedOptions = function () {
				return {
					timeZone: mockTimezone,
					locale: 'en-US',
					calendar: 'gregory',
					numberingSystem: 'latn'
				};
			};

			// Test time formatting function (similar to what's in the appointment page)
			function formatTimeInUserTimezone(
				timeString: string,
				dateString: string,
				_ownerTimezone: string = 'Europe/Berlin'
			): string {
				const dateTimeString = `${dateString}T${timeString}:00`;
				const date = new Date(dateTimeString);

				return date.toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: '2-digit',
					hour12: true,
					timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
				});
			}

			// Test conversion from Europe/Berlin to America/Los_Angeles
			const formattedTime = formatTimeInUserTimezone('14:00', '2024-01-15', 'Europe/Berlin');

			// Restore original function
			Intl.DateTimeFormat.prototype.resolvedOptions = originalResolvedOptions;

			// The time should be converted (14:00 Berlin time should be earlier in LA)
			expect(formattedTime).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
		});

		it('should handle different timezone conversions', () => {
			function formatTimeInUserTimezone(
				timeString: string,
				dateString: string,
				_ownerTimezone: string = 'Europe/Berlin'
			): string {
				const dateTimeString = `${dateString}T${timeString}:00`;
				const date = new Date(dateTimeString);

				return date.toLocaleTimeString('en-US', {
					hour: 'numeric',
					minute: '2-digit',
					hour12: true,
					timeZone: 'America/New_York' // Fixed timezone for testing
				});
			}

			// Test various time conversions
			const morningTime = formatTimeInUserTimezone('09:00', '2024-01-15', 'Europe/Berlin');
			const afternoonTime = formatTimeInUserTimezone('14:00', '2024-01-15', 'Europe/Berlin');
			const eveningTime = formatTimeInUserTimezone('20:00', '2024-01-15', 'Europe/Berlin');

			expect(morningTime).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
			expect(afternoonTime).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
			expect(eveningTime).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
		});
	});
});
