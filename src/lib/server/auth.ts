import { SvelteKitAuth } from '@auth/sveltekit';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import ResendProvider from './email-provider';
import { db } from './db';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		ResendProvider({
			from: env.EMAIL_FROM
		})
	],
	trustHost: env.AUTH_TRUST_HOST === 'true',
	callbacks: {
		async session({ session, token }) {
			if (session.user && token) {
				session.user.id = token.sub || '';
				// Fetch user role from database
				try {
					const { users } = await import('./db/schema');
					const { eq } = await import('drizzle-orm');
					const userRecord = await db.query.users.findFirst({
						where: eq(users.id, token.sub || '')
					});
					session.user.role = (userRecord?.role as 'buyer' | 'owner' | 'admin') || 'buyer';
				} catch (error) {
					console.error('Error fetching user role:', error);
					session.user.role = 'buyer';
				}
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				// Fetch user role from database
				try {
					const { users } = await import('./db/schema');
					const { eq } = await import('drizzle-orm');
					const userRecord = await db.query.users.findFirst({
						where: eq(users.id, user.id)
					});
					token.role = userRecord?.role || 'buyer';
				} catch (error) {
					console.error('Error fetching user role for JWT:', error);
					token.role = 'buyer';
				}
			}
			return token;
		}
	},
	session: {
		strategy: 'jwt'
	},
	pages: {
		signIn: '/auth/signin',
		signOut: '/auth/signout',
		error: '/auth/error',
		verifyRequest: '/auth/verify-request'
	}
});

export const authHandle: Handle = handle;
