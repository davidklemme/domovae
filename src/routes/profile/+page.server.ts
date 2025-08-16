import type { PageServerLoad, Actions } from './$types';
import { redirect, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { properties, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { AppointmentService } from '$lib/server/services/appointment-service';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session) {
		throw redirect(302, '/auth/signin');
	}

	// Fetch the actual user data from the database
	const userData = await db.query.users.findFirst({
		where: eq(users.id, session.user.id)
	});

	console.log('Database user data:', userData);
	console.log('Session user data:', session.user);
	console.log('User ID:', session.user.id);

	// Check if user owns any properties
	const userProperties = await db.query.properties.findMany({
		where: eq(properties.ownerId, session.user.id)
	});

	// Get user's appointments (as buyer and owner)
	const buyerAppointments = await AppointmentService.getUserAppointments(session.user.id, 'buyer');
	const ownerAppointments = await AppointmentService.getUserAppointments(session.user.id, 'owner');

	return {
		user: {
			...session.user,
			// Use database values for profile fields, convert null to empty string
			name: userData?.name || '',
			phone: userData?.phone || '',
			dateOfBirth: userData?.dateOfBirth || '',
			address: userData?.address || '',
			city: userData?.city || '',
			postalCode: userData?.postalCode || '',
			country: userData?.country || 'Germany'
		},
		hasProperties: userProperties.length > 0,
		propertyCount: userProperties.length,
		buyerAppointments,
		ownerAppointments
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const session = await locals.getSession();

		if (!session?.user?.id) {
			return fail(401, { error: 'Unauthorized' });
		}

		const formData = await request.formData();

		try {
			await db
				.update(users)
				.set({
					name: (formData.get('name') as string) || null,
					phone: (formData.get('phone') as string) || null,
					dateOfBirth: (formData.get('dateOfBirth') as string) || null,
					address: (formData.get('address') as string) || null,
					city: (formData.get('city') as string) || null,
					postalCode: (formData.get('postalCode') as string) || null,
					country: (formData.get('country') as string) || 'Germany',
					updatedAt: new Date()
				})
				.where(eq(users.id, session.user.id));

			// Return the actual submitted values to ensure form consistency
			const submittedData = {
				name: (formData.get('name') as string) || '',
				phone: (formData.get('phone') as string) || '',
				dateOfBirth: (formData.get('dateOfBirth') as string) || '',
				address: (formData.get('address') as string) || '',
				city: (formData.get('city') as string) || '',
				postalCode: (formData.get('postalCode') as string) || '',
				country: (formData.get('country') as string) || 'Germany'
			};

			return {
				success: true,
				user: submittedData
			};
		} catch (error) {
			console.error('Error updating profile:', error);
			return fail(500, { error: 'Failed to update profile' });
		}
	}
};
