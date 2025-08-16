import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { BuyerProfileService } from '$lib/server/services/buyer-profile-service';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const session = await locals.getSession();

		if (!session?.user?.id) {
			throw error(401, 'Unauthorized');
		}

		const { filename } = params;

		// Extract user ID from filename for validation
		const userIdMatch = filename?.match(/financing_([^_]+)_/);
		if (!userIdMatch || userIdMatch[1] !== session.user.id) {
			throw error(403, 'Access denied');
		}

		// Verify user has a profile with this document
		const profile = await BuyerProfileService.getProfile(session.user.id);
		if (!profile || !profile.financingDocUrl) {
			throw error(404, 'Document not found');
		}

		// TODO: Implement secure file serving from private storage
		// For now, return a placeholder response
		// In production, this should:
		// 1. Generate a signed, time-limited URL
		// 2. Serve the file from private storage
		// 3. Log the access for audit purposes

		throw error(501, 'File serving not yet implemented');
	} catch (err: unknown) {
		if (err && typeof err === 'object' && 'status' in err) {
			throw err;
		}
		console.error('Error serving financing document:', err);
		throw error(500, 'Internal server error');
	}
};
