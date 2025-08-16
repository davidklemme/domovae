import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BuyerProfileService } from '$lib/server/services/buyer-profile-service';
import type { CreateBuyerProfileData } from '$lib/types/property';

export const GET: RequestHandler = async ({ locals }) => {
	try {
		const session = await locals.getSession();

		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const profile = await BuyerProfileService.getProfile(session.user.id);

		if (!profile) {
			return json({ profile: null });
		}

		return json({ profile });
	} catch (error) {
		console.error('Error fetching buyer profile:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const session = await locals.getSession();

		if (!session?.user?.id) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const formData = await request.formData();

		// Validate required fields
		const equityBand = formData.get('equityBand') as string;
		const timeline = formData.get('timeline') as string;
		const purpose = formData.get('purpose') as string;
		const schufaAvailable = formData.get('schufaAvailable') === 'true';
		const consentGiven = formData.get('consentGiven') === 'true';
		const householdSize = formData.get('householdSize')
			? parseInt(formData.get('householdSize') as string)
			: undefined;
		const financingDoc = formData.get('financingDoc') as File | null;

		if (!equityBand || !timeline || !purpose || !consentGiven) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Validate enum values
		const validEquityBands = ['lt10', 'b10_30', 'b30_50', 'gt50'];
		const validTimelines = ['immediate', 'lt3m', 'lt6m', 'gt6m'];
		const validPurposes = ['eigennutzung', 'kapitalanlage'];

		if (!validEquityBands.includes(equityBand)) {
			return json({ error: 'Invalid equity band' }, { status: 400 });
		}

		if (!validTimelines.includes(timeline)) {
			return json({ error: 'Invalid timeline' }, { status: 400 });
		}

		if (!validPurposes.includes(purpose)) {
			return json({ error: 'Invalid purpose' }, { status: 400 });
		}

		// Validate file if provided
		if (financingDoc && financingDoc.size > 0) {
			const maxSize = 5 * 1024 * 1024; // 5MB
			const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

			if (financingDoc.size > maxSize) {
				return json({ error: 'File size too large. Maximum 5MB allowed.' }, { status: 400 });
			}

			if (!allowedTypes.includes(financingDoc.type)) {
				return json(
					{ error: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' },
					{ status: 400 }
				);
			}
		}

		const profileData: CreateBuyerProfileData = {
			equityBand: equityBand as 'lt10' | 'b10_30' | 'b30_50' | 'gt50',
			timeline: timeline as 'immediate' | 'lt3m' | 'lt6m' | 'gt6m',
			purpose: purpose as 'eigennutzung' | 'kapitalanlage',
			householdSize,
			schufaAvailable,
			financingDoc: financingDoc && financingDoc.size > 0 ? financingDoc : undefined,
			consentGiven
		};

		const profile = await BuyerProfileService.upsertProfile(session.user.id, profileData);

		return json({ profile, message: 'Buyer profile saved successfully' });
	} catch (error) {
		console.error('Error creating/updating buyer profile:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
