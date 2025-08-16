import { redirect } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { AvailabilityService } from '$lib/server/services/availability-service';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals, url }) => {
	const session = await locals.getSession();

	if (!session) {
		throw redirect(302, '/auth/signin');
	}

	const propertyId = url.searchParams.get('propertyId');
	const availabilityService = new AvailabilityService();

	// If propertyId is provided, verify the user owns this property
	if (propertyId) {
		const property = await db.query.properties.findFirst({
			where: eq(properties.id, parseInt(propertyId))
		});

		if (!property) {
			throw redirect(302, '/dashboard');
		}

		// Check if user owns this property
		if (property.ownerId !== session.user.id) {
			console.log('Redirecting: User does not own this property');
			throw redirect(302, '/dashboard');
		}

		console.log('User owns this property, proceeding to availability management');
	} else {
		// If no propertyId, check if user has any properties
		const userProperties = await db.query.properties.findMany({
			where: eq(properties.ownerId, session.user.id)
		});

		if (userProperties.length === 0) {
			console.log('Redirecting: User has no properties');
			throw redirect(302, '/dashboard');
		}

		console.log('User has properties, proceeding to availability management');
	}

	// Get user's availability windows
	const availabilityWindows = await availabilityService.getOwnerAvailabilityWindows(
		session.user.id,
		undefined, // startDate - get all for now
		undefined // endDate
	);

	console.log('Successfully loaded availability windows:', availabilityWindows.length);
	console.log('Availability windows data:', availabilityWindows);

	// If propertyId is provided, get property details
	let property = null;
	if (propertyId) {
		property = await db.query.properties.findFirst({
			where: eq(properties.id, parseInt(propertyId)),
			with: {
				location: true,
				media: true
			}
		});

		// Verify the user owns this property
		if (property && property.ownerId !== session.user.id) {
			throw redirect(302, '/dashboard');
		}
	}

	// Get all user's properties for context
	const userProperties = await db.query.properties.findMany({
		where: eq(properties.ownerId, session.user.id),
		with: {
			location: true,
			media: { limit: 1 }
		}
	});

	return {
		availabilityWindows,
		property,
		userProperties,
		user: session.user
	};
};

export const actions: Actions = {
	createWindow: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check if user owns any properties
		const userProperties = await db.query.properties.findMany({
			where: eq(properties.ownerId, session.user.id)
		});

		if (userProperties.length === 0) {
			return { success: false, error: 'You must own properties to manage availability' };
		}

		const formData = await request.formData();
		const date = formData.get('date') as string;
		const startTime = formData.get('startTime') as string;
		const endTime = formData.get('endTime') as string;
		const slotDuration = parseInt(formData.get('slotDuration') as string) || 30;
		const notes = formData.get('notes') as string;
		const timezone = (formData.get('timezone') as string) || 'Europe/Berlin';

		if (!date || !startTime || !endTime) {
			return { success: false, error: 'Missing required fields' };
		}

		try {
			console.log('Creating availability window for user:', session.user.id);
			const availabilityService = new AvailabilityService();
			const windowId = await availabilityService.createAvailabilityWindow(session.user.id, {
				date,
				startTime,
				endTime,
				slotDuration,
				notes,
				timezone
			});

			console.log('Successfully created availability window with ID:', windowId);
			return { success: true, windowId };
		} catch (error) {
			console.error('Error creating availability window:', error);
			return { success: false, error: 'Failed to create availability window' };
		}
	},

	deleteWindow: async ({ request, locals }) => {
		const session = await locals.getSession();
		if (!session) {
			return { success: false, error: 'Unauthorized' };
		}

		// Check if user owns any properties
		const userProperties = await db.query.properties.findMany({
			where: eq(properties.ownerId, session.user.id)
		});

		if (userProperties.length === 0) {
			return { success: false, error: 'You must own properties to manage availability' };
		}

		const formData = await request.formData();
		const windowId = parseInt(formData.get('windowId') as string);

		if (!windowId) {
			return { success: false, error: 'Missing window ID' };
		}

		try {
			const availabilityService = new AvailabilityService();
			const deleted = await availabilityService.deleteAvailabilityWindow(windowId, session.user.id);

			if (!deleted) {
				return { success: false, error: 'Window not found or not authorized' };
			}

			return { success: true };
		} catch (error) {
			console.error('Error deleting availability window:', error);
			return { success: false, error: 'Failed to delete availability window' };
		}
	}
};
