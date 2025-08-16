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

		const startDateParam = url.searchParams.get('startDate');
		const endDateParam = url.searchParams.get('endDate');

		if (!startDateParam || !endDateParam) {
			return json({ error: 'startDate and endDate parameters are required' }, { status: 400 });
		}

		// Validate dates
		const startDate = new Date(startDateParam);
		const endDate = new Date(endDateParam);

		if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
			return json({ error: 'Invalid date format' }, { status: 400 });
		}

		if (startDate > endDate) {
			return json({ error: 'startDate must be before or equal to endDate' }, { status: 400 });
		}

		// Get property to find the owner
		const property = await db.query.properties.findFirst({
			where: eq(properties.id, propertyId)
		});

		if (!property) {
			return json({ error: 'Property not found' }, { status: 404 });
		}

		// Get available dates from owner's availability windows
		const availabilityService = new AvailabilityService();
		const availableDates = await availabilityService.getAvailableDates(
			property.ownerId,
			startDateParam,
			endDateParam
		);

		return json({ availableDates });
	} catch (error) {
		console.error('Error fetching available dates:', error);
		return json({ error: 'Failed to fetch available dates' }, { status: 500 });
	}
};
