import type { PageServerLoad } from './$types';
import { getAllProperties } from '$lib/server/services/property-service';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	try {
		const properties = await getAllProperties(session || undefined);
		return {
			properties,
			session
		};
	} catch (err) {
		console.error('Error loading properties for dashboard:', err);
		return {
			properties: [],
			session
		};
	}
};
