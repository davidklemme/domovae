import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('Slideshow Regression Tests', () => {
	describe('Property Detail Page Slideshow', () => {
		it('should have proper slideshow structure', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for essential slideshow elements
			expect(content).toContain('currentImageIndex');
			expect(content).toContain('isImageModalOpen');
			expect(content).toContain('nextImage');
			expect(content).toContain('prevImage');
			expect(content).toContain('openImageModal');
			expect(content).toContain('closeImageModal');
		});

		it('should have image modal functionality', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for modal structure
			expect(content).toContain('{#if isImageModalOpen');
			expect(content).toContain('fixed inset-0 z-50');
			expect(content).toContain('bg-black');
			expect(content).toContain('max-h-[90vh] max-w-[90vw]');
		});

		it('should have navigation buttons with proper event handling', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for navigation buttons with event propagation prevention
			expect(content).toContain('onclick={(e) => {');
			expect(content).toContain('e.stopPropagation();');
			expect(content).toContain('prevImage();');
			expect(content).toContain('nextImage();');
			expect(content).toContain('disabled={currentImageIndex === 0}');
			expect(content).toContain('disabled={currentImageIndex === property.media.length - 1}');
		});

		it('should have keyboard navigation support', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for keyboard event handling
			expect(content).toContain('handleKeydown');
			expect(content).toContain('ArrowLeft');
			expect(content).toContain('ArrowRight');
			expect(content).toContain('Escape');
			expect(content).toContain('addEventListener');
			expect(content).toContain('removeEventListener');
		});

		it('should have browser environment checks', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for browser environment checks to prevent SSR issues
			expect(content).toContain("import { browser } from '$app/environment';");
			expect(content).toContain('browser &&');
		});

		it('should have download protection on images', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for download protection attributes
			expect(content).toContain('draggable="false"');
			expect(content).toContain('oncontextmenu');
			expect(content).toContain('onmousedown');
			expect(content).toContain('onselectstart');
			expect(content).toContain('oncopy');
			expect(content).toContain('oncut');
			expect(content).toContain('onpaste');
			expect(content).toContain('preventDownload');
		});

		it('should have proper image gallery layout', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for gallery structure
			expect(content).toContain('property.media');
			expect(content).toContain('aspect-[16/10]');
			expect(content).toContain('object-cover');
			expect(content).toContain('cursor-pointer');
			expect(content).toContain('hover:scale-105');
		});

		it('should have thumbnail navigation', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for thumbnail functionality
			expect(content).toContain('property.media.length > 7');
			expect(content).toContain('All Photos');
			expect(content).toContain('overflow-x-auto');
			expect(content).toContain('h-20 w-32');
		});

		it('should have proper event propagation handling', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for event propagation prevention
			expect(content).toContain('e.stopPropagation()');
			expect(content).toContain('onclick={closeImageModal}');
		});

		it('should have image counter display', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for photo counter
			expect(content).toContain('{property.media.length} photos');
			expect(content).toContain('bg-black/50');
		});

		it('should have proper conditional rendering for multiple images', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for conditional rendering
			expect(content).toContain('{#if property.media && Array.isArray(property.media)');
			expect(content).toContain('{#if property.media.length === 1}');
			expect(content).toContain('{#if property.media.length > 1}');
			expect(content).toContain('{#if property.media.length > 7}');
		});

		it('should have proper styling for navigation buttons', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for button styling
			expect(content).toContain('bg-white');
			expect(content).toContain('rounded-full');
			expect(content).toContain('shadow-lg');
			expect(content).toContain('hover:bg-white');
			expect(content).toContain('disabled:opacity-50');
		});

		it('should have proper close button functionality', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for close button
			expect(content).toContain('✕');
			expect(content).toContain('closeImageModal');
			expect(content).toContain('top-4 right-4');
		});

		it('should handle edge cases properly', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for edge case handling
			expect(content).toContain('property.media && Array.isArray(property.media)');
			expect(content).toContain('No images available');
			expect(content).toContain('text-8xl');
			expect(content).toContain('🏠');
		});

		it('should have proper accessibility features', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for accessibility
			expect(content).toContain('alt=');
			expect(content).toContain('disabled=');
			expect(content).toContain('cursor-pointer');
		});

		it('should have proper responsive design', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for responsive design classes
			expect(content).toContain('max-h-[90vh]');
			expect(content).toContain('max-w-[90vw]');
			expect(content).toContain('object-contain');
			expect(content).toContain('overflow-hidden');
		});

		it('should have proper state management', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for state management
			expect(content).toContain('let currentImageIndex = 0');
			expect(content).toContain('let isImageModalOpen = false');
			expect(content).toContain('$: if (browser && isImageModalOpen)');
		});

		it('should have proper navigation functions', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for navigation functions with proper validation
			expect(content).toContain('function nextImage()');
			expect(content).toContain('function prevImage()');
			expect(content).toContain('Array.isArray(property.media)');
			expect(content).toContain('property.media.length > 0');
		});

		it('should have proper modal open/close functions', async () => {
			const pagePath = join(process.cwd(), 'src/routes/properties/[id]/+page.svelte');
			const content = await readFile(pagePath, 'utf-8');

			// Check for modal functions
			expect(content).toContain('function openImageModal()');
			expect(content).toContain('function closeImageModal()');
			expect(content).toContain('isImageModalOpen = true');
			expect(content).toContain('isImageModalOpen = false');
		});
	});
});
