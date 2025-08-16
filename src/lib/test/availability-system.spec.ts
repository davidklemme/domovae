import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Availability Management System', () => {
	describe('Database Schema', () => {
		it('should have owner_availability_windows table in schema', () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = readFileSync(schemaPath, 'utf-8');

			expect(content).toContain('ownerAvailabilityWindows');
			expect(content).toContain('owner_availability_windows');
			expect(content).toContain('ownerId');
			expect(content).toContain('date');
			expect(content).toContain('startTime');
			expect(content).toContain('endTime');
			expect(content).toContain('slotDuration');
		});

		it('should have availability windows relations defined', () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = readFileSync(schemaPath, 'utf-8');

			expect(content).toContain('ownerAvailabilityWindowsRelations');
			expect(content).toContain('availabilityWindows: many(ownerAvailabilityWindows)');
		});
	});

	describe('Availability Service', () => {
		it('should have AvailabilityService class', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('export class AvailabilityService');
			expect(content).toContain('createAvailabilityWindow');
			expect(content).toContain('getOwnerAvailabilityWindows');
			expect(content).toContain('generateTimeSlots');
			expect(content).toContain('deleteAvailabilityWindow');
		});

		it('should have proper imports and dependencies', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('import { db } from');
			expect(content).toContain('import { ownerAvailabilityWindows');
			expect(content).toContain('import { eq, and, gte, lte, or }');
			expect(content).toContain('import type {');
		});

		it('should have time slot generation functionality', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('generateSlotsInWindow');
			expect(content).toContain('timeToMinutes');
			expect(content).toContain('minutesToTime');
		});

		it('should have conflict checking functionality', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/availability-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('existingAppointments');
			expect(content).toContain('isBooked');
			expect(content).toContain('conflict');
		});
	});

	describe('Type Definitions', () => {
		it('should have availability types defined', () => {
			const typesPath = join(process.cwd(), 'src/lib/types/availability.ts');
			const content = readFileSync(typesPath, 'utf-8');

			expect(content).toContain('AvailabilityWindow');
			expect(content).toContain('NewAvailabilityWindow');
			expect(content).toContain('AvailabilityWindowFormData');
			expect(content).toContain('TimeSlot');
		});

		it('should have proper form data interface', () => {
			const typesPath = join(process.cwd(), 'src/lib/types/availability.ts');
			const content = readFileSync(typesPath, 'utf-8');

			expect(content).toContain('date: string');
			expect(content).toContain('startTime: string');
			expect(content).toContain('endTime: string');
			expect(content).toContain('slotDuration: number');
			expect(content).toContain('timezone: string');
		});
	});

	describe('API Endpoints', () => {
		it('should have availability management page server logic', () => {
			const serverPath = join(process.cwd(), 'src/routes/availability/manage/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('export const load');
			expect(content).toContain('export const actions');
			expect(content).toContain('createWindow');
			expect(content).toContain('deleteWindow');
			expect(content).toContain('AvailabilityService');
		});

		it('should check property ownership instead of app role', () => {
			const serverPath = join(process.cwd(), 'src/routes/availability/manage/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('property.ownerId !== session.user.id');
			expect(content).toContain('eq(properties.ownerId, session.user.id)');
			expect(content).not.toContain("session.user.role !== 'owner'");
		});

		it('should have updated timeslots API to use availability windows', () => {
			const timeslotsPath = join(
				process.cwd(),
				'src/routes/api/properties/[id]/timeslots/+server.ts'
			);
			const content = readFileSync(timeslotsPath, 'utf-8');

			expect(content).toContain('AvailabilityService');
			expect(content).toContain('generateTimeSlots');
			expect(content).toContain('property.ownerId');
		});
	});

	describe('Frontend Components', () => {
		it('should have availability management page component', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('Add Time Slot');
			expect(content).toContain('Your Availability Windows');
			expect(content).toContain('formatDate');
			expect(content).toContain('formatTime');
			expect(content).toContain('method="POST"');
		});

		it('should have proper form validation', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('required');
			expect(content).toContain('type="date"');
			expect(content).toContain('type="time"');
			expect(content).toContain('slotDuration');
		});

		it('should have success/error message handling', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('message');
			expect(content).toContain('messageType');
			expect(content).toContain("result.type === 'success'");
			expect(content).toContain("result.type === 'failure'");
		});
	});

	describe('ScheduleAction Component Integration', () => {
		it('should show Manage Availability for property owners', () => {
			const componentPath = join(process.cwd(), 'src/lib/components/ScheduleAction.svelte');
			const content = readFileSync(componentPath, 'utf-8');

			expect(content).toContain('Manage Availability');
			expect(content).toContain('/availability/manage?propertyId=');
			expect(content).toContain('isOwner');
		});

		it('should have proper role-based logic', () => {
			const componentPath = join(process.cwd(), 'src/lib/components/ScheduleAction.svelte');
			const content = readFileSync(componentPath, 'utf-8');

			expect(content).toContain('isOwner = currentUser?.id === propertyOwnerId');
			expect(content).toContain("isBuyer = currentUser?.role === 'buyer' && !isOwner");
		});
	});

	describe('Profile Page Integration', () => {
		it('should have availability management link for property owners', () => {
			const profilePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(profilePath, 'utf-8');

			expect(content).toContain('Manage Availability');
			expect(content).toContain('/availability/manage');
			expect(content).toContain('data.hasProperties');
		});

		it('should have profile server logic to check property ownership', () => {
			const serverPath = join(process.cwd(), 'src/routes/profile/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('export const load');
			expect(content).toContain('eq(properties.ownerId, session.user.id)');
			expect(content).toContain('hasProperties');
		});
	});

	describe('Database Migration', () => {
		it('should have availability windows migration file', () => {
			const migrationDir = join(process.cwd(), 'drizzle');
			const migrationFiles = readFileSync(join(migrationDir, '0005_rare_tempest.sql'), 'utf-8');

			expect(migrationFiles).toContain('owner_availability_windows');
			expect(migrationFiles).toContain('CREATE TABLE "owner_availability_windows"');
		});
	});

	describe('Error Handling and Validation', () => {
		it('should handle authentication errors properly', () => {
			const serverPath = join(process.cwd(), 'src/routes/availability/manage/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('if (!session)');
			expect(content).toContain("throw redirect(302, '/auth/signin')");
		});

		it('should validate required fields', () => {
			const serverPath = join(process.cwd(), 'src/routes/availability/manage/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('if (!date || !startTime || !endTime)');
			expect(content).toContain('Missing required fields');
		});

		it('should handle property ownership validation', () => {
			const serverPath = join(process.cwd(), 'src/routes/availability/manage/+page.server.ts');
			const content = readFileSync(serverPath, 'utf-8');

			expect(content).toContain('property.ownerId !== session.user.id');
			expect(content).toContain('User does not own this property');
		});
	});

	describe('User Experience Features', () => {
		it('should provide clear feedback for users', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('Availability window created successfully');
			expect(content).toContain('No availability windows set');
			expect(content).toContain('Add Your First Time Slot');
		});

		it('should have proper loading states', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('use:enhance');
			expect(content).toContain('result.type');
		});

		it('should have proper navigation', () => {
			const pagePath = join(process.cwd(), 'src/routes/availability/manage/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('href="/profile"');
			expect(content).toContain('href="/dashboard"');
		});
	});
});
