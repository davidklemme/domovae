import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPropertyById } from '$lib/server/services/property-service';

export const load: PageServerLoad = async ({ params, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}

	const propertyId = params.id;

	if (!propertyId) {
		throw error(400, 'Property ID is required');
	}

	try {
		const property = await getPropertyById(parseInt(propertyId));

		// Check if user owns this property or is admin
		if (property.ownerId !== session.user.id && session.user.role !== 'admin') {
			throw error(403, 'Forbidden: You can only edit your own properties');
		}

		return {
			property
		};
	} catch (err) {
		console.error('Error loading property for edit:', err);
		throw error(500, 'Failed to load property');
	}
};
