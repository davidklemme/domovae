<script lang="ts">
	import { goto } from '$app/navigation';

	export let properties: Array<{
		id: number;
		title: string;
		description?: string | null;
		price: number;
		propertyType: string;
		status?: string | null;
		bedrooms?: number | null;
		bathrooms?: number | null;
		livingArea?: number | null;
		ownerId: string;
		media?: Array<{ mediaUrl: string }>;
		location?: { city?: string };
	}> = [];
	export let showAddButton = false;
	export let showUserActions = false;
	export let currentUserId: string | undefined = undefined;

	let filteredProperties = properties;
	let searchTerm = '';
	let selectedType = '';
	let minPrice = '';
	let maxPrice = '';
	let selectedStatus = '';

	const propertyTypes = ['apartment', 'house', 'condo', 'townhouse', 'villa'];
	const statusOptions = ['live', 'published', 'in_negotiation', 'draft', 'archived'];

	function filterProperties() {
		filteredProperties = properties.filter((property) => {
			// Search term filter
			if (searchTerm) {
				const searchLower = searchTerm.toLowerCase();
				const titleMatch = property.title.toLowerCase().includes(searchLower);
				const descriptionMatch = property.description?.toLowerCase().includes(searchLower) || false;
				const cityMatch = property.location?.city?.toLowerCase().includes(searchLower) || false;

				if (!titleMatch && !descriptionMatch && !cityMatch) {
					return false;
				}
			}

			// Property type filter
			if (selectedType && property.propertyType !== selectedType) {
				return false;
			}

			// Price range filter
			if (minPrice && minPrice.trim() !== '' && property.price < parseInt(minPrice)) {
				return false;
			}
			if (maxPrice && maxPrice.trim() !== '' && property.price > parseInt(maxPrice)) {
				return false;
			}

			// Status filter
			if (selectedStatus && property.status !== selectedStatus) {
				return false;
			}

			return true;
		});
	}

	function clearFilters() {
		searchTerm = '';
		selectedType = '';
		minPrice = '';
		maxPrice = '';
		selectedStatus = '';
		filterProperties();
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

	async function archiveProperty(propertyId: number) {
		if (confirm('Are you sure you want to archive this property?')) {
			try {
				const response = await fetch(`/api/properties/${propertyId}`, {
					method: 'DELETE'
				});

				if (response.ok) {
					// Refresh the page to update the list
					window.location.reload();
				} else {
					const errorData = await response.json();
					alert(`Failed to archive property: ${errorData.error || 'Unknown error'}`);
				}
			} catch (error) {
				console.error('Error archiving property:', error);
				alert('Failed to archive property. Please try again.');
			}
		}
	}

	// Reactive statement to filter properties when any filter changes
	$: {
		if (
			searchTerm !== undefined ||
			selectedType !== undefined ||
			minPrice !== undefined ||
			maxPrice !== undefined ||
			selectedStatus !== undefined
		) {
			filterProperties();
		}
	}

	// Update filtered properties when the properties prop changes
	$: {
		if (properties) {
			filterProperties();
		}
	}
</script>

<div class="min-h-screen bg-gray-50">
	<!-- Header -->
	<div class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">Properties</h1>
					<p class="mt-2 text-gray-600">Discover your perfect home</p>
				</div>
				{#if showAddButton}
					<button
						onclick={() => goto('/properties/create')}
						class="rounded-md bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
					>
						+ Add Property
					</button>
				{/if}
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="border-b bg-white">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-6">
				<!-- Search -->
				<div class="lg:col-span-2">
					<input
						bind:value={searchTerm}
						type="text"
						placeholder="Search properties..."
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Property Type -->
				<div>
					<select
						bind:value={selectedType}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="">All Types</option>
						{#each propertyTypes as type (type)}
							<option value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
						{/each}
					</select>
				</div>

				<!-- Min Price -->
				<div>
					<input
						bind:value={minPrice}
						type="number"
						placeholder="Min Price"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Max Price -->
				<div>
					<input
						bind:value={maxPrice}
						type="number"
						placeholder="Max Price"
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					/>
				</div>

				<!-- Status -->
				<div>
					<select
						bind:value={selectedStatus}
						class="w-full rounded-md border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="">All Status</option>
						{#each statusOptions as status (status)}
							<option value={status}>{getStatusLabel(status)}</option>
						{/each}
					</select>
				</div>
			</div>

			<!-- Clear Filters -->
			<div class="mt-4 flex items-center justify-between">
				<button onclick={clearFilters} class="text-sm text-gray-600 hover:text-gray-900">
					Clear all filters
				</button>
				<div class="text-sm text-gray-600">
					{filteredProperties.length} of {properties.length} properties
				</div>
			</div>
		</div>
	</div>

	<!-- Properties Grid -->
	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		{#if filteredProperties.length === 0}
			<div class="py-12 text-center">
				<div class="mb-4 text-6xl text-gray-400">🏠</div>
				<h3 class="mb-2 text-lg font-medium text-gray-900">No properties found</h3>
				<p class="text-gray-600">Try adjusting your search criteria or check back later.</p>
			</div>
		{:else}
			<div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each filteredProperties as property (property.id)}
					<div
						onclick={() => goto(`/properties/${property.id}`)}
						class="cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-shadow hover:shadow-md"
					>
						<!-- Property Image -->
						<div class="aspect-w-16 aspect-h-9 bg-gray-200">
							{#if property.media && property.media.length > 0}
								<img
									src={property.media[0].mediaUrl}
									alt={property.title}
									class="h-48 w-full object-cover"
								/>
							{:else}
								<div class="flex h-48 w-full items-center justify-center bg-gray-200">
									<span class="text-4xl text-gray-400">🏠</span>
								</div>
							{/if}
							<div class="absolute top-2 right-2">
								<span
									class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
										property.status || 'draft'
									)}"
								>
									{getStatusLabel(property.status || 'draft')}
								</span>
							</div>
						</div>

						<!-- Property Details -->
						<div class="p-4">
							<div class="mb-2 flex items-start justify-between">
								<h3 class="line-clamp-1 text-lg font-semibold text-gray-900">
									{property.title}
								</h3>
							</div>

							<p class="mb-3 line-clamp-2 text-sm text-gray-600">
								{property.description || 'No description available'}
							</p>

							<div class="mb-3 flex items-center text-sm text-gray-500">
								<span class="mr-4">📍 {property.location?.city || 'Location not specified'}</span>
							</div>

							<div class="mb-3 flex items-center justify-between text-sm text-gray-500">
								<div class="flex space-x-4">
									{#if property.bedrooms}
										<span>🛏️ {property.bedrooms} beds</span>
									{/if}
									{#if property.bathrooms}
										<span>🚿 {property.bathrooms} baths</span>
									{/if}
									{#if property.livingArea}
										<span>📏 {property.livingArea}m²</span>
									{/if}
								</div>
							</div>

							<div class="flex items-center justify-between">
								<span class="text-lg font-bold text-gray-900">
									{formatPrice(property.price)}
								</span>
								<span class="text-sm text-gray-500 capitalize">
									{property.propertyType}
								</span>
							</div>

							<!-- Action buttons for own properties -->
							{#if showUserActions && currentUserId === property.ownerId}
								<div class="mt-3 flex space-x-2">
									<button
										onclick={(e) => {
											e.stopPropagation();
											goto(`/properties/${property.id}/edit`);
										}}
										class="flex-1 rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
									>
										Edit
									</button>
									<button
										onclick={(e) => {
											e.stopPropagation();
											archiveProperty(property.id);
										}}
										class="flex-1 rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
									>
										Archive
									</button>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	.line-clamp-1 {
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 1;
	}

	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
		line-clamp: 2;
	}
</style>
