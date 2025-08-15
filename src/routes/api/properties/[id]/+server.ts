import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateProperty, archiveProperty } from '$lib/server/services/property-service';

export const PUT: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;

	if (!propertyId) {
		return json({ error: 'Property ID is required' }, { status: 400 });
	}

	try {
		const body = await request.json();
		const updatedProperty = await updateProperty(parseInt(propertyId), body, session);
		return json({ property: updatedProperty });
	} catch (err) {
		console.error('Error updating property:', err);
		const errorMessage = err instanceof Error ? err.message : 'Failed to update property';

		if (errorMessage.includes('Unauthorized')) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		} else if (errorMessage.includes('Forbidden')) {
			return json({ error: errorMessage }, { status: 403 });
		} else if (errorMessage.includes('not found')) {
			return json({ error: errorMessage }, { status: 404 });
		} else if (errorMessage.includes('required') || errorMessage.includes('valid')) {
			return json({ error: errorMessage }, { status: 400 });
		} else {
			return json({ error: 'Failed to update property' }, { status: 500 });
		}
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	const session = await locals.getSession();

	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;

	if (!propertyId) {
		return json({ error: 'Property ID is required' }, { status: 400 });
	}

	try {
		const result = await archiveProperty(parseInt(propertyId), session);
		return json(result);
	} catch (err) {
		console.error('Error archiving property:', err);
		const errorMessage = err instanceof Error ? err.message : 'Failed to archive property';

		if (errorMessage.includes('Unauthorized')) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		} else if (errorMessage.includes('Forbidden')) {
			return json({ error: errorMessage }, { status: 403 });
		} else if (errorMessage.includes('not found')) {
			return json({ error: errorMessage }, { status: 404 });
		} else {
			return json({ error: 'Failed to archive property' }, { status: 500 });
		}
	}
};
