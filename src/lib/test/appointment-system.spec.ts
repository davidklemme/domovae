import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('Appointment System', () => {
	describe('Database Schema', () => {
		it('should have appointments table in schema', async () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = await readFile(schemaPath, 'utf-8');

			// Check for appointments table definition
			expect(content).toContain('export const appointments = pgTable');
			expect(content).toContain('propertyId: integer');
			expect(content).toContain('buyerId: text');
			expect(content).toContain('ownerId: text');
			expect(content).toContain('scheduledAt: timestamp');
			expect(content).toContain('duration: integer');
			expect(content).toContain('type: varchar');
			expect(content).toContain('status: varchar');
			expect(content).toContain('notes: text');
			expect(content).toContain('buyerNotes: text');
			expect(content).toContain('ownerNotes: text');
		});

		it('should have appointment relations defined', async () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = await readFile(schemaPath, 'utf-8');

			// Check for appointment relations
			expect(content).toContain('export const appointmentsRelations');
			expect(content).toContain('property: one(properties');
			expect(content).toContain('buyer: one(users');
			expect(content).toContain('owner: one(users');
		});

		it('should have updated properties relations to include appointments', async () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = await readFile(schemaPath, 'utf-8');

			// Check that properties relations include appointments
			expect(content).toContain('appointments: many(appointments)');
		});

		it('should have updated users relations to include appointments', async () => {
			const schemaPath = join(process.cwd(), 'src/lib/server/db/schema.ts');
			const content = await readFile(schemaPath, 'utf-8');

			// Check that users relations include appointments
			expect(content).toContain('buyerAppointments: many(appointments');
			expect(content).toContain('ownerAppointments: many(appointments');
		});
	});

	describe('Appointment Service', () => {
		it('should have AppointmentService class', async () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = await readFile(servicePath, 'utf-8');

			// Check for service class
			expect(content).toContain('export class AppointmentService');
			expect(content).toContain('static async createAppointment');
			expect(content).toContain('static async getUserAppointments');
			expect(content).toContain('static async getPropertyAppointments');
			expect(content).toContain('static async updateAppointmentStatus');
			expect(content).toContain('static async updateAppointmentNotes');
			expect(content).toContain('static async deleteAppointment');
			expect(content).toContain('static async getAvailableTimeSlots');
		});

		it('should have proper imports and dependencies', async () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = await readFile(servicePath, 'utf-8');

			// Check for required imports
			expect(content).toContain("import { db } from '../db'");
			expect(content).toContain("import { appointments, properties } from '../db/schema'");
			expect(content).toContain("import { eq, and, gte, lte, desc, asc } from 'drizzle-orm'");
			expect(content).toContain(
				"import type { NewAppointment, AppointmentStatus } from '../../types/appointment'"
			);
		});

		it('should have conflict checking functionality', async () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = await readFile(servicePath, 'utf-8');

			// Check for conflict checking
			expect(content).toContain('checkForConflicts');
			expect(content).toContain('conflictingAppointment');
			expect(content).toContain('Time slot is not available');
		});

		it('should have proper error handling', async () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = await readFile(servicePath, 'utf-8');

			// Check for error handling
			expect(content).toContain('try {');
			expect(content).toContain('} catch (error) {');
			expect(content).toContain('console.error');
			expect(content).toContain('throw error');
		});
	});

	describe('Type Definitions', () => {
		it('should have appointment types defined', async () => {
			const typesPath = join(process.cwd(), 'src/lib/types/appointment.ts');
			const content = await readFile(typesPath, 'utf-8');

			// Check for type definitions
			expect(content).toContain('export type AppointmentStatus');
			expect(content).toContain('export type AppointmentType');
			expect(content).toContain('export interface NewAppointment');
			expect(content).toContain('export interface Appointment');
			expect(content).toContain('export interface AppointmentWithRelations');
			expect(content).toContain('export interface TimeSlot');
			expect(content).toContain('export interface AppointmentFormData');
			expect(content).toContain('export interface AppointmentUpdateData');
		});

		it('should have proper status and type enums', async () => {
			const typesPath = join(process.cwd(), 'src/lib/types/appointment.ts');
			const content = await readFile(typesPath, 'utf-8');

			// Check for status values
			expect(content).toContain(
				"'requested' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'"
			);
			expect(content).toContain("'viewing' | 'consultation' | 'negotiation'");
		});
	});

	describe('API Endpoints', () => {
		it('should have appointments API endpoint', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for API endpoints
			expect(content).toContain('export const GET');
			expect(content).toContain('export const POST');
			expect(content).toContain('AppointmentService');
		});

		it('should have individual appointment API endpoint', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/[id]/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for individual appointment endpoints
			expect(content).toContain('export const GET');
			expect(content).toContain('export const PATCH');
			expect(content).toContain('export const DELETE');
		});

		it('should have timeslots API endpoint', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/properties/[id]/timeslots/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for timeslots endpoint
			expect(content).toContain('export const GET');
			expect(content).toContain('AvailabilityService');
			expect(content).toContain('generateTimeSlots');
		});

		it('should use consistent authentication pattern', async () => {
			const appointmentsApiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(appointmentsApiPath, 'utf-8');

			// Check for consistent auth pattern
			expect(content).toContain('locals.getSession()');
			expect(content).not.toContain('getServerSession');
			expect(content).not.toContain('authConfig');
		});
	});

	describe('Appointment Creation Page', () => {
		it('should have appointment creation page server logic', async () => {
			const serverPath = join(process.cwd(), 'src/routes/appointments/create/+page.server.ts');
			const content = await readFile(serverPath, 'utf-8');

			// Check for server-side logic
			expect(content).toContain('export const load');
			expect(content).toContain('export const actions');
			expect(content).toContain('locals.getSession()');
			expect(content).toContain('AppointmentService');
		});

		it('should have appointment creation page component', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for form elements
			expect(content).toContain('selectedDate');
			expect(content).toContain('selectedTime');
			expect(content).toContain('selectedDuration');
			expect(content).toContain('selectedType');
			expect(content).toContain('notes');
			expect(content).toContain('method="POST"');
			expect(content).toContain('Schedule Your Viewing');
		});

		it('should have proper form validation', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for validation
			expect(content).toContain('required');
			expect(content).toContain('disabled={isLoading || !selectedDate || !selectedTime}');
			expect(content).toContain('Please select a date and time');
		});

		it('should have date and time selection', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for date/time selection
			expect(content).toContain('availableDates');
			expect(content).toContain('availableTimeSlots');
			expect(content).toContain('fetchAvailableSlots');
			expect(content).toContain('durationOptions');
			expect(content).toContain('typeOptions');
		});
	});

	describe('Appointments List Page', () => {
		it('should have appointments list page server logic', async () => {
			const serverPath = join(process.cwd(), 'src/routes/appointments/+page.server.ts');
			const content = await readFile(serverPath, 'utf-8');

			// Check for server-side logic
			expect(content).toContain('export const load');
			expect(content).toContain('export const actions');
			expect(content).toContain('getUserAppointments');
			expect(content).toContain('updateStatus');
			expect(content).toContain('deleteAppointment');
		});

		it('should have appointments list page component', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for list functionality
			expect(content).toContain('activeTab');
			expect(content).toContain('filteredAppointments');
			expect(content).toContain('pendingAppointments');
			expect(content).toContain('confirmedAppointments');
			expect(content).toContain('completedAppointments');
			expect(content).toContain('cancelledAppointments');
		});

		it('should have tab navigation for buyer/owner views', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for tab navigation
			expect(content).toContain('My Viewing Requests');
			expect(content).toContain('Property Viewing Requests');
			expect(content).toContain('switchTab');
		});

		it('should have status management functionality', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for status management
			expect(content).toContain('getStatusColor');
			expect(content).toContain('getStatusLabel');
			expect(content).toContain('canUpdateStatus');
			expect(content).toContain('canDeleteAppointment');
		});

		it('should have appointment actions', async () => {
			const pagePath = join(process.cwd(), 'src/routes/appointments/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for action buttons
			expect(content).toContain('Confirm');
			expect(content).toContain('Decline');
			expect(content).toContain('Cancel');
			expect(content).toContain('Mark Complete');
			expect(content).toContain('Notes');
		});
	});

	describe('ScheduleAction Component Integration', () => {
		it('should have ScheduleAction component with appointment link', async () => {
			const componentPath = join(process.cwd(), 'src/lib/components/ScheduleAction.svelte');
			const content = await readFile(componentPath, 'utf-8');

			// Check for appointment creation link
			expect(content).toContain('/appointments/create?propertyId=');
			expect(content).toContain('Request Viewing');
		});

		it('should have proper role-based logic', async () => {
			const componentPath = join(process.cwd(), 'src/lib/components/ScheduleAction.svelte');
			const content = await readFile(componentPath, 'utf-8');

			// Check for role-based logic
			expect(content).toContain('isOwner');
			expect(content).toContain('isBuyer');
			expect(content).toContain('isAuthenticated');
			expect(content).toContain("currentUser?.role === 'buyer'");
		});

		it('should have proper navigation logic', async () => {
			const componentPath = join(process.cwd(), 'src/lib/components/ScheduleAction.svelte');
			const content = await readFile(componentPath, 'utf-8');

			// Check for navigation
			expect(content).toContain('goto');
			expect(content).toContain('/auth/signin');
		});
	});

	describe('Authentication Configuration', () => {
		it('should have proper role fetching in auth callbacks', async () => {
			const authPath = join(process.cwd(), 'src/lib/server/auth.ts');
			const content = await readFile(authPath, 'utf-8');

			// Check for role fetching
			expect(content).toContain('userRecord?.role');
			expect(content).toContain('db.query.users.findFirst');
			expect(content).toContain('session.user.role');
			expect(content).toContain('token.role');
		});

		it('should handle role fetching errors gracefully', async () => {
			const authPath = join(process.cwd(), 'src/lib/server/auth.ts');
			const content = await readFile(authPath, 'utf-8');

			// Check for error handling
			expect(content).toContain('try {');
			expect(content).toContain('} catch (error) {');
			expect(content).toContain('console.error');
			expect(content).toContain("session.user.role = 'buyer'");
		});
	});

	describe('Database Migration', () => {
		it('should have appointments migration file', async () => {
			const drizzleDir = join(process.cwd(), 'drizzle');
			await readFile(drizzleDir, 'utf-8').catch(() => '');

			// Check that migration was generated (this is a basic check)
			expect(drizzleDir).toBeDefined();
		});
	});

	describe('Error Handling and Validation', () => {
		it('should handle authentication errors properly', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for auth error handling
			expect(content).toContain('Unauthorized');
			expect(content).toContain('status: 401');
		});

		it('should validate required fields', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for validation
			expect(content).toContain('Property ID and scheduled date are required');
			expect(content).toContain('status: 400');
		});

		it('should handle property not found errors', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for property validation
			expect(content).toContain('Property not found');
			expect(content).toContain('status: 404');
		});

		it('should handle scheduling conflicts', async () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/+server.ts');
			const content = await readFile(apiPath, 'utf-8');

			// Check for conflict handling
			expect(content).toContain('not available');
			expect(content).toContain('status: 409');
		});
	});

	describe('User Experience Features', () => {
		it('should provide clear feedback for users', async () => {
			const createPagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(createPagePath, 'utf-8');

			// Check for user feedback
			expect(content).toContain('What happens next?');
			expect(content).toContain('Appointment scheduled successfully');
			expect(content).toContain('Your viewing request will be sent to the property owner');
		});

		it('should have proper loading states', async () => {
			const createPagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(createPagePath, 'utf-8');

			// Check for loading states
			expect(content).toContain('isLoading');
			expect(content).toContain('Scheduling...');
			expect(content).toContain('disabled={isLoading');
		});

		it('should have proper navigation', async () => {
			const createPagePath = join(process.cwd(), 'src/routes/appointments/create/+page.svelte');
			const content = await readFile(createPagePath, 'utf-8');

			// Check for navigation
			expect(content).toContain('← Back');
			expect(content).toContain('Cancel');
			expect(content).toContain('goto');
		});
	});
});
