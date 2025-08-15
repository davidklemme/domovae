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
	callbacks: {
		async session({ session, token }) {
			if (session.user && token) {
				session.user.id = token.sub || '';
				// Default role - will be enhanced when we implement role management
				session.user.role = (token.role as 'buyer' | 'owner' | 'admin') || 'buyer';
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.id = user.id;
				// Default role - will be enhanced when we implement role management
				token.role = 'buyer';
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
