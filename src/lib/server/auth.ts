import { SvelteKitAuth } from '@auth/sveltekit';
import Google from '@auth/core/providers/google';
import GitHub from '@auth/core/providers/github';
import Email from '@auth/core/providers/email';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import { db } from './db';
import { env } from '$env/dynamic/private';
import type { Handle } from '@sveltejs/kit';

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: DrizzleAdapter(db),
	providers: [
		Google({
			clientId: env.GOOGLE_CLIENT_ID,
			clientSecret: env.GOOGLE_CLIENT_SECRET
		}),
		GitHub({
			clientId: env.GITHUB_ID,
			clientSecret: env.GITHUB_SECRET
		}),
		Email({
			server: {
				host: env.EMAIL_SERVER_HOST,
				port: env.EMAIL_SERVER_PORT,
				auth: {
					user: env.EMAIL_SERVER_USER,
					pass: env.EMAIL_SERVER_PASSWORD
				}
			},
			from: env.EMAIL_FROM
		})
	],
	callbacks: {
		async session({ session, user }) {
			if (session.user) {
				session.user.id = user.id;
				session.user.role = user.role;
			}
			return session;
		},
		async jwt({ token, user }) {
			if (user) {
				token.role = user.role;
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
