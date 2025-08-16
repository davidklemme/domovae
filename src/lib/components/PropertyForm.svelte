<script lang="ts">
	import { goto } from '$app/navigation';
	import ProgressBar from '$lib/components/ProgressBar.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let property: any = null; // For editing, null for creating
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let onSubmit: (data: any) => Promise<void>;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let onSaveDraft: (data: any) => Promise<void>;
	export let isLoading = false;
	export let error = '';

	let currentStep = 1;
	let totalSteps = 4;

	// Form data
	let formData = {
		// Basic Information
		title: property?.title || '',
		description: property?.description || '',
		locationDescription: property?.locationDescription || '',
		neighborhoodHighlights: property?.neighborhoodHighlights || '',
		propertyHighlights: property?.propertyHighlights || '',
		price: property?.price || '',
		propertyType: property?.propertyType || '',
		propertySubtype: property?.propertySubtype || '',
		bedrooms: property?.bedrooms || '',
		bathrooms: property?.bathrooms || '',
		livingArea: property?.livingArea || '',
		totalArea: property?.totalArea || '',
		yearBuilt: property?.yearBuilt || '',

		// Location
		street: property?.location?.street || '',
		houseNumber: property?.location?.houseNumber || '',
		city: property?.location?.city || '',
		postalCode: property?.location?.postalCode || '',
		state: property?.location?.state || '',
		neighborhood: property?.location?.neighborhood || '',
		district: property?.location?.district || ''
	};

	function nextStep() {
		if (currentStep < totalSteps) {
			currentStep++;
		}
	}

	function prevStep() {
		if (currentStep > 1) {
			currentStep--;
		}
	}

	async function handleSubmit(event: Event) {
		event.preventDefault();

		console.log('Form submitted!');
		console.log('Form data:', formData);

		// Map form data to match service expectations
		const requestData = {
			title: formData.title,
			description: formData.description,
			locationDescription: formData.locationDescription,
			neighborhoodHighlights: formData.neighborhoodHighlights,
			propertyHighlights: formData.propertyHighlights,
			price: formData.price,
			propertyType: formData.propertyType,
			status: 'published',
			bedrooms: formData.bedrooms,
			bathrooms: formData.bathrooms,
			livingArea: formData.livingArea,
			yearBuilt: formData.yearBuilt,
			// Location data - flattened to match service expectations
			street: formData.street,
			city: formData.city,
			postalCode: formData.postalCode,
			country: 'Germany' // Default for now
		};

		console.log('Request data:', requestData);
		console.log('Calling onSubmit...');

		await onSubmit(requestData);
	}

	async function handleSaveDraft() {
		// Map form data to match service expectations
		const requestData = {
			title: formData.title,
			description: formData.description,
			locationDescription: formData.locationDescription,
			neighborhoodHighlights: formData.neighborhoodHighlights,
			propertyHighlights: formData.propertyHighlights,
			price: formData.price,
			propertyType: formData.propertyType,
			status: 'draft',
			bedrooms: formData.bedrooms,
			bathrooms: formData.bathrooms,
			livingArea: formData.livingArea,
			yearBuilt: formData.yearBuilt,
			// Location data - flattened to match service expectations
			street: formData.street,
			city: formData.city,
			postalCode: formData.postalCode,
			country: 'Germany' // Default for now
		};

		await onSaveDraft(requestData);
	}
</script>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">
						{property ? 'Edit Property' : 'Create New Property'}
					</h1>
					<p class="mt-2 text-gray-600">
						{property ? 'Update your property details' : 'Add a new property to your portfolio'}
					</p>
				</div>
				<button
					onclick={() => goto('/properties')}
					class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
				>
					Back to Properties
				</button>
			</div>
		</div>

		<!-- Progress Bar -->
		<ProgressBar {currentStep} {totalSteps} />

		<!-- Error Message -->
		{#if error}
			<div class="mb-6 rounded-md bg-red-50 p-4">
				<div class="flex">
					<div class="flex-shrink-0">
						<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
							<path
								fill-rule="evenodd"
								d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
								clip-rule="evenodd"
							/>
						</svg>
					</div>
					<div class="ml-3">
						<h3 class="text-sm font-medium text-red-800">Error</h3>
						<div class="mt-2 text-sm text-red-700">{error}</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-8">
			{#if currentStep === 1}
				<!-- Step 1: Basic Property Information -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-6 text-xl font-semibold text-gray-900">Basic Property Information</h2>
					<div class="grid gap-6 sm:grid-cols-2">
						<div class="sm:col-span-2">
							<label for="title" class="block text-sm font-medium text-gray-700"
								>Property Title</label
							>
							<input
								type="text"
								id="title"
								bind:value={formData.title}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Beautiful 3-bedroom apartment in city center"
							/>
						</div>

						<div class="sm:col-span-2">
							<label for="description" class="block text-sm font-medium text-gray-700"
								>Description</label
							>
							<textarea
								id="description"
								bind:value={formData.description}
								rows="6"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="# About This Property

This **stunning property** offers the perfect blend of modern comfort and timeless elegance.

## Key Features
- Modern kitchen with island
- Balcony with city views  
- Built-in wardrobes
- Underfloor heating

Located in a highly sought-after neighborhood, this home provides an exceptional living experience."
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								💡 You can use <strong>Markdown</strong> formatting: **bold**, *italic*, # headings,
								- lists, etc.
							</p>
						</div>

						<div class="sm:col-span-2">
							<label for="locationDescription" class="block text-sm font-medium text-gray-700"
								>Location Description</label
							>
							<textarea
								id="locationDescription"
								bind:value={formData.locationDescription}
								rows="4"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="## Perfect Location

Nestled in the heart of the city, this property enjoys an **enviable location** that combines urban convenience with residential tranquility.

### Nearby Amenities
- **Schools**: Top-rated schools within walking distance
- **Transportation**: Metro station 5 min walk
- **Shopping**: Modern shopping center 10 min away
- **Parks**: Beautiful green spaces nearby"
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								💡 Use markdown to highlight key location features and amenities.
							</p>
						</div>

						<div class="sm:col-span-2">
							<label for="neighborhoodHighlights" class="block text-sm font-medium text-gray-700"
								>Neighborhood Highlights (one per line)</label
							>
							<textarea
								id="neighborhoodHighlights"
								bind:value={formData.neighborhoodHighlights}
								rows="4"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="🚇 5 min walk to metro station&#10;🏫 Excellent schools nearby&#10;🛒 Shopping center 10 min away&#10;🌳 Beautiful parks in the area&#10;🍽️ Trendy restaurants & cafes"
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								Add one highlight per line. You can use emojis to make it more engaging!
							</p>
						</div>

						<div class="sm:col-span-2">
							<label for="propertyHighlights" class="block text-sm font-medium text-gray-700"
								>Property Features (one per line)</label
							>
							<textarea
								id="propertyHighlights"
								bind:value={formData.propertyHighlights}
								rows="4"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Modern kitchen with island&#10;Balcony with city views&#10;Built-in wardrobes&#10;Underfloor heating&#10;Smart home features&#10;Private parking space"
							></textarea>
							<p class="mt-1 text-sm text-gray-500">
								List the key features that make this property special. One feature per line.
							</p>
						</div>

						<div>
							<label for="price" class="block text-sm font-medium text-gray-700">Price (€)</label>
							<input
								type="number"
								id="price"
								bind:value={formData.price}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="500000"
							/>
						</div>

						<div>
							<label for="propertyType" class="block text-sm font-medium text-gray-700"
								>Property Type</label
							>
							<select
								id="propertyType"
								bind:value={formData.propertyType}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							>
								<option value="">Select type</option>
								<option value="house">House</option>
								<option value="apartment">Apartment</option>
								<option value="condo">Condominium</option>
								<option value="townhouse">Townhouse</option>
								<option value="villa">Villa</option>
							</select>
						</div>

						<div>
							<label for="propertySubtype" class="block text-sm font-medium text-gray-700"
								>Property Subtype</label
							>
							<select
								id="propertySubtype"
								bind:value={formData.propertySubtype}
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
							>
								<option value="">Select subtype</option>
								<option value="detached">Detached</option>
								<option value="semi-detached">Semi-detached</option>
								<option value="terraced">Terraced</option>
								<option value="penthouse">Penthouse</option>
								<option value="studio">Studio</option>
								<option value="loft">Loft</option>
							</select>
						</div>

						<div>
							<label for="bedrooms" class="block text-sm font-medium text-gray-700">Bedrooms</label>
							<input
								type="number"
								id="bedrooms"
								bind:value={formData.bedrooms}
								min="0"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="3"
							/>
						</div>

						<div>
							<label for="bathrooms" class="block text-sm font-medium text-gray-700"
								>Bathrooms</label
							>
							<input
								type="number"
								id="bathrooms"
								bind:value={formData.bathrooms}
								min="0"
								step="0.5"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="2"
							/>
						</div>

						<div>
							<label for="livingArea" class="block text-sm font-medium text-gray-700"
								>Living Area (m²)</label
							>
							<input
								type="number"
								id="livingArea"
								bind:value={formData.livingArea}
								min="0"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="120"
							/>
						</div>

						<div>
							<label for="totalArea" class="block text-sm font-medium text-gray-700"
								>Total Area (m²)</label
							>
							<input
								type="number"
								id="totalArea"
								bind:value={formData.totalArea}
								min="0"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="150"
							/>
						</div>

						<div>
							<label for="yearBuilt" class="block text-sm font-medium text-gray-700"
								>Year Built</label
							>
							<input
								type="number"
								id="yearBuilt"
								bind:value={formData.yearBuilt}
								min="1800"
								max="2030"
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="2020"
							/>
						</div>
					</div>
				</div>
			{:else if currentStep === 2}
				<!-- Step 2: Location -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-6 text-xl font-semibold text-gray-900">Location Details</h2>
					<div class="grid gap-6 sm:grid-cols-2">
						<div>
							<label for="street" class="block text-sm font-medium text-gray-700">Street</label>
							<input
								type="text"
								id="street"
								bind:value={formData.street}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Musterstraße"
							/>
						</div>

						<div>
							<label for="houseNumber" class="block text-sm font-medium text-gray-700"
								>House Number</label
							>
							<input
								type="text"
								id="houseNumber"
								bind:value={formData.houseNumber}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="123"
							/>
						</div>

						<div>
							<label for="city" class="block text-sm font-medium text-gray-700">City</label>
							<input
								type="text"
								id="city"
								bind:value={formData.city}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Berlin"
							/>
						</div>

						<div>
							<label for="postalCode" class="block text-sm font-medium text-gray-700"
								>Postal Code</label
							>
							<input
								type="text"
								id="postalCode"
								bind:value={formData.postalCode}
								required
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="10115"
							/>
						</div>

						<div>
							<label for="state" class="block text-sm font-medium text-gray-700">State</label>
							<input
								type="text"
								id="state"
								bind:value={formData.state}
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Berlin"
							/>
						</div>

						<div>
							<label for="neighborhood" class="block text-sm font-medium text-gray-700"
								>Neighborhood</label
							>
							<input
								type="text"
								id="neighborhood"
								bind:value={formData.neighborhood}
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Mitte"
							/>
						</div>

						<div>
							<label for="district" class="block text-sm font-medium text-gray-700">District</label>
							<input
								type="text"
								id="district"
								bind:value={formData.district}
								class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								placeholder="Mitte"
							/>
						</div>
					</div>
				</div>
			{:else if currentStep === 3}
				<!-- Step 3: Media -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-6 text-xl font-semibold text-gray-900">Property Photos</h2>
					<div class="space-y-4">
						<div class="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center">
							<svg
								class="mx-auto h-12 w-12 text-gray-400"
								stroke="currentColor"
								fill="none"
								viewBox="0 0 48 48"
							>
								<path
									d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
									stroke-width="2"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
							</svg>
							<div class="mt-4">
								<p class="text-sm text-gray-600">Photo upload coming soon</p>
								<p class="mt-2 text-xs text-gray-500">
									You can add photos after creating the property
								</p>
							</div>
						</div>
					</div>
				</div>
			{:else if currentStep === 4}
				<!-- Step 4: Review -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-6 text-xl font-semibold text-gray-900">Review & Publish</h2>
					<div class="space-y-6">
						<div>
							<h3 class="text-lg font-medium text-gray-900">Property Summary</h3>
							<div class="mt-2 rounded-lg bg-gray-50 p-4">
								<p class="text-sm text-gray-600">
									<strong>Title:</strong>
									{formData.title || 'Not provided'}
								</p>
								<p class="text-sm text-gray-600">
									<strong>Type:</strong>
									{formData.propertyType || 'Not provided'}
								</p>
								<p class="text-sm text-gray-600">
									<strong>Price:</strong> €{formData.price || 'Not provided'}
								</p>
								<p class="text-sm text-gray-600">
									<strong>Location:</strong>
									{formData.street}
									{formData.houseNumber}, {formData.city}
								</p>
							</div>
						</div>

						<div class="flex items-center justify-center">
							<div class="text-center">
								<p class="text-sm text-gray-600">
									Ready to {property ? 'update' : 'publish'} your property?
								</p>
								<p class="mt-1 text-xs text-gray-500">
									You can always edit it later from your dashboard.
								</p>
							</div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Navigation Buttons -->
			<div class="flex justify-between">
				<button
					type="button"
					onclick={prevStep}
					disabled={currentStep === 1}
					class="rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Previous
				</button>

				<div class="flex space-x-3">
					{#if currentStep < totalSteps}
						<button
							type="button"
							onclick={nextStep}
							class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
						>
							Next
						</button>
					{:else}
						<button
							type="button"
							onclick={handleSaveDraft}
							disabled={isLoading}
							class="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-700 disabled:opacity-50"
						>
							{isLoading ? 'Saving...' : 'Save Draft'}
						</button>
						<button
							type="submit"
							disabled={isLoading}
							class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
						>
							{isLoading ? 'Publishing...' : property ? 'Update Property' : 'Publish Property'}
						</button>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>
