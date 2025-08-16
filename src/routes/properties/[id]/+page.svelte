<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PropertyQA from '$lib/components/PropertyQA.svelte';
	import ScheduleAction from '$lib/components/ScheduleAction.svelte';
	import { marked } from 'marked';

	export let data: PageData;

	let property = data.property;
	let currentImageIndex = 0;
	let isImageModalOpen = false;

	// Configure marked for security
	marked.setOptions({
		breaks: true, // Convert line breaks to <br>
		gfm: true // GitHub Flavored Markdown
	});

	// Function to safely render markdown
	function renderMarkdown(text: string): string {
		if (!text) return '';
		try {
			const result = marked(text);
			return typeof result === 'string' ? result : String(result);
		} catch (error) {
			console.error('Error rendering markdown:', error);
			return text; // Fallback to plain text
		}
	}

	function formatPrice(price: number) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(price);
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'live':
				return 'bg-emerald-50 text-emerald-700 border-emerald-200';
			case 'published':
				return 'bg-blue-50 text-blue-700 border-blue-200';
			case 'in_negotiation':
				return 'bg-amber-50 text-amber-700 border-amber-200';
			case 'draft':
				return 'bg-slate-50 text-slate-700 border-slate-200';
			case 'archived':
				return 'bg-red-50 text-red-700 border-red-200';
			default:
				return 'bg-slate-50 text-slate-700 border-slate-200';
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	function _goToImage(_index: number) {
		currentImageIndex = index;
	}

	function openImageModal() {
		isImageModalOpen = true;
	}

	function closeImageModal() {
		isImageModalOpen = false;
	}

	// Parse neighborhood highlights from database or use defaults
	const neighborhoodHighlights = property.neighborhoodHighlights
		? property.neighborhoodHighlights.split('\n').filter((line) => line.trim())
		: [
				'🚇 5 min walk to metro station',
				'🏫 Excellent schools nearby',
				'🛒 Shopping center 10 min away',
				'🌳 Beautiful parks in the area',
				'🍽️ Trendy restaurants & cafes'
			];

	// Parse property features from database or use defaults
	const propertyFeatures = property.propertyHighlights
		? property.propertyHighlights.split('\n').filter((line) => line.trim())
		: [
				'Modern kitchen with island',
				'Balcony with city views',
				'Built-in wardrobes',
				'Underfloor heating',
				'Smart home features',
				'Private parking space'
			];
</script>

<svelte:head>
	<title>{property.title} - Domovae</title>
</svelte:head>

<!-- Image Modal -->
{#if isImageModalOpen}
	<div
		class="bg-opacity-90 fixed inset-0 z-50 flex items-center justify-center bg-black"
		onclick={closeImageModal}
	>
		<div class="relative max-h-[90vh] max-w-[90vw]">
			<img
				src={property.media[currentImageIndex].mediaUrl}
				alt={property.title}
				class="max-h-full max-w-full object-contain"
			/>
			{#if property.media.length > 1}
				<button
					onclick={prevImage}
					disabled={currentImageIndex === 0}
					class="bg-opacity-90 absolute top-1/2 left-4 -translate-y-1/2 transform rounded-full bg-white p-3 text-slate-800 shadow-lg transition-all hover:bg-white disabled:opacity-50"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
				</button>
				<button
					onclick={nextImage}
					disabled={currentImageIndex === property.media.length - 1}
					class="bg-opacity-90 absolute top-1/2 right-4 -translate-y-1/2 transform rounded-full bg-white p-3 text-slate-800 shadow-lg transition-all hover:bg-white disabled:opacity-50"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"
						></path>
					</svg>
				</button>
			{/if}
			<button
				onclick={closeImageModal}
				class="bg-opacity-90 hover:bg-opacity-100 absolute top-4 right-4 rounded-full bg-white p-2 text-slate-800"
			>
				✕
			</button>
		</div>
	</div>
{/if}

<div class="min-h-screen bg-white">
	<!-- Header -->
	<div class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<button
					onclick={() => goto('/properties')}
					class="flex items-center space-x-2 rounded-lg px-4 py-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M15 19l-7-7 7-7"
						></path>
					</svg>
					<span>Back to Properties</span>
				</button>
				{#if data.session?.user?.id === property.ownerId || data.session?.user?.role === 'admin'}
					<div class="flex space-x-3">
						<button
							onclick={() => goto(`/properties/${property.id}/edit`)}
							class="rounded-lg bg-slate-900 px-6 py-2 font-medium text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow-md"
						>
							Edit Property
						</button>
						<button
							onclick={async () => {
								if (confirm('Are you sure you want to archive this property?')) {
									try {
										const response = await fetch(`/api/properties/${property.id}`, {
											method: 'DELETE'
										});

										if (response.ok) {
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
							class="rounded-lg border border-slate-300 bg-white px-6 py-2 font-medium text-slate-700 transition-colors hover:bg-slate-50"
						>
							Archive
						</button>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="max-w-8xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
		<!-- Hero Section -->
		<div class="mb-16">
			<div class="mb-8">
				<div class="mb-6 flex items-start justify-between">
					<div class="flex-1">
						<h1 class="mb-3 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl">
							{property.title}
						</h1>
						<div class="flex items-center space-x-4">
							<div class="flex items-center space-x-2 text-slate-600">
								<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
									></path>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
									></path>
								</svg>
								<span class="text-lg">{property.location?.city}, {property.location?.country}</span>
							</div>
							<span
								class="rounded-full border px-3 py-1 text-sm font-medium {getStatusColor(
									property.status || 'draft'
								)}"
							>
								{getStatusLabel(property.status || 'draft')}
							</span>
						</div>
					</div>
					<div class="text-right">
						<div class="text-3xl font-bold text-slate-900 lg:text-4xl">
							{formatPrice(property.price)}
						</div>
						<div class="text-sm text-slate-500">Price</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Top Row: Hero Image + Schedule Action -->
		<div class="mb-12 grid grid-cols-1 gap-12 lg:grid-cols-5">
			<!-- Hero Image Gallery -->
			<div class="lg:col-span-4">
				{#if property.media && property.media.length > 0}
					<div class="relative overflow-hidden rounded-lg bg-white">
						{#if property.media.length === 1}
							<!-- Single image -->
							<div class="relative aspect-[16/10] w-full">
								<img
									src={property.media[0].mediaUrl}
									alt={property.title}
									class="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
									onclick={openImageModal}
								/>
								<div
									class="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"
								></div>
							</div>
						{:else}
							<!-- Hero layout: one large image (70%) and compact grid of smaller images (30%) -->
							<div class="grid grid-cols-10 gap-3 p-0">
								<!-- Main hero image (70% width) -->
								<div class="relative col-span-7 aspect-[16/10] overflow-hidden rounded-lg">
									<img
										src={property.media[0].mediaUrl}
										alt={property.title}
										class="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
										onclick={() => {
											currentImageIndex = 0;
											openImageModal();
										}}
									/>
								</div>

								<!-- Side images grid (30% width) -->
								<div class="col-span-3 grid grid-cols-2 grid-rows-3 gap-2">
									{#each property.media.slice(1, 7) as _, index}
										<div class="relative aspect-square overflow-hidden rounded-lg">
											<img
												src={property.media[index + 1].mediaUrl}
												alt={property.title}
												class="h-full w-full cursor-pointer object-cover transition-transform hover:scale-105"
												onclick={() => {
													currentImageIndex = index + 1;
													openImageModal();
												}}
											/>
											{#if index === 5 && property.media.length > 7}
												<!-- Overlay showing more photos -->
												<div class="absolute inset-0 flex items-center justify-center bg-black/60">
													<span class="text-sm font-semibold text-white"
														>+{property.media.length - 7}</span
													>
												</div>
											{/if}
										</div>
									{/each}

									<!-- Fill remaining slots with placeholders if needed -->
									{#each Array(Math.max(0, 6 - Math.min(property.media.length - 1, 6))) as _, index}
										<div class="aspect-square rounded-lg bg-slate-100"></div>
									{/each}
								</div>
							</div>

							<!-- Additional photos scrollbar (if more than 7 photos) -->
							{#if property.media.length > 7}
								<div class="border-t border-slate-200 p-6">
									<h3 class="mb-4 text-lg font-semibold text-slate-900">All Photos</h3>
									<div class="flex space-x-3 overflow-x-auto pb-2">
										{#each property.media as _, index}
											<button
												onclick={() => {
													currentImageIndex = index;
													openImageModal();
												}}
												class="flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all {currentImageIndex ===
												index
													? 'border-slate-900 shadow-md'
													: 'border-transparent hover:border-slate-300'}"
											>
												<img
													src={property.media[index].mediaUrl}
													alt="Photo {index + 1}"
													class="h-20 w-32 object-cover"
												/>
											</button>
										{/each}
									</div>
								</div>
							{/if}
						{/if}

						<!-- Image counter and navigation for multiple images -->
						{#if property.media.length > 1}
							<div
								class="absolute right-4 bottom-4 rounded-lg bg-black/50 px-3 py-1 text-sm text-white"
							>
								{property.media.length} photos
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex h-96 w-full items-center justify-center rounded-lg bg-slate-100">
						<div class="text-center">
							<span class="text-8xl">🏠</span>
							<p class="mt-4 text-lg text-slate-600">No images available</p>
						</div>
					</div>
				{/if}
			</div>

			<!-- Schedule Action -->
			<div class="lg:col-span-1">
				<ScheduleAction
					propertyId={property.id}
					currentUser={data.session?.user}
					propertyOwnerId={property.ownerId}
				/>
			</div>
		</div>

		<!-- Bottom Row: Content + Sidebar -->
		<div class="grid grid-cols-1 gap-12 lg:grid-cols-5">
			<!-- Main Content -->
			<div class="space-y-12 lg:col-span-4">
				<!-- Quick Stats -->
				<div class="grid grid-cols-2 gap-6 md:grid-cols-4 md:grid-rows-1">
					<div class="rounded-lg bg-slate-50 p-6 text-center">
						<div class="text-3xl font-bold text-slate-900">{property.bedrooms || 0}</div>
						<div class="text-sm font-medium text-slate-600">Bedrooms</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-6 text-center">
						<div class="text-3xl font-bold text-slate-900">{property.bathrooms || 0}</div>
						<div class="text-sm font-medium text-slate-600">Bathrooms</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-6 text-center">
						<div class="text-3xl font-bold text-slate-900">{property.livingArea || 0}m²</div>
						<div class="text-sm font-medium text-slate-600">Living Area</div>
					</div>
					<div class="rounded-lg bg-slate-50 p-6 text-center">
						<div class="text-3xl font-bold text-slate-900">{property.yearBuilt || 'N/A'}</div>
						<div class="text-sm font-medium text-slate-600">Year Built</div>
					</div>
				</div>

				<!-- Description -->
				<div class="rounded-lg border border-slate-200 bg-white p-8 shadow-xs">
					<div class="prose prose-lg max-w-none text-slate-700">
						{@html renderMarkdown(
							property.description ||
								'# About This Property\n\nThis stunning property offers the perfect blend of modern comfort and timeless elegance. Located in a highly sought-after neighborhood, this home provides an exceptional living experience with thoughtful design and premium finishes throughout.\n\n## Key Features\n- Modern kitchen with island\n- Balcony with city views\n- Built-in wardrobes\n- Underfloor heating\n- Smart home features\n- Private parking space'
						)}
					</div>
				</div>

				<!-- Location & Neighborhood -->
				<div class="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
					<h2 class="mb-6 text-2xl font-bold text-slate-900">Location & Neighborhood</h2>
					<div class="grid gap-8 md:grid-cols-2">
						<div>
							<h3 class="mb-4 text-lg font-semibold text-slate-800">Perfect Location</h3>
							<div class="prose prose-sm mb-6 max-w-none text-slate-700">
								{@html renderMarkdown(
									property.locationDescription ||
										`Nestled in the heart of ${property.location?.city}, this property enjoys an enviable location that combines urban convenience with residential tranquility. The area is known for its excellent amenities, top-rated schools, and vibrant community atmosphere.`
								)}
							</div>
							<div class="space-y-3">
								{#each neighborhoodHighlights as highlight}
									<div class="flex items-center space-x-3">
										<span class="text-lg">{highlight.split(' ')[0]}</span>
										<span class="text-slate-700">{highlight.split(' ').slice(1).join(' ')}</span>
									</div>
								{/each}
							</div>
						</div>
						<div class="rounded-xl bg-slate-50 p-6">
							<h3 class="mb-4 text-lg font-semibold text-slate-800">Transportation</h3>
							<div class="space-y-3">
								<div class="flex items-center justify-between">
									<span class="text-slate-600">Metro Station</span>
									<span class="font-medium text-slate-900">5 min walk</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-slate-600">Bus Stop</span>
									<span class="font-medium text-slate-900">2 min walk</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-slate-600">Airport</span>
									<span class="font-medium text-slate-900">25 min drive</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-slate-600">City Center</span>
									<span class="font-medium text-slate-900">15 min drive</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				<!-- Property Features -->
				<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
					<h2 class="mb-6 text-2xl font-bold text-slate-900">Property Features</h2>
					<div class="grid gap-4 md:grid-cols-2">
						{#each propertyFeatures as feature}
							<div class="flex items-center space-x-3">
								<div class="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100">
									<svg
										class="h-3 w-3 text-slate-600"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M5 13l4 4L19 7"
										></path>
									</svg>
								</div>
								<span class="text-slate-700">{feature}</span>
							</div>
						{/each}
					</div>
				</div>

				<!-- Amenities -->
				{#if property.amenities && property.amenities.length > 0}
					<div class="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
						<h2 class="mb-6 text-2xl font-bold text-slate-900">Amenities</h2>
						<div class="grid gap-4 md:grid-cols-3">
							{#each property.amenities as propertyAmenity (propertyAmenity.amenity.id)}
								<div class="flex items-center space-x-3 rounded-lg bg-slate-50 p-3">
									<div class="flex h-5 w-5 items-center justify-center rounded-full bg-slate-200">
										<svg
											class="h-3 w-3 text-slate-600"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path
												stroke-linecap="round"
												stroke-linejoin="round"
												stroke-width="2"
												d="M5 13l4 4L19 7"
											></path>
										</svg>
									</div>
									<span class="font-medium text-slate-700">{propertyAmenity.amenity.name}</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Q&A Section -->
				<PropertyQA
					propertyId={property.id}
					propertyOwnerId={property.ownerId}
					currentUserId={data.session?.user?.id}
					currentUserRole={data.session?.user?.role}
				/>
			</div>

			<!-- Sidebar -->
			<div class="space-y-6 lg:col-span-1">
				<!-- Property Info Card -->
				<div class="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
					<div class="space-y-2">
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">Type:</span>
							<span class="text-xs font-semibold text-slate-900 capitalize"
								>{property.propertyType}</span
							>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">Status:</span>
							<span class="text-xs font-semibold text-slate-900"
								>{getStatusLabel(property.status || 'draft')}</span
							>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">Price:</span>
							<span class="text-xs font-semibold text-slate-900">{formatPrice(property.price)}</span
							>
						</div>
						{#if property.location?.street}
							<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
								<span class="text-xs text-slate-600">Address:</span>
								<span class="text-right text-xs font-semibold text-slate-900"
									>{property.location.street}</span
								>
							</div>
						{/if}
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">City:</span>
							<span class="text-xs font-semibold text-slate-900"
								>{property.location?.city || 'N/A'}</span
							>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">Postal Code:</span>
							<span class="text-xs font-semibold text-slate-900"
								>{property.location?.postalCode || 'N/A'}</span
							>
						</div>
						<div class="flex items-center justify-between rounded-lg bg-slate-50 p-2">
							<span class="text-xs text-slate-600">Country:</span>
							<span class="text-xs font-semibold text-slate-900"
								>{property.location?.country || 'N/A'}</span
							>
						</div>
					</div>
				</div>

				<!-- Quick Contact -->
				<div class="rounded-xl border border-slate-200 bg-slate-50 p-4">
					<h3 class="mb-3 text-sm font-bold text-slate-900">Need Help?</h3>
					<p class="mb-3 text-xs text-slate-600">
						Our team is here to help you find your perfect home. Get in touch for personalized
						assistance.
					</p>
					<button
						class="w-full rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-slate-800"
					>
						Contact Support
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
