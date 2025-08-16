import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { AppointmentService } from '$lib/server/services/appointment-service';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.getSession();

	if (!session) {
		throw redirect(302, '/auth/signin');
	}

	// Check if user owns any properties
	const userProperties = await db.query.properties.findMany({
		where: eq(properties.ownerId, session.user.id)
	});

	// Get user's appointments (as buyer and owner)
	const buyerAppointments = await AppointmentService.getUserAppointments(session.user.id, 'buyer');
	const ownerAppointments = await AppointmentService.getUserAppointments(session.user.id, 'owner');

	return {
		user: session.user,
		hasProperties: userProperties.length > 0,
		propertyCount: userProperties.length,
		buyerAppointments,
		ownerAppointments
	};
};
