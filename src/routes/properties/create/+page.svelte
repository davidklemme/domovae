<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import MediaUpload from '$lib/components/MediaUpload.svelte';

	let currentStep = 1;
	let totalSteps = 4;
	let isLoading = false;
	let error = '';
	let propertyId: number | null = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let uploadedMedia: any[] = [];

	// Form data
	let formData = {
		// Basic Information
		title: '',
		description: '',
		price: '',
		propertyType: '',
		propertySubtype: '',
		bedrooms: '',
		bathrooms: '',
		livingArea: '',
		totalArea: '',
		yearBuilt: '',

		// Location
		street: '',
		houseNumber: '',
		city: '',
		postalCode: '',
		state: '',
		neighborhood: '',
		district: '',

		// Media (placeholder for now)
		media: [],

		// Amenities (placeholder for now)
		amenities: [],

		// Proximities (placeholder for now)
		proximities: []
	};

	onMount(() => {
		// Redirect if not authenticated
		if (!$page.data.session) {
			goto('/auth/signin');
			return;
		}
	});

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

	async function saveDraft() {
		isLoading = true;
		error = '';

		try {
			// Map form data to match service expectations
			const requestData = {
				title: formData.title,
				description: formData.description,
				price: formData.price,
				propertyType: formData.propertyType,
				status: 'draft',
				bedrooms: formData.bedrooms,
				bathrooms: formData.bathrooms,
				squareMeters: formData.livingArea, // Map livingArea to squareMeters
				yearBuilt: formData.yearBuilt,
				// Location data
				address: formData.street,
				city: formData.city,
				postalCode: formData.postalCode,
				country: 'Germany'
			};

			console.log('Sending data to API:', requestData);

			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			console.log('Response status:', response.status);
			const responseData = await response.json();
			console.log('Response data:', responseData);

			if (response.ok) {
				console.log('Response data:', responseData);
				console.log('Property ID:', responseData.property?.id);
				// Set the property ID for media uploads
				propertyId = responseData.property?.id;
				// Don't redirect, stay on the form
				error = '';
			} else {
				error =
					responseData.details ||
					responseData.error ||
					`Failed to save draft (Status: ${response.status})`;
			}
		} catch (err) {
			console.error('Error in saveDraft:', err);
			error = 'Failed to save draft. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	async function publishProperty() {
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					...formData,
					status: 'published'
				})
			});

			if (response.ok) {
				const result = await response.json();
				// Redirect to the newly created property
				goto(`/properties/${result.property.id}`);
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to publish property';
			}
		} catch (err) {
			error = 'Failed to publish property. Please try again.';
		} finally {
			isLoading = false;
		}
	}

	function validateCurrentStep() {
		switch (currentStep) {
			case 1:
				return formData.title && formData.price && formData.propertyType;
			case 2:
				return formData.street && formData.city && formData.postalCode;
			case 3:
				return true; // Media is optional
			case 4:
				return true; // Amenities and proximities are optional
			default:
				return false;
		}
	}
</script>

<svelte:head>
	<title>Create Property - Domovae</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<a href="/dashboard" class="text-xl font-semibold text-gray-900">Domovae</a>
				</div>
				<div class="flex items-center space-x-4">
					{#if $page.data.session?.user}
						<div class="flex items-center space-x-3">
							{#if $page.data.session.user.image}
								<img
									class="h-8 w-8 rounded-full"
									src={$page.data.session.user.image}
									alt={$page.data.session.user.name || 'User'}
								/>
							{/if}
							<span class="text-sm text-gray-700">
								{$page.data.session.user.name || $page.data.session.user.email}
							</span>
							<a href="/dashboard" class="text-sm text-gray-500 hover:text-gray-700"> Dashboard </a>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="mx-auto max-w-4xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<!-- Header -->
			<div class="mb-8">
				<h1 class="text-3xl font-bold text-gray-900">Create New Property</h1>
				<p class="mt-2 text-gray-600">Add your property to the marketplace</p>
			</div>

			<!-- Progress Bar -->
			<div class="mb-8">
				<div class="flex items-center justify-between">
					{#each Array(totalSteps) as _unused, i (i)}
						{@const stepNumber = i + 1}
						<div class="flex items-center">
							<div
								class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium {currentStep >=
								stepNumber
									? 'bg-indigo-600 text-white'
									: 'bg-gray-200 text-gray-600'}"
							>
								{stepNumber}
							</div>
							{#if stepNumber < totalSteps}
								<div
									class="h-1 w-16 {currentStep > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'}"
								></div>
							{/if}
						</div>
					{/each}
				</div>
				<div class="mt-4 flex justify-between text-sm text-gray-600">
					<span>Basic Info</span>
					<span>Location</span>
					<span>Media</span>
					<span>Details</span>
				</div>
			</div>

			<!-- Error Message -->
			{#if error}
				<div class="mb-4 rounded border border-red-200 bg-red-50 px-4 py-3 text-red-700">
					{error}
				</div>
			{/if}

			<!-- Form Content -->
			<div class="rounded-lg bg-white shadow">
				<div class="px-4 py-5 sm:p-6">
					{#if currentStep === 1}
						<!-- Step 1: Basic Information -->
						<div>
							<h3 class="mb-6 text-lg font-medium text-gray-900">Basic Property Information</h3>
							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div class="sm:col-span-2">
									<label for="title" class="block text-sm font-medium text-gray-700"
										>Property Title</label
									>
									<input
										type="text"
										id="title"
										bind:value={formData.title}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="e.g., Beautiful 3-bedroom apartment in city center"
									/>
								</div>

								<div class="sm:col-span-2">
									<label for="description" class="block text-sm font-medium text-gray-700"
										>Description</label
									>
									<textarea
										id="description"
										bind:value={formData.description}
										rows="4"
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="Describe your property..."
									></textarea>
								</div>

								<div>
									<label for="price" class="block text-sm font-medium text-gray-700"
										>Price (€)</label
									>
									<input
										type="number"
										id="price"
										bind:value={formData.price}
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
										<option value="ground-floor">Ground Floor</option>
									</select>
								</div>

								<div>
									<label for="bedrooms" class="block text-sm font-medium text-gray-700"
										>Bedrooms</label
									>
									<input
										type="number"
										id="bedrooms"
										bind:value={formData.bedrooms}
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
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="1995"
									/>
								</div>
							</div>
						</div>
					{:else if currentStep === 2}
						<!-- Step 2: Location -->
						<div>
							<h3 class="mb-6 text-lg font-medium text-gray-900">Property Location</h3>
							<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
								<div class="sm:col-span-2">
									<label for="street" class="block text-sm font-medium text-gray-700">Street</label>
									<input
										type="text"
										id="street"
										bind:value={formData.street}
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
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="123"
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
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="10115"
									/>
								</div>

								<div>
									<label for="city" class="block text-sm font-medium text-gray-700">City</label>
									<input
										type="text"
										id="city"
										bind:value={formData.city}
										class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
										placeholder="Berlin"
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
									<label for="district" class="block text-sm font-medium text-gray-700"
										>District</label
									>
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
						<div>
							<h3 class="mb-6 text-lg font-medium text-gray-900">Property Media</h3>

							{#if !propertyId}
								<div class="py-8 text-center">
									<div class="text-gray-500">
										Please save the property first to upload media files.
									</div>
									<button
										onclick={saveDraft}
										class="mt-4 rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
									>
										Save Draft First
									</button>
								</div>
							{:else}
								<div class="space-y-8">
									<!-- Hero Image Upload -->
									<MediaUpload
										{propertyId}
										mediaCategory="hero"
										existingMedia={uploadedMedia}
										on:uploaded={handleMediaUploaded}
										on:deleted={handleMediaDeleted}
									/>

									<!-- Slideshow Images Upload -->
									<MediaUpload
										{propertyId}
										mediaCategory="slideshow"
										existingMedia={uploadedMedia}
										on:uploaded={handleMediaUploaded}
										on:deleted={handleMediaDeleted}
									/>

									<!-- Layout Images Upload -->
									<MediaUpload
										{propertyId}
										mediaCategory="layout"
										existingMedia={uploadedMedia}
										on:uploaded={handleMediaUploaded}
										on:deleted={handleMediaDeleted}
									/>
								</div>
							{/if}
						</div>
					{:else if currentStep === 4}
						<!-- Step 4: Amenities & Proximities -->
						<div>
							<h3 class="mb-6 text-lg font-medium text-gray-900">Amenities & Proximities</h3>
							<div class="space-y-8">
								<div>
									<h4 class="text-md mb-4 font-medium text-gray-900">Property Amenities</h4>
									<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
										{#each ['Balcony', 'Garden', 'Parking', 'Elevator', 'Air Conditioning', 'Heating', 'Kitchen', 'Washing Machine'] as amenity (amenity)}
											<label class="flex items-center">
												<input
													type="checkbox"
													class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
												/>
												<span class="ml-2 text-sm text-gray-700">{amenity}</span>
											</label>
										{/each}
									</div>
								</div>

								<div>
									<h4 class="text-md mb-4 font-medium text-gray-900">Nearby Facilities</h4>
									<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
										{#each ['Public Transport', 'Schools', 'Shopping Centers', 'Hospitals', 'Parks', 'Restaurants'] as facility (facility)}
											<div class="flex items-center justify-between">
												<span class="text-sm text-gray-700">{facility}</span>
												<input
													type="number"
													class="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm"
													placeholder="m"
												/>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</div>
					{/if}
				</div>

				<!-- Form Actions -->
				<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
					{#if currentStep === totalSteps}
						<button
							onclick={publishProperty}
							disabled={isLoading || !validateCurrentStep()}
							class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
						>
							{isLoading ? 'Publishing...' : 'Publish Property'}
						</button>
					{:else}
						<button
							onclick={nextStep}
							disabled={!validateCurrentStep()}
							class="inline-flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
						>
							Next
						</button>
					{/if}

					{#if currentStep > 1}
						<button
							onclick={prevStep}
							class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
						>
							Previous
						</button>
					{/if}

					<button
						onclick={saveDraft}
						disabled={isLoading}
						class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
					>
						{isLoading ? 'Saving...' : 'Save Draft'}
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
