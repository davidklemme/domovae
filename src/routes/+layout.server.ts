import { getSession } from '@auth/sveltekit/server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	return {
		session: await locals.getSession()
	};
};
