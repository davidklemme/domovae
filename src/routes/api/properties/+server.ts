import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createProperty } from '$lib/server/services/property-service';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	try {
		const body = await request.json();
		if (!session) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
		const newProperty = await createProperty(body, session);
		return json({ property: newProperty }, { status: 201 });
	} catch (err) {
		console.error('Error creating property:', err);
		const errorMessage = err instanceof Error ? err.message : 'Failed to create property';

		if (errorMessage.includes('Unauthorized')) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		} else if (errorMessage.includes('Forbidden')) {
			return json({ error: errorMessage }, { status: 403 });
		} else if (errorMessage.includes('required') || errorMessage.includes('valid')) {
			return json({ error: errorMessage }, { status: 400 });
		} else {
			return json({ error: 'Failed to create property' }, { status: 500 });
		}
	}
};
