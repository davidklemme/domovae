// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module '@auth/core/types' {
	interface Session {
		user: {
			id: string;
			email: string;
			name?: string;
			image?: string;
			role: 'owner' | 'buyer' | 'admin';
			phone?: string;
			dateOfBirth?: string;
			address?: string;
			city?: string;
			postalCode?: string;
			country?: string;
		};
	}

	interface User {
		id: string;
		email: string;
		name?: string;
		image?: string;
		role: 'owner' | 'buyer' | 'admin';
		phone?: string;
		dateOfBirth?: string;
		address?: string;
		city?: string;
		postalCode?: string;
		country?: string;
	}
}

declare global {
	namespace App {
		interface Locals {
			getSession(): Promise<import('@auth/core/types').Session | null>;
		}
		interface PageData {
			session: import('@auth/core/types').Session | null;
		}
	}
}

export {};
