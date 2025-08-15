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
		};
	}

	interface User {
		id: string;
		email: string;
		name?: string;
		image?: string;
		role: 'owner' | 'buyer' | 'admin';
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
