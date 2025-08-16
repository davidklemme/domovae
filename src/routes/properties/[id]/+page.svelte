<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	export let data: PageData;

	let property = data.property;
	let currentImageIndex = 0;

	function formatPrice(price: number) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(price);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'live':
				return 'bg-green-100 text-green-800';
			case 'published':
				return 'bg-blue-100 text-blue-800';
			case 'in_negotiation':
				return 'bg-yellow-100 text-yellow-800';
			case 'draft':
				return 'bg-gray-100 text-gray-800';
			case 'archived':
				return 'bg-red-100 text-red-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusLabel(status: string) {
		switch (status) {
			case 'live':
				return 'Live';
			case 'published':
				return 'Published';
			case 'in_negotiation':
				return 'In Negotiation';
			case 'draft':
				return 'Draft';
			case 'archived':
				return 'Archived';
			default:
				return status;
		}
	}

	function nextImage() {
		if (property.media && currentImageIndex < property.media.length - 1) {
			currentImageIndex++;
		}
	}

	function prevImage() {
		if (currentImageIndex > 0) {
			currentImageIndex--;
		}
	}

	function goToImage(index: number) {
		currentImageIndex = index;
	}
</script>

<svelte:head>
	<title>{property.title} - Domovae</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<button onclick={() => goto('/properties')} class="text-gray-600 hover:text-gray-900">
					← Back to Properties
				</button>
				{#if data.session?.user?.id === property.ownerId || data.session?.user?.role === 'admin'}
					<div class="flex space-x-2">
						<button
							onclick={() => goto(`/properties/${property.id}/edit`)}
							class="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
						>
							Edit
						</button>
						<button
							onclick={async () => {
								if (confirm('Are you sure you want to archive this property?')) {
									try {
										const response = await fetch(`/api/properties/${property.id}`, {
											method: 'DELETE'
										});

										if (response.ok) {
											// Redirect to dashboard after successful archive
											goto('/dashboard');
										} else {
											const errorData = await response.json();
											alert(`Failed to archive property: ${errorData.error || 'Unknown error'}`);
										}
									} catch (error) {
										console.error('Error archiving property:', error);
										alert('Failed to archive property. Please try again.');
									}
								}
							}}
							class="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
						>
							Archive
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<!-- Main Content -->
			<div class="lg:col-span-2">
				<!-- Property Title and Status -->
				<div class="mb-6">
					<div class="mb-2 flex items-center justify-between">
						<h1 class="text-3xl font-bold text-gray-900">{property.title}</h1>
						<span
							class="rounded-full px-3 py-1 text-sm font-medium {getStatusColor(
								property.status || 'draft'
							)}"
						>
							{getStatusLabel(property.status || 'draft')}
						</span>
					</div>
					<p class="mb-4 text-xl text-gray-600">
						📍 {property.location?.city}, {property.location?.country}
					</p>
					<div class="text-2xl font-bold text-gray-900">
						{formatPrice(property.price)}
					</div>
				</div>

				<!-- Image Gallery -->
				<div class="mb-8">
					{#if property.media && property.media.length > 0}
						<div class="relative">
							<img
								src={property.media[currentImageIndex].mediaUrl}
								alt={property.title}
								class="h-96 w-full rounded-lg object-cover"
							/>
							{#if property.media.length > 1}
								<button
									onclick={prevImage}
									disabled={currentImageIndex === 0}
									class="bg-opacity-80 hover:bg-opacity-100 absolute top-1/2 left-4 -translate-y-1/2 transform rounded-full bg-white p-2 disabled:opacity-50"
								>
									←
								</button>
								<button
									onclick={nextImage}
									disabled={currentImageIndex === property.media.length - 1}
									class="bg-opacity-80 hover:bg-opacity-100 absolute top-1/2 right-4 -translate-y-1/2 transform rounded-full bg-white p-2 disabled:opacity-50"
								>
									→
								</button>
							{/if}
						</div>
						{#if property.media.length > 1}
							<div class="mt-4 flex space-x-2">
								{#each property.media as _, index (index)}
									<button
										onclick={() => goToImage(index)}
										class="h-16 w-16 overflow-hidden rounded-lg {currentImageIndex === index
											? 'ring-2 ring-blue-500'
											: ''}"
									>
										<img
											src={property.media[index].mediaUrl}
											alt="Thumbnail"
											class="h-full w-full object-cover"
										/>
									</button>
								{/each}
							</div>
						{/if}
					{:else}
						<div class="flex h-96 w-full items-center justify-center rounded-lg bg-gray-200">
							<span class="text-6xl text-gray-400">🏠</span>
						</div>
					{/if}
				</div>

				<!-- Property Details -->
				<div class="mb-8 rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-xl font-semibold">Property Details</h2>
					<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900">{property.bedrooms || 0}</div>
							<div class="text-sm text-gray-600">Bedrooms</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900">{property.bathrooms || 0}</div>
							<div class="text-sm text-gray-600">Bathrooms</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900">{property.livingArea || 0}m²</div>
							<div class="text-sm text-gray-600">Living Area</div>
						</div>
						<div class="text-center">
							<div class="text-2xl font-bold text-gray-900">{property.yearBuilt || 'N/A'}</div>
							<div class="text-sm text-gray-600">Year Built</div>
						</div>
					</div>
				</div>

				<!-- Description -->
				<div class="mb-8 rounded-lg bg-white p-6 shadow-sm">
					<h2 class="mb-4 text-xl font-semibold">Description</h2>
					<p class="leading-relaxed text-gray-700">
						{property.description || 'No description available for this property.'}
					</p>
				</div>

				<!-- Amenities -->
				{#if property.amenities && property.amenities.length > 0}
					<div class="mb-8 rounded-lg bg-white p-6 shadow-sm">
						<h2 class="mb-4 text-xl font-semibold">Amenities</h2>
						<div class="grid grid-cols-2 gap-3 md:grid-cols-3">
							{#each property.amenities as propertyAmenity (propertyAmenity.amenity.id)}
								<div class="flex items-center space-x-2">
									<span class="text-green-500">✓</span>
									<span class="text-gray-700">{propertyAmenity.amenity.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>

			<!-- Sidebar -->
			<div class="lg:col-span-1">
				<!-- Contact Card -->
				<div class="sticky top-8 mb-6 rounded-lg bg-white p-6 shadow-sm">
					<h3 class="mb-4 text-lg font-semibold">Schedule a Viewing</h3>
					{#if data.session?.user}
						{#if data.session.user.role === 'buyer'}
							<button
								onclick={() => goto(`/appointments/create?propertyId=${property.id}`)}
								class="mb-4 w-full rounded-md bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700"
							>
								📅 Request Viewing Appointment
							</button>
							<p class="mb-4 text-sm text-gray-600">
								Schedule a time to view this property in person
							</p>
						{:else if data.session.user.role === 'owner' && data.session.user.id === property.ownerId}
							<div class="text-center">
								<p class="mb-2 text-gray-600">This is your property</p>
								<p class="text-sm text-gray-500">Viewing requests will appear in your dashboard</p>
							</div>
						{:else}
							<div class="text-center">
								<p class="mb-2 text-gray-600">Contact the owner</p>
								<button
									onclick={() => {
										// TODO: Implement contact functionality
									}}
									class="w-full rounded-md border border-gray-300 px-4 py-3 text-gray-700 hover:bg-gray-50"
								>
									Send Message
								</button>
							</div>
						{/if}
					{:else}
						<div class="text-center">
							<p class="mb-4 text-gray-600">Sign in to schedule a viewing</p>
							<button
								onclick={() => goto('/auth/signin')}
								class="w-full rounded-md bg-blue-600 px-4 py-3 text-white hover:bg-blue-700"
							>
								Sign In
							</button>
						</div>
					{/if}
				</div>

				<!-- Property Info Card -->
				<div class="rounded-lg bg-white p-6 shadow-sm">
					<h3 class="mb-4 text-lg font-semibold">Property Information</h3>
					<div class="space-y-3">
						<div class="flex justify-between">
							<span class="text-gray-600">Type:</span>
							<span class="font-medium capitalize">{property.propertyType}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Status:</span>
							<span class="font-medium">{getStatusLabel(property.status || 'draft')}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Price:</span>
							<span class="font-medium">{formatPrice(property.price)}</span>
						</div>
						{#if property.location?.street}
							<div class="flex justify-between">
								<span class="text-gray-600">Address:</span>
								<span class="text-right font-medium">{property.location.street}</span>
							</div>
						{/if}
						<div class="flex justify-between">
							<span class="text-gray-600">City:</span>
							<span class="font-medium">{property.location?.city || 'N/A'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Postal Code:</span>
							<span class="font-medium">{property.location?.postalCode || 'N/A'}</span>
						</div>
						<div class="flex justify-between">
							<span class="text-gray-600">Country:</span>
							<span class="font-medium">{property.location?.country || 'N/A'}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
