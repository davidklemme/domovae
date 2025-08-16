import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPropertyById } from '$lib/server/services/property-service';
import { generateSEOMeta, generateStructuredData } from '$lib/server/services/seo-service';

export const load: PageServerLoad = async ({ params, locals, url }) => {
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

		// Generate SEO data
		const baseUrl = `${url.protocol}//${url.host}`;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const seoMeta = generateSEOMeta(property as any, baseUrl);
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const structuredData = generateStructuredData(property as any, baseUrl);

		return {
			property,
			session,
			seoMeta,
			structuredData
		};
	} catch (err) {
		console.error('Error loading property:', err);
		if (err instanceof Error && err.message.includes('Property not found')) {
			throw error(404, 'Property not found');
		}
		throw error(500, 'Failed to load property');
	}
};
