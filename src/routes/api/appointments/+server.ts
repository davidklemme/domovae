import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AppointmentService } from '$lib/server/services/appointment-service';

export const GET: RequestHandler = async ({ url, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const role = (url.searchParams.get('role') as 'buyer' | 'owner') || 'buyer';
		const appointments = await AppointmentService.getUserAppointments(session.user.id, role);

		return json({ appointments });
	} catch (error) {
		console.error('Error fetching appointments:', error);
		return json({ error: 'Failed to fetch appointments' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = await locals.getSession();
		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { propertyId, scheduledAt, duration = 60, type = 'viewing', notes } = body;

		// Validate required fields
		if (!propertyId || !scheduledAt) {
			return json({ error: 'Property ID and scheduled date are required' }, { status: 400 });
		}

		// Get property to find owner
		const { db } = await import('$lib/server/db');
		const { properties } = await import('$lib/server/db/schema');
		const { eq } = await import('drizzle-orm');

		const property = await db.query.properties.findFirst({
			where: eq(properties.id, propertyId),
			with: {
				owner: true
			}
		});

		if (!property) {
			return json({ error: 'Property not found' }, { status: 404 });
		}

		// Create appointment
		const appointment = await AppointmentService.createAppointment({
			propertyId,
			buyerId: session.user.id,
			ownerId: property.ownerId,
			scheduledAt: new Date(scheduledAt),
			duration,
			type,
			notes
		});

		return json({ appointment }, { status: 201 });
	} catch (error) {
		console.error('Error creating appointment:', error);

		if (error instanceof Error) {
			if (error.message.includes('not found') || error.message.includes('mismatch')) {
				return json({ error: error.message }, { status: 404 });
			}
			if (error.message.includes('not available')) {
				return json({ error: error.message }, { status: 409 });
			}
		}

		return json({ error: 'Failed to create appointment' }, { status: 500 });
	}
};
