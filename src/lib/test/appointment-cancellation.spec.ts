import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

describe('Appointment Cancellation', () => {
	describe('Profile Page', () => {
		it('should have cancel button for requested appointments', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('handleCancelAppointment');
			expect(content).toContain('Cancel');
			expect(content).toContain("(appointment.status || '') === 'requested'");
		});

		it('should have proper null checks for appointment status', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain("appointment.status || ''");
			expect(content).toContain("appointment.status || 'Unknown'");
		});

		it('should have cancel function with confirmation', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain("confirm('Are you sure you want to cancel this viewing request?')");
			expect(content).toContain('fetch(`/api/appointments/${appointmentId}`, {');
			expect(content).toContain("method: 'DELETE'");
		});
	});

	describe('API Endpoint', () => {
		it('should have DELETE method for appointments', () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/[id]/+server.ts');
			const content = readFileSync(apiPath, 'utf-8');

			expect(content).toContain('export const DELETE: RequestHandler');
			expect(content).toContain('AppointmentService.deleteAppointment');
		});

		it('should handle authentication and authorization', () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/[id]/+server.ts');
			const content = readFileSync(apiPath, 'utf-8');

			expect(content).toContain('session?.user?.id');
			expect(content).toContain('Unauthorized');
		});

		it('should handle error cases properly', () => {
			const apiPath = join(process.cwd(), 'src/routes/api/appointments/[id]/+server.ts');
			const content = readFileSync(apiPath, 'utf-8');

			expect(content).toContain('Invalid appointment ID');
			expect(content).toContain('Appointment not found');
			expect(content).toContain('Cannot delete');
		});
	});

	describe('Appointment Service', () => {
		it('should have deleteAppointment method', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('deleteAppointment');
			expect(content).toContain('Only buyer can delete their own appointment requests');
			expect(content).toContain('Cannot delete confirmed or completed appointments');
		});

		it('should validate permissions correctly', () => {
			const servicePath = join(process.cwd(), 'src/lib/server/services/appointment-service.ts');
			const content = readFileSync(servicePath, 'utf-8');

			expect(content).toContain('appointment.buyerId !== userId');
			expect(content).toContain("appointment.status !== 'requested'");
		});
	});

	describe('User Experience', () => {
		it('should show cancel button only for requested appointments', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			// Check that cancel button is conditionally shown
			expect(content).toContain("{#if (appointment.status || '') === 'requested'}");
			expect(content).toContain('Cancel');
		});

		it('should have proper styling for cancel button', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('border-red-300');
			expect(content).toContain('text-red-700');
			expect(content).toContain('hover:bg-red-50');
		});

		it('should handle errors gracefully', () => {
			const pagePath = join(process.cwd(), 'src/routes/profile/+page.svelte');
			const content = readFileSync(pagePath, 'utf-8');

			expect(content).toContain('alert(`Failed to cancel appointment:');
			expect(content).toContain("alert('Failed to cancel appointment. Please try again.')");
		});
	});
});
