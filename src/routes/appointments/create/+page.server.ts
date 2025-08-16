import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url, locals }) => {
	const session = await locals.getSession();
	if (!session?.user?.id) {
		throw redirect(302, '/auth/signin');
	}

	const propertyId = url.searchParams.get('propertyId');
	if (!propertyId) {
		throw redirect(302, '/dashboard');
	}

	const property = await db.query.properties.findFirst({
		where: eq(properties.id, parseInt(propertyId)),
		with: {
			location: true,
			owner: true
		}
	});

	if (!property) {
		throw redirect(302, '/dashboard');
	}

	// Check if user is trying to book their own property
	if (property.ownerId === session.user.id) {
		throw redirect(302, `/properties/${property.id}`);
	}

	return {
		property,
		user: session.user
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		console.log('Appointment creation action called');
		const session = await locals.getSession();
		if (!session?.user?.id) {
			console.log('No session found');
			return { success: false, error: 'Unauthorized' };
		}

		const formData = await request.formData();
		const propertyId = formData.get('propertyId') as string;
		const scheduledAt = formData.get('scheduledAt') as string;
		const duration = formData.get('duration') as string;
		const type = formData.get('type') as string;
		const notes = formData.get('notes') as string;

		console.log('Form data received:', { propertyId, scheduledAt, duration, type, notes });

		if (!propertyId || !scheduledAt) {
			console.log('Missing required fields:', { propertyId, scheduledAt });
			return { success: false, error: 'Property ID and scheduled date are required' };
		}

		try {
			console.log('Creating appointment with data:', {
				propertyId,
				scheduledAt,
				duration,
				type,
				notes
			});
			const { AppointmentService } = await import('$lib/server/services/appointment-service');

			// Get property to find owner
			const property = await db.query.properties.findFirst({
				where: eq(properties.id, parseInt(propertyId)),
				with: {
					owner: true
				}
			});

			if (!property) {
				return { success: false, error: 'Property not found' };
			}

			// Create appointment
			const appointment = await AppointmentService.createAppointment({
				propertyId: parseInt(propertyId),
				buyerId: session.user.id,
				ownerId: property.ownerId,
				scheduledAt: new Date(scheduledAt),
				duration: duration ? parseInt(duration) : 60,
				type: (type as 'viewing' | 'consultation' | 'negotiation') || 'viewing',
				notes: notes || undefined
			});

			console.log('Appointment created successfully:', appointment);
			return { success: true, appointment };
		} catch (error) {
			console.error('Error creating appointment:', error);
			const errorMessage = error instanceof Error ? error.message : 'Failed to create appointment';
			console.log('Returning error response:', { success: false, error: errorMessage });
			return {
				success: false,
				error: errorMessage
			};
		}
	}
};
