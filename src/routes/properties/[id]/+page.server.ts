import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPropertyById } from '$lib/server/services/property-service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.getSession();
	const propertyId = params.id;

	if (!propertyId) {
		throw error(400, 'Property ID is required');
	}

	try {
		const property = await getPropertyById(parseInt(propertyId));

		// Check visibility based on authentication
		if (!session?.user) {
			// Non-authenticated users can only see live properties
			if (property.status !== 'live') {
				throw error(404, 'Property not found');
			}
		} else {
			// All authenticated users can see live, published, and in_negotiation properties
			// Plus their own properties regardless of status
			if (
				property.ownerId !== session.user.id &&
				!['live', 'published', 'in_negotiation'].includes(property.status || 'draft')
			) {
				throw error(404, 'Property not found');
			}
		}

		return {
			property,
			session
		};
	} catch (err) {
		console.error('Error loading property:', err);
		if (err instanceof Error && err.message.includes('Property not found')) {
			throw error(404, 'Property not found');
		}
		throw error(500, 'Failed to load property');
	}
};
