import { error, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { createProperty } from '$lib/server/services/property-service';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		throw error(401, 'Unauthorized');
	}

	return {
		session
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const session = await locals.getSession();

		if (!session?.user) {
			return fail(401, { error: 'Unauthorized' });
		}

		try {
			const formData = await request.formData();

			// Convert FormData to object
			const propertyData = {
				title: formData.get('title') as string,
				description: formData.get('description') as string,
				price: parseInt(formData.get('price') as string),
				propertyType: formData.get('propertyType') as string,
				status: (formData.get('status') as string) || 'draft',
				bedrooms: formData.get('bedrooms')
					? parseInt(formData.get('bedrooms') as string)
					: undefined,
				bathrooms: formData.get('bathrooms')
					? parseInt(formData.get('bathrooms') as string)
					: undefined,
				livingArea: formData.get('squareMeters')
					? parseInt(formData.get('squareMeters') as string)
					: undefined,
				yearBuilt: formData.get('yearBuilt')
					? parseInt(formData.get('yearBuilt') as string)
					: undefined,
				street: formData.get('address') as string,
				city: formData.get('city') as string,
				postalCode: formData.get('postalCode') as string,
				country: (formData.get('country') as string) || 'Germany',
				latitude: formData.get('latitude') as string,
				longitude: formData.get('longitude') as string
			};

			const newProperty = await createProperty(propertyData, session);

			return {
				success: true,
				property: newProperty
			};
		} catch (err) {
			console.error('Error creating property:', err);
			const errorMessage = err instanceof Error ? err.message : 'Failed to create property';
			return fail(400, { error: errorMessage });
		}
	}
};
