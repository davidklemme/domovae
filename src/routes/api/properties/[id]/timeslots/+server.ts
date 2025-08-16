import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AvailabilityService } from '$lib/server/services/availability-service';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const propertyId = parseInt(params.id);
		if (isNaN(propertyId)) {
			return json({ error: 'Invalid property ID' }, { status: 400 });
		}

		const dateParam = url.searchParams.get('date');
		if (!dateParam) {
			return json({ error: 'Date parameter is required' }, { status: 400 });
		}

		const date = new Date(dateParam);
		if (isNaN(date.getTime())) {
			return json({ error: 'Invalid date format' }, { status: 400 });
		}

		// Check if date is in the future
		const now = new Date();
		if (date < now) {
			return json({ error: 'Cannot book appointments in the past' }, { status: 400 });
		}

		// Get property to find the owner
		const property = await db.query.properties.findFirst({
			where: eq(properties.id, propertyId)
		});

		if (!property) {
			return json({ error: 'Property not found' }, { status: 404 });
		}

		// Get available time slots from owner's availability windows
		const availabilityService = new AvailabilityService();
		const availableSlots = await availabilityService.generateTimeSlots(
			property.ownerId,
			dateParam,
			propertyId
		);

		// Filter to only available slots
		const availableTimeSlots = availableSlots.filter((slot) => slot.isAvailable);

		return json({ availableSlots: availableTimeSlots });
	} catch (error) {
		console.error('Error fetching available time slots:', error);
		return json({ error: 'Failed to fetch available time slots' }, { status: 500 });
	}
};
