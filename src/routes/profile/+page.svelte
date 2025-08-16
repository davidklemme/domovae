<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { enhance } from '$app/forms';
	import BuyerProfileForm from '$lib/components/BuyerProfileForm.svelte';
	import type { BuyerProfile, CreateBuyerProfileData } from '$lib/types/property';

	export let data;

	let buyerProfile: BuyerProfile | null = null;
	let isLoadingBuyerProfile = false;
	let isSavingBuyerProfile = false;
	let buyerProfileError = '';
	let buyerProfileSuccess = '';
	let isSavingProfile = false;
	let profileSaveMessage = '';

	let formData = {
		name: '',
		phone: '',
		dateOfBirth: '',
		address: '',
		city: '',
		postalCode: '',
		country: 'Germany'
	};

	onMount(async () => {
		// Redirect if not authenticated
		if (!$page.data.session) {
			goto('/auth/signin');
			return;
		}

		// Initialize form data with current user data
		const user = $page.data.user; // Use the user data from the server load function
		formData = {
			name: user.name || '',
			phone: user.phone || '',
			dateOfBirth: user.dateOfBirth || '',
			address: user.address || '',
			city: user.city || '',
			postalCode: user.postalCode || '',
			country: user.country || 'Germany'
		};

		// Load buyer profile if user is a buyer
		if (user.role === 'buyer') {
			await loadBuyerProfile();
		}
	});

	async function loadBuyerProfile() {
		isLoadingBuyerProfile = true;
		buyerProfileError = '';

		try {
			const response = await fetch('/api/buyer-profile');
			const result = await response.json();

			if (response.ok) {
				buyerProfile = result.profile;
			} else {
				buyerProfileError = result.error || 'Fehler beim Laden des Käufer-Profils';
			}
		} catch (err) {
			buyerProfileError = 'Netzwerkfehler beim Laden des Käufer-Profils';
			console.error('Error loading buyer profile:', err);
		} finally {
			isLoadingBuyerProfile = false;
		}
	}

	async function handleBuyerProfileSave(data: CreateBuyerProfileData) {
		isSavingBuyerProfile = true;
		buyerProfileError = '';
		buyerProfileSuccess = '';

		try {
			const formData = new FormData();

			// Add form fields
			formData.append('equityBand', data.equityBand);
			formData.append('timeline', data.timeline);
			formData.append('purpose', data.purpose);
			formData.append('schufaAvailable', data.schufaAvailable.toString());
			formData.append('consentGiven', data.consentGiven.toString());

			if (data.householdSize) {
				formData.append('householdSize', data.householdSize.toString());
			}

			if (data.financingDoc) {
				formData.append('financingDoc', data.financingDoc);
			}

			const response = await fetch('/api/buyer-profile', {
				method: 'POST',
				body: formData
			});

			const result = await response.json();

			if (response.ok) {
				buyerProfile = result.profile;
				buyerProfileSuccess = 'Käufer-Profil erfolgreich gespeichert!';

				// Clear success message after 3 seconds
				setTimeout(() => {
					buyerProfileSuccess = '';
				}, 3000);
			} else {
				buyerProfileError = result.error || 'Fehler beim Speichern des Käufer-Profils';
			}
		} catch (err) {
			buyerProfileError = 'Netzwerkfehler beim Speichern des Käufer-Profils';
			console.error('Error saving buyer profile:', err);
		} finally {
			isSavingBuyerProfile = false;
		}
	}

	async function _handleProfileUpdate() {
		// This will be handled by the form action
	}

	// Auto-save functionality
	let saveTimeout: NodeJS.Timeout;

	function handleFieldChange() {
		// Clear existing timeout
		if (saveTimeout) {
			clearTimeout(saveTimeout);
		}

		// Set new timeout to save after 1 second of no changes
		saveTimeout = setTimeout(() => {
			const form = document.getElementById('profile-form') as HTMLFormElement;
			if (form) {
				form.requestSubmit();
			}
		}, 1000);
	}

	async function handleCancelAppointment(appointmentId: number) {
		if (!confirm('Are you sure you want to cancel this viewing request?')) {
			return;
		}

		try {
			const response = await fetch(`/api/appointments/${appointmentId}`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				}
			});

			if (response.ok) {
				// Refresh the page to show updated data
				window.location.reload();
			} else {
				const error = await response.json();
				alert(`Failed to cancel appointment: ${error.error || 'Unknown error'}`);
			}
		} catch (error) {
			console.error('Error canceling appointment:', error);
			alert('Failed to cancel appointment. Please try again.');
		}
	}
</script>

<svelte:head>
	<title>Profile - Brickly</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<a href="/dashboard" class="text-xl font-semibold text-gray-900">Brickly</a>
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
								<button
									type="submit"
									form="profile-form"
									disabled={isSavingProfile}
									on:click={() => {
										// If user is a buyer, also save buyer profile
										if ($page.data.session?.user?.role === 'buyer') {
											// Trigger buyer profile save after a short delay
											setTimeout(() => {
												const buyerForm = document.querySelector('[data-buyer-profile-form]');
												if (buyerForm) {
													// This will be handled by the form submission
												}
											}, 100);
										}
									}}
									class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								>
									{#if isSavingProfile}
										<div class="flex items-center space-x-2">
											<div
												class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
											></div>
											<span>Saving...</span>
										</div>
									{:else}
										Save Changes
									{/if}
								</button>
							</div>
						</div>

						<!-- Save Message -->
						{#if profileSaveMessage}
							<div class="px-4 pb-4 sm:px-6">
								{#if profileSaveMessage.includes('successfully')}
									<div class="rounded-md bg-green-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<span class="text-green-400">✓</span>
											</div>
											<div class="ml-3">
												<p class="text-sm text-green-800">{profileSaveMessage}</p>
											</div>
										</div>
									</div>
								{:else}
									<div class="rounded-md bg-red-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<span class="text-red-400">⚠️</span>
											</div>
											<div class="ml-3">
												<p class="text-sm text-red-800">{profileSaveMessage}</p>
											</div>
										</div>
									</div>
								{/if}
							</div>
						{/if}
					</div>

					<!-- Profile Content -->
					<form
						id="profile-form"
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							return async ({ result, update: _update }) => {
								isSavingProfile = true;
								profileSaveMessage = '';

								try {
									if (result.type === 'success') {
										profileSaveMessage = 'Profile saved successfully!';
										console.log('Profile saved successfully');

										// Update form data with the returned user data to ensure consistency
										if (result.data?.user) {
											const user = result.data.user as Record<string, unknown>;
											formData = {
												name: (user.name as string) || '',
												phone: (user.phone as string) || '',
												dateOfBirth: (user.dateOfBirth as string) || '',
												address: (user.address as string) || '',
												city: (user.city as string) || '',
												postalCode: (user.postalCode as string) || '',
												country: (user.country as string) || 'Germany'
											};
										}
									} else if (result.type === 'failure') {
										profileSaveMessage = (result.data?.error as string) || 'Failed to save profile';
									}
								} finally {
									isSavingProfile = false;
									// Clear success message after 3 seconds
									if (profileSaveMessage && profileSaveMessage.includes('successfully')) {
										setTimeout(() => {
											profileSaveMessage = '';
										}, 3000);
									}
								}
							};
						}}
					>
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
														name="name"
														bind:value={formData.name}
														on:input={handleFieldChange}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
											</div>

											<div>
												<label class="block text-sm font-medium text-gray-700">Phone</label>
												<div class="mt-1">
													<input
														type="tel"
														name="phone"
														bind:value={formData.phone}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
											</div>

											<div>
												<label class="block text-sm font-medium text-gray-700">Date of Birth</label>
												<div class="mt-1">
													<input
														type="date"
														name="dateOfBirth"
														bind:value={formData.dateOfBirth}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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
														name="address"
														bind:value={formData.address}
														rows="3"
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													></textarea>
												</div>
											</div>

											<div>
												<label class="block text-sm font-medium text-gray-700">City</label>
												<div class="mt-1">
													<input
														type="text"
														name="city"
														bind:value={formData.city}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
											</div>

											<div>
												<label class="block text-sm font-medium text-gray-700">Postal Code</label>
												<div class="mt-1">
													<input
														type="text"
														name="postalCode"
														bind:value={formData.postalCode}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
													/>
												</div>
											</div>

											<div>
												<label class="block text-sm font-medium text-gray-700">Country</label>
												<div class="mt-1">
													<select
														name="country"
														bind:value={formData.country}
														class="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
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

						<!-- Buyer Profile Section -->
						{#if $page.data.session?.user?.role === 'buyer'}
							<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
								<h4 class="text-lg font-medium text-gray-900">Käufer-Profil</h4>
								<p class="mt-1 text-sm text-gray-500">
									Erstellen Sie Ihr Käufer-Profil, um Verkäufern Ihre Ernsthaftigkeit zu zeigen.
								</p>

								{#if buyerProfileError}
									<div class="mt-4 rounded-md bg-red-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<span class="text-red-400">⚠️</span>
											</div>
											<div class="ml-3">
												<p class="text-sm text-red-800">{buyerProfileError}</p>
											</div>
										</div>
									</div>
								{/if}

								{#if buyerProfileSuccess}
									<div class="mt-4 rounded-md bg-green-50 p-4">
										<div class="flex">
											<div class="flex-shrink-0">
												<span class="text-green-400">✓</span>
											</div>
											<div class="ml-3">
												<p class="text-sm text-green-800">{buyerProfileSuccess}</p>
											</div>
										</div>
									</div>
								{/if}

								{#if isLoadingBuyerProfile}
									<div class="mt-4 flex items-center justify-center py-8">
										<div
											class="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent"
										></div>
										<span class="ml-2 text-gray-600">Lade Käufer-Profil...</span>
									</div>
								{:else}
									<div class="mt-4" data-buyer-profile-form>
										<BuyerProfileForm
											profile={buyerProfile}
											isLoading={isSavingBuyerProfile}
											onSave={handleBuyerProfileSave}
										/>
									</div>
								{/if}
							</div>
						{/if}

						<!-- Availability Management for Property Owners -->
						{#if data.hasProperties}
							<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
								<h4 class="text-lg font-medium text-gray-900">Availability Management</h4>
								<p class="mt-1 text-sm text-gray-500">
									Manage your viewing availability for all properties.
								</p>
								<div class="mt-4">
									<a
										href="/availability/manage"
										class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
									>
										📅 Manage Availability
									</a>
								</div>
							</div>
						{/if}

						<!-- Appointments Section -->
						<div class="border-t border-gray-200 px-4 py-5 sm:p-6">
							<div class="space-y-6">
								<!-- Buyer Appointments -->
								{#if data.buyerAppointments && data.buyerAppointments.length > 0}
									<div>
										<h4 class="text-lg font-medium text-gray-900">My Viewing Requests</h4>
										<p class="mt-1 text-sm text-gray-500">
											Appointments you've requested as a buyer.
										</p>
										<div class="mt-4 space-y-4">
											{#each data.buyerAppointments as appointment (appointment.id)}
												<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
													<div class="flex items-center justify-between">
														<div class="flex-1">
															<h5 class="font-medium text-gray-900">
																{appointment.property?.title || 'Property'}
															</h5>
															<p class="text-sm text-gray-600">
																{new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
																	weekday: 'long',
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric'
																})} at {new Date(appointment.scheduledAt).toLocaleTimeString(
																	'en-US',
																	{
																		hour: '2-digit',
																		minute: '2-digit'
																	}
																)}
															</p>
															<p class="text-sm text-gray-500">
																Duration: {appointment.duration} minutes • Type: {appointment.type}
															</p>
															{#if appointment.notes}
																<p class="mt-2 text-sm text-gray-600">
																	<strong>Notes:</strong>
																	{appointment.notes}
																</p>
															{/if}
														</div>
														<div class="ml-4 flex items-center space-x-2">
															<span
																class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {(appointment.status ||
																	'') === 'confirmed'
																	? 'bg-green-100 text-green-800'
																	: (appointment.status || '') === 'requested'
																		? 'bg-yellow-100 text-yellow-800'
																		: (appointment.status || '') === 'cancelled'
																			? 'bg-red-100 text-red-800'
																			: 'bg-gray-100 text-gray-800'}"
															>
																{(appointment.status || 'Unknown').charAt(0).toUpperCase() +
																	(appointment.status || 'Unknown').slice(1)}
															</span>
															{#if (appointment.status || '') === 'requested'}
																<button
																	on:click={() => handleCancelAppointment(appointment.id)}
																	class="inline-flex items-center rounded-md border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
																>
																	Cancel
																</button>
															{/if}
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- Owner Appointments -->
								{#if data.ownerAppointments && data.ownerAppointments.length > 0}
									<div>
										<h4 class="text-lg font-medium text-gray-900">Property Viewing Requests</h4>
										<p class="mt-1 text-sm text-gray-500">
											Appointments requested for your properties.
										</p>
										<div class="mt-4 space-y-4">
											{#each data.ownerAppointments as appointment (appointment.id)}
												<div class="rounded-lg border border-gray-200 bg-gray-50 p-4">
													<div class="flex items-center justify-between">
														<div class="flex-1">
															<h5 class="font-medium text-gray-900">
																{appointment.property?.title || 'Property'}
															</h5>
															<p class="text-sm text-gray-600">
																Requested by: {appointment.buyer?.name ||
																	appointment.buyer?.email ||
																	'Unknown'}
															</p>
															<p class="text-sm text-gray-600">
																{new Date(appointment.scheduledAt).toLocaleDateString('en-US', {
																	weekday: 'long',
																	year: 'numeric',
																	month: 'long',
																	day: 'numeric'
																})} at {new Date(appointment.scheduledAt).toLocaleTimeString(
																	'en-US',
																	{
																		hour: '2-digit',
																		minute: '2-digit'
																	}
																)}
															</p>
															<p class="text-sm text-gray-500">
																Duration: {appointment.duration} minutes • Type: {appointment.type}
															</p>
															{#if appointment.notes}
																<p class="mt-2 text-sm text-gray-600">
																	<strong>Notes:</strong>
																	{appointment.notes}
																</p>
															{/if}
														</div>
														<div class="ml-4">
															<span
																class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium {(appointment.status ||
																	'') === 'confirmed'
																	? 'bg-green-100 text-green-800'
																	: (appointment.status || '') === 'requested'
																		? 'bg-yellow-100 text-yellow-800'
																		: (appointment.status || '') === 'cancelled'
																			? 'bg-red-100 text-red-800'
																			: 'bg-gray-100 text-gray-800'}"
															>
																{(appointment.status || 'Unknown').charAt(0).toUpperCase() +
																	(appointment.status || 'Unknown').slice(1)}
															</span>
														</div>
													</div>
												</div>
											{/each}
										</div>
									</div>
								{/if}

								<!-- No Appointments Message -->
								{#if (!data.buyerAppointments || data.buyerAppointments.length === 0) && (!data.ownerAppointments || data.ownerAppointments.length === 0)}
									<div class="py-8 text-center">
										<div class="mb-4 text-6xl text-gray-400">📅</div>
										<h4 class="text-lg font-medium text-gray-900">No Appointments Yet</h4>
										<p class="mt-1 text-sm text-gray-500">
											You haven't scheduled any viewings yet. Start by browsing properties and
											requesting viewings.
										</p>
										<div class="mt-4">
											<a
												href="/properties"
												class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
											>
												Browse Properties
											</a>
										</div>
									</div>
								{/if}
							</div>
						</div>
					</form>
				</div>
			</div>
		{/if}
	</div>
</div>
