import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/server/services/appointment-service';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const appointmentId = parseInt(params.id);
		if (isNaN(appointmentId)) {
			return json({ error: 'Invalid appointment ID' }, { status: 400 });
		}

		// Get appointment with relations
		const { db } = await import('$lib/server/db');
		const { appointments } = await import('$lib/server/db/schema');
		const { eq } = await import('drizzle-orm');

		const appointment = await db.query.appointments.findFirst({
			where: eq(appointments.id, appointmentId),
			with: {
				property: {
					with: {
						location: true,
						media: true
					}
				},
				buyer: true,
				owner: true
			}
		});

		if (!appointment) {
			return json({ error: 'Appointment not found' }, { status: 404 });
		}

		// Check if user has access to this appointment
		if (appointment.buyerId !== session.user.id && appointment.ownerId !== session.user.id) {
			return json({ error: 'Unauthorized' }, { status: 403 });
		}

		return json({ appointment });
	} catch (error) {
		console.error('Error fetching appointment:', error);
		return json({ error: 'Failed to fetch appointment' }, { status: 500 });
	}
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const appointmentId = parseInt(params.id);
		if (isNaN(appointmentId)) {
			return json({ error: 'Invalid appointment ID' }, { status: 400 });
		}

		const body = await request.json();
		const { status, notes, buyerNotes, ownerNotes } = body;

		// Get the appointment to check permissions
		const { db } = await import('$lib/server/db');
		const { appointments } = await import('$lib/server/db/schema');
		const { eq } = await import('drizzle-orm');

		const appointment = await db.query.appointments.findFirst({
			where: eq(appointments.id, appointmentId)
		});

		if (!appointment) {
			return json({ error: 'Appointment not found' }, { status: 404 });
		}

		let updatedAppointment;

		// Handle status updates (only owner can update status)
		if (status) {
			if (appointment.ownerId !== session.user.id) {
				return json(
					{ error: 'Only property owner can update appointment status' },
					{ status: 403 }
				);
			}
			updatedAppointment = await AppointmentService.updateAppointmentStatus(
				appointmentId,
				status,
				session.user.id,
				notes
			);
		}

		// Handle notes updates
		if (buyerNotes !== undefined) {
			updatedAppointment = await AppointmentService.updateAppointmentNotes(
				appointmentId,
				session.user.id,
				buyerNotes,
				'buyer'
			);
		}

		if (ownerNotes !== undefined) {
			updatedAppointment = await AppointmentService.updateAppointmentNotes(
				appointmentId,
				session.user.id,
				ownerNotes,
				'owner'
			);
		}

		return json({ appointment: updatedAppointment });
	} catch (error) {
		console.error('Error updating appointment:', error);

		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return json({ error: error.message }, { status: 404 });
			}
			if (error.message.includes('Unauthorized')) {
				return json({ error: error.message }, { status: 403 });
			}
		}

		return json({ error: 'Failed to update appointment' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const appointmentId = parseInt(params.id);
		if (isNaN(appointmentId)) {
			return json({ error: 'Invalid appointment ID' }, { status: 400 });
		}

		await AppointmentService.deleteAppointment(appointmentId, session.user.id);

		return json({ success: true });
	} catch (error) {
		console.error('Error deleting appointment:', error);

		if (error instanceof Error) {
			if (error.message.includes('not found')) {
				return json({ error: error.message }, { status: 404 });
			}
			if (error.message.includes('Unauthorized')) {
				return json({ error: error.message }, { status: 403 });
			}
			if (error.message.includes('Cannot delete')) {
				return json({ error: error.message }, { status: 400 });
			}
		}

		return json({ error: 'Failed to delete appointment' }, { status: 500 });
	}
};
