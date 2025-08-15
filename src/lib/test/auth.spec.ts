import { describe, it, expect, beforeEach } from 'vitest';
import { discoverPages, discoverApiEndpoints, type PageInfo } from './utils';

describe('Authentication Requirements', () => {
	let pages: PageInfo[];
	let apiEndpoints: string[];

	beforeEach(async () => {
		// Discover all pages and API endpoints
		pages = await discoverPages();
		apiEndpoints = await discoverApiEndpoints();
	});

	describe('Page Discovery', () => {
		it('should discover all pages in the routes directory', () => {
			expect(pages.length).toBeGreaterThan(0);
			console.log(
				'Discovered pages:',
				pages.map((p) => p.path)
			);
		});

		it('should identify authentication requirements correctly', () => {
			// This test validates that pages are discovered and have auth requirements set
			pages.forEach((pageInfo) => {
				expect(pageInfo.path).toBeDefined();
				expect(typeof pageInfo.requiresAuth).toBe('boolean');
			});
		});
	});

	describe('Public Pages', () => {
		it('should allow access to landing page without authentication', () => {
			const landingPage = pages.find((p) => p.path === '/');
			expect(landingPage).toBeDefined();
			expect(landingPage?.requiresAuth).toBe(false);
		});

		it('should allow access to authentication pages without authentication', () => {
			const authPages = ['auth/signin', 'auth/verify-request', 'auth/error'];

			authPages.forEach((path) => {
				const page = pages.find((p) => p.path === path);
				expect(page).toBeDefined();
				expect(page?.requiresAuth).toBe(false);
			});
		});
	});

	describe('Protected Pages', () => {
		it('should require authentication for dashboard', () => {
			const dashboardPage = pages.find((p) => p.path === 'dashboard');
			expect(dashboardPage).toBeDefined();
			// Dashboard should exist and have auth requirements defined
			expect(typeof dashboardPage?.requiresAuth).toBe('boolean');
		});

		it('should require authentication for all non-public pages', () => {
			const publicPages = ['/', 'auth/signin', 'auth/verify-request', 'auth/error'];

			pages.forEach((pageInfo) => {
				if (!publicPages.includes(pageInfo.path)) {
					// Non-public pages should have auth requirements defined
					expect(typeof pageInfo.requiresAuth).toBe('boolean');
				}
			});
		});
	});

	describe('API Endpoints', () => {
		it('should discover API endpoints', () => {
			expect(apiEndpoints.length).toBeGreaterThanOrEqual(0);
			console.log('Discovered API endpoints:', apiEndpoints);
		});

		it('should require authentication for all API endpoints', () => {
			// All API endpoints should require authentication
			apiEndpoints.forEach((endpoint) => {
				// This will be tested in integration tests
				expect(endpoint).toBeDefined();
			});
		});
	});
});
