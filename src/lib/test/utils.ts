import { expect } from 'vitest';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';

export interface PageInfo {
	path: string;
	requiresAuth: boolean;
	allowedRoles?: string[];
}

/**
 * Recursively discover all Svelte pages in the routes directory
 */
export async function discoverPages(routesDir: string = 'src/routes'): Promise<PageInfo[]> {
	const pages: PageInfo[] = [];

	async function scanDirectory(dir: string, basePath: string = '') {
		try {
			const entries = await readdir(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const statInfo = await stat(fullPath);

				if (statInfo.isDirectory()) {
					// Skip private directories (starting with _)
					if (!entry.startsWith('_')) {
						const newBasePath = basePath ? `${basePath}/${entry}` : entry;
						await scanDirectory(fullPath, newBasePath);
					}
				} else if (entry === '+page.svelte') {
					// Found a page
					const pagePath = basePath || '/';
					const requiresAuth = await checkPageRequiresAuth(fullPath);

					pages.push({
						path: pagePath,
						requiresAuth
					});
				}
			}
		} catch (error) {
			console.warn(`Could not scan directory ${dir}:`, error);
		}
	}

	await scanDirectory(routesDir);
	return pages;
}

/**
 * Check if a page requires authentication by reading its content
 */
async function checkPageRequiresAuth(pagePath: string): Promise<boolean> {
	try {
		const content = await readFile(pagePath, 'utf-8');

		// Check for authentication indicators that indicate protected content
		const authIndicators = [
			'redirect',
			'goto',
			'if ($page.data.session)',
			'if (!$page.data.session)',
			'requiresAuth',
			'protected',
			'private'
		];

		// Check for specific patterns that indicate the page is for authentication
		const authPageIndicators = [
			'signIn(',
			'signOut(',
			'@auth/sveltekit',
			'auth/signin',
			'auth/signout',
			'auth/verify-request',
			'auth/error'
		];

		// If it's an auth page, it doesn't require authentication
		const isAuthPage = authPageIndicators.some((indicator) =>
			content.toLowerCase().includes(indicator.toLowerCase())
		);

		if (isAuthPage) {
			return false;
		}

		// Check for authentication requirements
		return authIndicators.some((indicator) =>
			content.toLowerCase().includes(indicator.toLowerCase())
		);
	} catch (error) {
		console.warn(`Could not read page ${pagePath}:`, error);
		return false;
	}
}

/**
 * Get all API endpoints from the routes directory
 */
export async function discoverApiEndpoints(routesDir: string = 'src/routes'): Promise<string[]> {
	const endpoints: string[] = [];

	async function scanDirectory(dir: string, basePath: string = '') {
		try {
			const entries = await readdir(dir);

			for (const entry of entries) {
				const fullPath = join(dir, entry);
				const statInfo = await stat(fullPath);

				if (statInfo.isDirectory()) {
					if (!entry.startsWith('_')) {
						const newBasePath = basePath ? `${basePath}/${entry}` : entry;
						await scanDirectory(fullPath, newBasePath);
					}
				} else if (entry.endsWith('+server.ts') || entry.endsWith('+page.server.ts')) {
					// Found an API endpoint
					const endpointPath = basePath || '/';
					endpoints.push(endpointPath);
				}
			}
		} catch (error) {
			console.warn(`Could not scan directory ${dir}:`, error);
		}
	}

	await scanDirectory(routesDir);
	return endpoints;
}

/**
 * Test helper to validate authentication requirements
 */
export function validateAuthRequirements(pageInfo: PageInfo) {
	const { path, requiresAuth } = pageInfo;

	// Define public pages that should not require authentication
	const publicPages = ['/', '/auth/signin', '/auth/verify-request', '/auth/error'];

	if (publicPages.includes(path)) {
		expect(requiresAuth).toBe(false);
	} else {
		expect(requiresAuth).toBe(true);
	}
}
