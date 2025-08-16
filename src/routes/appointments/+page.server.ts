import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { AppointmentService } from '$lib/server/services/appointment-service';

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw redirect(302, '/auth/signin');
	}

	const role = (url.searchParams.get('role') as 'buyer' | 'owner') || 'buyer';

	try {
		const appointments = await AppointmentService.getUserAppointments(session.user.id, role);

		return {
			appointments,
			user: session.user,
			role
		};
	} catch (error) {
		console.error('Error loading appointments:', error);
		return {
			appointments: [],
			user: session.user,
			role
		};
	}
};

export const actions: Actions = {
	updateStatus: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId') as string;
		const status = formData.get('status') as string;
		const notes = formData.get('notes') as string;

		if (!appointmentId || !status) {
			return { success: false, error: 'Appointment ID and status are required' };
		}

		try {
			await AppointmentService.updateAppointmentStatus(
				parseInt(appointmentId),
				status as 'requested' | 'confirmed' | 'cancelled' | 'completed',
				session.user.id,
				notes || undefined
			);

			return { success: true };
		} catch (error) {
			console.error('Error updating appointment status:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to update appointment'
			};
		}
	},

	deleteAppointment: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const appointmentId = formData.get('appointmentId') as string;

		if (!appointmentId) {
			return { success: false, error: 'Appointment ID is required' };
		}

		try {
			await AppointmentService.deleteAppointment(parseInt(appointmentId), session.user.id);
			return { success: true };
		} catch (error) {
			console.error('Error deleting appointment:', error);
			return {
				success: false,
				error: error instanceof Error ? error.message : 'Failed to delete appointment'
			};
		}
	}
};
