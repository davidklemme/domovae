<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import MediaUpload from '$lib/components/MediaUpload.svelte';

	export let data: PageData;

	let currentStep = 1;
	let totalSteps = 4;
	let property = data.property;
	let loading = false;
	let error = '';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let uploadedMedia: any[] = property?.media || [];

	// Form data
	let formData = {
		title: property?.title || '',
		description: property?.description || '',
		price: property?.price || 0,
		propertyType: property?.propertyType || 'apartment',
		status: property?.status || 'draft',
		address: property?.location?.street || '',
		city: property?.location?.city || '',
		postalCode: property?.location?.postalCode || '',
		country: property?.location?.country || 'Germany',
		latitude: property?.location?.latitude || 0,
		longitude: property?.location?.longitude || 0,
		bedrooms: property?.bedrooms || 0,
		bathrooms: property?.bathrooms || 0,
		squareMeters: property?.livingArea || 0,
		yearBuilt: property?.yearBuilt || 0
	};

	async function handleSubmit(event: Event) {
		event.preventDefault();
		loading = true;
		error = '';

		try {
			const response = await fetch(`/api/properties/${property.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(formData)
			});

			if (response.ok) {
				goto(`/properties/${property.id}`);
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to update property';
			}
		} catch {
			error = 'An error occurred while updating the property';
		} finally {
			loading = false;
		}
	}

	async function saveDraft() {
		loading = true;
		error = '';

		try {
			console.log('Saving draft with data:', formData);
			const response = await fetch(`/api/properties/${property.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ ...formData, status: 'draft' })
			});

			console.log('Draft save response status:', response.status);
			if (response.ok) {
				const result = await response.json();
				console.log('Draft saved successfully:', result);
				// Show success message but stay on the page
				error = ''; // Clear any previous errors
				// You could add a success message here if needed
			} else {
				const errorData = await response.json();
				console.error('Draft save failed:', errorData);
				error = errorData.error || errorData.message || 'Failed to save draft';
			}
		} catch (err) {
			console.error('Error saving draft:', err);
			error = 'An error occurred while saving the draft';
		} finally {
			loading = false;
		}
	}

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

	function handleMediaUploaded(event: CustomEvent) {
		const { media } = event.detail;
		uploadedMedia = [...uploadedMedia, ...media];
	}

	function handleMediaDeleted(event: CustomEvent) {
		const { mediaId } = event.detail;
		uploadedMedia = uploadedMedia.filter((media) => media.id !== mediaId);
	}
</script>

<svelte:head>
	<title>Edit Property - Domovae</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
		<!-- Header -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Edit Property</h1>
					<p class="mt-2 text-gray-600">Update your property details</p>
				</div>
				<button
					onclick={() => goto(`/properties/${property.id}`)}
					class="px-4 py-2 text-gray-600 hover:text-gray-900"
				>
					← Back to Property
				</button>
			</div>
		</div>

		<!-- Progress Bar -->
		<div class="mb-8">
			<div class="flex items-center justify-between">
				{#each Array(totalSteps) as _unused, i (i)}
					<div class="flex items-center">
						<div
							class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {i +
								1 <=
							currentStep
								? 'bg-blue-600 text-white'
								: 'bg-gray-200 text-gray-600'}"
						>
							{i + 1}
						</div>
						{#if i < totalSteps - 1}
							<div
								class="mx-2 h-1 w-16 {i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>
			<div class="mt-2 text-sm text-gray-600">
				Step {currentStep} of {totalSteps}
			</div>
		</div>

		<!-- Error Message -->
		{#if error}
			<div class="mb-6 rounded-md border border-red-200 bg-red-50 p-4">
				<p class="text-red-800">{error}</p>
			</div>
		{/if}

		<!-- Form -->
		<form onsubmit={handleSubmit} class="space-y-8">
			<!-- Step 1: Basic Information -->
			{#if currentStep === 1}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-6 text-xl font-semibold">Basic Information</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label for="title" class="mb-2 block text-sm font-medium text-gray-700">
								Property Title *
							</label>
							<input
								bind:value={formData.title}
								type="text"
								id="title"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter property title"
							/>
						</div>
						<div>
							<label for="propertyType" class="mb-2 block text-sm font-medium text-gray-700">
								Property Type *
							</label>
							<select
								bind:value={formData.propertyType}
								id="propertyType"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="apartment">Apartment</option>
								<option value="house">House</option>
								<option value="condo">Condo</option>
								<option value="townhouse">Townhouse</option>
								<option value="villa">Villa</option>
							</select>
						</div>
						<div>
							<label for="price" class="mb-2 block text-sm font-medium text-gray-700">
								Price (€) *
							</label>
							<input
								bind:value={formData.price}
								type="number"
								id="price"
								required
								min="0"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter price"
							/>
						</div>
						<div>
							<label for="status" class="mb-2 block text-sm font-medium text-gray-700">
								Status *
							</label>
							<select
								bind:value={formData.status}
								id="status"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="draft">Draft</option>
								<option value="published">Published</option>
								<option value="live">Live</option>
								<option value="in_negotiation">In Negotiation</option>
								<option value="removed">Removed</option>
								<option value="archived">Archived</option>
							</select>
						</div>
						<div class="md:col-span-2">
							<label for="description" class="mb-2 block text-sm font-medium text-gray-700">
								Description *
							</label>
							<textarea
								bind:value={formData.description}
								id="description"
								required
								rows="4"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Describe your property..."
							></textarea>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 2: Location -->
			{#if currentStep === 2}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-6 text-xl font-semibold">Location</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label for="address" class="mb-2 block text-sm font-medium text-gray-700">
								Address *
							</label>
							<input
								bind:value={formData.address}
								type="text"
								id="address"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter street address"
							/>
						</div>
						<div>
							<label for="city" class="mb-2 block text-sm font-medium text-gray-700">
								City *
							</label>
							<input
								bind:value={formData.city}
								type="text"
								id="city"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter city"
							/>
						</div>
						<div>
							<label for="postalCode" class="mb-2 block text-sm font-medium text-gray-700">
								Postal Code *
							</label>
							<input
								bind:value={formData.postalCode}
								type="text"
								id="postalCode"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter postal code"
							/>
						</div>
						<div>
							<label for="country" class="mb-2 block text-sm font-medium text-gray-700">
								Country *
							</label>
							<input
								bind:value={formData.country}
								type="text"
								id="country"
								required
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter country"
							/>
						</div>
						<div>
							<label for="latitude" class="mb-2 block text-sm font-medium text-gray-700">
								Latitude
							</label>
							<input
								bind:value={formData.latitude}
								type="number"
								id="latitude"
								step="any"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter latitude"
							/>
						</div>
						<div>
							<label for="longitude" class="mb-2 block text-sm font-medium text-gray-700">
								Longitude
							</label>
							<input
								bind:value={formData.longitude}
								type="number"
								id="longitude"
								step="any"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter longitude"
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 3: Property Details -->
			{#if currentStep === 3}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-6 text-xl font-semibold">Property Details</h2>
					<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
						<div>
							<label for="bedrooms" class="mb-2 block text-sm font-medium text-gray-700">
								Bedrooms
							</label>
							<input
								bind:value={formData.bedrooms}
								type="number"
								id="bedrooms"
								min="0"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Number of bedrooms"
							/>
						</div>
						<div>
							<label for="bathrooms" class="mb-2 block text-sm font-medium text-gray-700">
								Bathrooms
							</label>
							<input
								bind:value={formData.bathrooms}
								type="number"
								id="bathrooms"
								min="0"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Number of bathrooms"
							/>
						</div>
						<div>
							<label for="squareMeters" class="mb-2 block text-sm font-medium text-gray-700">
								Square Meters
							</label>
							<input
								bind:value={formData.squareMeters}
								type="number"
								id="squareMeters"
								min="0"
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Total square meters"
							/>
						</div>
						<div>
							<label for="yearBuilt" class="mb-2 block text-sm font-medium text-gray-700">
								Year Built
							</label>
							<input
								bind:value={formData.yearBuilt}
								type="number"
								id="yearBuilt"
								min="1800"
								max={new Date().getFullYear()}
								class="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Year built"
							/>
						</div>
					</div>
				</div>
			{/if}

			<!-- Step 4: Media & Amenities -->
			{#if currentStep === 4}
				<div class="rounded-lg bg-white p-6 shadow">
					<h2 class="mb-6 text-xl font-semibold">Media & Amenities</h2>
					<div class="space-y-8">
						<!-- Hero Image Upload -->
						<MediaUpload
							propertyId={property.id}
							mediaCategory="hero"
							existingMedia={uploadedMedia}
							on:uploaded={handleMediaUploaded}
							on:deleted={handleMediaDeleted}
						/>

						<!-- Slideshow Images Upload -->
						<MediaUpload
							propertyId={property.id}
							mediaCategory="slideshow"
							existingMedia={uploadedMedia}
							on:uploaded={handleMediaUploaded}
							on:deleted={handleMediaDeleted}
						/>

						<!-- Layout Images Upload -->
						<MediaUpload
							propertyId={property.id}
							mediaCategory="layout"
							existingMedia={uploadedMedia}
							on:uploaded={handleMediaUploaded}
							on:deleted={handleMediaDeleted}
						/>

						<!-- Amenities Section (Placeholder) -->
						<div class="border-t border-gray-200 pt-8">
							<h3 class="mb-4 text-lg font-medium text-gray-900">Amenities</h3>
							<div class="py-4 text-center">
								<p class="text-gray-600">
									Amenities management will be implemented in the next iteration.
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
					class="rounded-md border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
				>
					Previous
				</button>
				<div class="flex space-x-4">
					<!-- Save Draft Button - Available on all steps -->
					<button
						type="button"
						onclick={saveDraft}
						disabled={loading}
						class="rounded-md border border-gray-300 bg-gray-100 px-6 py-2 text-gray-700 hover:bg-gray-200 disabled:opacity-50"
					>
						{loading ? 'Saving...' : 'Save Draft'}
					</button>
					{#if currentStep < totalSteps}
						<button
							type="button"
							onclick={nextStep}
							class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
						>
							Next
						</button>
					{:else}
						<button
							type="submit"
							disabled={loading}
							class="rounded-md bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:opacity-50"
						>
							{loading ? 'Updating...' : 'Update Property'}
						</button>
					{/if}
				</div>
			</div>
		</form>
	</div>
</div>
