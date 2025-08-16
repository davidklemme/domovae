import { describe, it, expect } from 'vitest';
import { readFile } from 'fs/promises';
import { join } from 'path';

describe('PropertyForm Regression Tests', () => {
	describe('Step Navigation', () => {
		it('should have goToStep function defined', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for goToStep function
			expect(content).toContain('function goToStep');
			expect(content).toContain('goToStep(step: number)');
		});

		it('should have step navigation logic', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for step navigation functions
			expect(content).toContain('function nextStep()');
			expect(content).toContain('function prevStep()');
			expect(content).toContain('currentStep++');
			expect(content).toContain('currentStep--');
		});

		it('should have ProgressBar with onStepClick handler', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for ProgressBar usage with onStepClick
			expect(content).toContain('<ProgressBar');
			expect(content).toContain('onStepClick={goToStep}');
		});

		it('should have proper step validation', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for step boundary validation
			expect(content).toContain('step >= 1 && step <= totalSteps');
			expect(content).toContain('currentStep < totalSteps');
			expect(content).toContain('currentStep > 1');
		});
	});

	describe('Form Field Order', () => {
		it('should have basic details before text fields', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check that basic details come first
			expect(content).toContain('for="title"');
			expect(content).toContain('for="price"');
			expect(content).toContain('for="propertyType"');
			expect(content).toContain('for="bedrooms"');
			expect(content).toContain('for="bathrooms"');
			expect(content).toContain('for="yearBuilt"');
		});

		it('should have text/description fields after basic details', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for text/description fields
			expect(content).toContain('for="description"');
			expect(content).toContain('for="locationDescription"');
			expect(content).toContain('for="neighborhoodHighlights"');
			expect(content).toContain('for="propertyHighlights"');
		});

		it('should have proper field order in step 1', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Extract the step 1 section
			const step1Start = content.indexOf('{#if currentStep === 1}');
			const step1End = content.indexOf('{:else if currentStep === 2}');
			const step1Content = content.substring(step1Start, step1End);

			// Check field order: title -> basic details -> text fields
			const titleIndex = step1Content.indexOf('for="title"');
			const priceIndex = step1Content.indexOf('for="price"');
			const yearBuiltIndex = step1Content.indexOf('for="yearBuilt"');
			const descriptionIndex = step1Content.indexOf('for="description"');
			const highlightsIndex = step1Content.indexOf('for="neighborhoodHighlights"');

			// Title should come first
			expect(titleIndex).toBeGreaterThan(-1);

			// Price should come after title
			expect(priceIndex).toBeGreaterThan(titleIndex);

			// Year built should come after price
			expect(yearBuiltIndex).toBeGreaterThan(priceIndex);

			// Description should come after year built
			expect(descriptionIndex).toBeGreaterThan(yearBuiltIndex);

			// Highlights should come after description
			expect(highlightsIndex).toBeGreaterThan(descriptionIndex);
		});

		it('should have all required form fields present', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for all essential fields
			const requiredFields = [
				'title',
				'price',
				'propertyType',
				'description',
				'locationDescription',
				'neighborhoodHighlights',
				'propertyHighlights',
				'bedrooms',
				'bathrooms',
				'livingArea',
				'yearBuilt',
				'street',
				'city',
				'postalCode'
			];

			requiredFields.forEach((field) => {
				expect(content).toContain(`for="${field}"`);
			});
		});
	});

	describe('Form Structure', () => {
		it('should have proper step structure', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for step structure
			expect(content).toContain('{#if currentStep === 1}');
			expect(content).toContain('{:else if currentStep === 2}');
			expect(content).toContain('{:else if currentStep === 3}');
			expect(content).toContain('{:else if currentStep === 4}');
		});

		it('should have navigation buttons', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for navigation buttons
			expect(content).toContain('onclick={prevStep}');
			expect(content).toContain('onclick={nextStep}');
			expect(content).toContain('disabled={currentStep === 1}');
		});

		it('should have proper form submission', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for form submission
			expect(content).toContain('onsubmit={handleSubmit}');
			expect(content).toContain('function handleSubmit');
		});
	});

	describe('ProgressBar Integration', () => {
		it('should import ProgressBar component', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for ProgressBar import
			expect(content).toContain("import ProgressBar from '$lib/components/ProgressBar.svelte';");
		});

		it('should use ProgressBar with correct props', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for ProgressBar usage
			expect(content).toContain('<ProgressBar');
			expect(content).toContain('{currentStep}');
			expect(content).toContain('{totalSteps}');
		});
	});

	describe('Form Data Structure', () => {
		it('should have proper form data initialization', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for form data structure
			expect(content).toContain('let formData = {');
			expect(content).toContain('title: property?.title ||');
			expect(content).toContain('description: property?.description ||');
			expect(content).toContain('price: property?.price ||');
		});

		it('should have proper data binding', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for data binding
			expect(content).toContain('bind:value={formData.title}');
			expect(content).toContain('bind:value={formData.description}');
			expect(content).toContain('bind:value={formData.price}');
		});
	});

	describe('Accessibility', () => {
		it('should have proper labels for all form fields', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for proper label structure
			expect(content).toContain('<label for="');
			expect(content).toContain('class="block text-sm font-medium text-gray-700"');
		});

		it('should have proper input types', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for proper input types
			expect(content).toContain('type="text"');
			expect(content).toContain('type="number"');
			expect(content).toContain('<textarea');
			expect(content).toContain('<select');
		});
	});

	describe('Error Handling', () => {
		it('should have error display', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for error handling
			expect(content).toContain('{#if error}');
			expect(content).toContain('bg-red-50');
		});

		it('should have loading states', async () => {
			const formPath = join(process.cwd(), 'src/lib/components/PropertyForm.svelte');
			const content = await readFile(formPath, 'utf-8');

			// Check for loading states
			expect(content).toContain('disabled={isLoading}');
			expect(content).toContain('{isLoading ?');
		});
	});
});
