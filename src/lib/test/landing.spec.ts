import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('Landing Page', () => {
	it('should have proper HTML structure', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for essential elements
		expect(content).toContain('<svelte:head>');
		expect(content).toContain('<title>Domovae - Find Your Perfect Home</title>');
		expect(content).toContain('name="description"');
		expect(content).toContain('Discover beautiful properties for sale');
	});

	it('should have navigation elements', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for navigation
		expect(content).toContain('<nav');
		expect(content).toContain('Domovae');
		expect(content).toContain('Sign In');
		expect(content).toContain('/auth/signin');
	});

	it('should have hero section', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for hero content
		expect(content).toContain('Find Your Perfect');
		expect(content).toContain('Home');
		expect(content).toContain('Discover beautiful properties for sale');
		expect(content).toContain('Get Started');
		expect(content).toContain('Learn More');
	});

	it('should have features section', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for features
		expect(content).toContain('Features');
		expect(content).toContain('Property Listings');
		expect(content).toContain('Appointment Booking');
		expect(content).toContain('Verified Users');
		expect(content).toContain('Fast & Secure');
	});

	it('should have footer', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for footer
		expect(content).toContain('<footer');
		expect(content).toContain('&copy; 2024 Domovae');
	});

	it('should have authentication redirect logic', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for auth logic
		expect(content).toContain('$page.data.session');
		expect(content).toContain('goto');
		expect(content).toContain('/dashboard');
	});

	it('should use proper styling classes', async () => {
		const landingPagePath = join(process.cwd(), 'src/routes/+page.svelte');
		const content = await readFile(landingPagePath, 'utf-8');

		// Check for Tailwind classes
		expect(content).toContain('min-h-screen');
		expect(content).toContain('bg-gradient-to-br');
		expect(content).toContain('text-indigo-600');
		expect(content).toContain('rounded-md');
	});
});
