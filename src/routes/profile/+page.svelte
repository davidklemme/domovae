<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	let isEditing = false;
	let formData = {
		name: '',
		phone: '',
		dateOfBirth: '',
		address: '',
		city: '',
		postalCode: '',
		country: 'Germany'
	};

	onMount(() => {
		// Redirect if not authenticated
		if (!$page.data.session) {
			goto('/auth/signin');
			return;
		}

		// Initialize form data with current user data
		const user = $page.data.session.user;
		formData = {
			name: user.name || '',
			phone: user.phone || '',
			dateOfBirth: user.dateOfBirth || '',
			address: user.address || '',
			city: user.city || '',
			postalCode: user.postalCode || '',
			country: user.country || 'Germany'
		};
	});

	async function handleSave() {
		// TODO: Implement profile update API call
		console.log('Saving profile:', formData);
		isEditing = false;
	}

	function handleCancel() {
		// Reset form data to current user data
		const user = $page.data.session?.user;
		if (user) {
			formData = {
				name: user.name || '',
				phone: user.phone || '',
				dateOfBirth: user.dateOfBirth || '',
				address: user.address || '',
				city: user.city || '',
				postalCode: user.postalCode || '',
				country: user.country || 'Germany'
			};
		}
		isEditing = false;
	}
</script>

<svelte:head>
	<title>Profile - Domovae</title>
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
	<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		{#if $page.data.session?.user}
			<div class="px-4 py-6 sm:px-0">
				<div class="rounded-lg bg-white shadow">
					<!-- Header -->
					<div class="px-4 py-5 sm:p-6">
						<div class="flex items-center justify-between">
							<div>
								<h3 class="text-lg leading-6 font-medium text-gray-900">Profile Information</h3>
								<p class="mt-1 max-w-2xl text-sm text-gray-500">
									Manage your account information and preferences.
								</p>
							</div>
							<div class="flex space-x-3">
								{#if isEditing}
									<button
										on:click={handleSave}
										class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
									>
										Save Changes
									</button>
									<button
										on:click={handleCancel}
										class="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
									>
										Cancel
									</button>
								{:else}
									<button
										on:click={() => (isEditing = true)}
										class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
									>
										Edit Profile
									</button>
								{/if}
							</div>
						</div>
					</div>

					<!-- Profile Content -->
					<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
							<!-- Account Information -->
							<div class="space-y-6">
								<div>
									<h4 class="text-lg font-medium text-gray-900">Account Information</h4>
									<div class="mt-4 space-y-4">
										<div>
											<label class="block text-sm font-medium text-gray-700">Email</label>
											<div class="mt-1">
												<input
													type="email"
													value={$page.data.session.user.email}
													disabled
													class="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Role</label>
											<div class="mt-1">
												<input
													type="text"
													value={$page.data.session.user.role}
													disabled
													class="block w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-gray-500 shadow-sm"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Name</label>
											<div class="mt-1">
												<input
													type="text"
													bind:value={formData.name}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Phone</label>
											<div class="mt-1">
												<input
													type="tel"
													bind:value={formData.phone}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Date of Birth</label>
											<div class="mt-1">
												<input
													type="date"
													bind:value={formData.dateOfBirth}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												/>
											</div>
										</div>
									</div>
								</div>
							</div>

							<!-- Address Information -->
							<div class="space-y-6">
								<div>
									<h4 class="text-lg font-medium text-gray-900">Address Information</h4>
									<div class="mt-4 space-y-4">
										<div>
											<label class="block text-sm font-medium text-gray-700">Address</label>
											<div class="mt-1">
												<textarea
													bind:value={formData.address}
													disabled={!isEditing}
													rows="3"
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												></textarea>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">City</label>
											<div class="mt-1">
												<input
													type="text"
													bind:value={formData.city}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Postal Code</label>
											<div class="mt-1">
												<input
													type="text"
													bind:value={formData.postalCode}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												/>
											</div>
										</div>

										<div>
											<label class="block text-sm font-medium text-gray-700">Country</label>
											<div class="mt-1">
												<select
													bind:value={formData.country}
													disabled={!isEditing}
													class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 disabled:bg-gray-50 disabled:text-gray-500"
												>
													<option value="Germany">Germany</option>
													<option value="Austria">Austria</option>
													<option value="Switzerland">Switzerland</option>
													<option value="Other">Other</option>
												</select>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
