<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let data;

	let showAddForm = false;
	let message = '';
	let messageType = 'success'; // 'success' or 'error'
	let formData = {
		date: '',
		startTime: '09:00',
		endTime: '17:00',
		slotDuration: 30,
		notes: '',
		timezone: 'Europe/Berlin',
		isRecurring: false
	};

	// Set default date to tomorrow
	onMount(() => {
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		formData.date = tomorrow.toISOString().split('T')[0];
	});

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			weekday: 'long',
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	function formatTime(timeString: string) {
		return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	function handleAddWindow() {
		showAddForm = true;
	}

	function handleCancel() {
		showAddForm = false;
		// Reset form
		const tomorrow = new Date();
		tomorrow.setDate(tomorrow.getDate() + 1);
		formData = {
			date: tomorrow.toISOString().split('T')[0],
			startTime: '09:00',
			endTime: '17:00',
			slotDuration: 30,
			notes: '',
			timezone: 'Europe/Berlin',
			isRecurring: false
		};
	}
</script>

<svelte:head>
	<title>Manage Availability - Domovae</title>
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
					<a href="/profile" class="text-sm text-gray-500 hover:text-gray-700">Profile</a>
					<a href="/dashboard" class="text-sm text-gray-500 hover:text-gray-700">Dashboard</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Main Content -->
	<div class="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
		<div class="px-4 py-6 sm:px-0">
			<!-- Header -->
			<div class="mb-8">
				<div class="flex items-center justify-between">
					<div>
						<h1 class="text-3xl font-bold text-gray-900">Manage Availability</h1>
						<p class="mt-2 text-gray-600">Set when you're available for property viewings</p>
					</div>
					<button
						on:click={handleAddWindow}
						class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						➕ Add Time Slot
					</button>
				</div>

				<!-- Property Context -->
				{#if data.property}
					<div class="mt-4 rounded-lg bg-blue-50 p-4">
						<h3 class="text-sm font-medium text-blue-800">
							Managing availability for: {data.property.title}
						</h3>
						<p class="mt-1 text-sm text-blue-700">
							This will apply to all your properties, not just this one.
						</p>
					</div>
				{/if}
			</div>

			<!-- Message Display -->
			{#if message}
				<div
					class="mb-4 rounded-lg p-4 {messageType === 'success'
						? 'bg-green-50 text-green-800'
						: 'bg-red-50 text-red-800'}"
				>
					{message}
				</div>
			{/if}

			<!-- Add Availability Form -->
			{#if showAddForm}
				<div class="mb-8 rounded-lg bg-white p-6 shadow">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Add Availability Window</h3>

					<form
						method="POST"
						action="?/createWindow"
						use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									message = 'Availability window created successfully!';
									messageType = 'success';
									showAddForm = false;
									// Reset form
									const tomorrow = new Date();
									tomorrow.setDate(tomorrow.getDate() + 1);
									formData.date = tomorrow.toISOString().split('T')[0];
									formData.startTime = '09:00';
									formData.endTime = '17:00';
									formData.slotDuration = 30;
									formData.notes = '';
									formData.timezone = 'Europe/Berlin';
									formData.isRecurring = false;

									// Refresh the page to show the new data
									setTimeout(() => {
										window.location.reload();
									}, 1000);
								} else if (result.type === 'failure') {
									message =
										(result.data?.error as string) || 'Failed to create availability window';
									messageType = 'error';
								}
							};
						}}
					>
						<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							<div>
								<label for="date" class="block text-sm font-medium text-gray-700">Date</label>
								<input
									type="date"
									id="date"
									name="date"
									bind:value={formData.date}
									required
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>

							<div>
								<label for="startTime" class="block text-sm font-medium text-gray-700"
									>Start Time</label
								>
								<input
									type="time"
									id="startTime"
									name="startTime"
									bind:value={formData.startTime}
									required
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>

							<div>
								<label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label
								>
								<input
									type="time"
									id="endTime"
									name="endTime"
									bind:value={formData.endTime}
									required
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								/>
							</div>

							<div>
								<label for="slotDuration" class="block text-sm font-medium text-gray-700"
									>Slot Duration (minutes)</label
								>
								<select
									id="slotDuration"
									name="slotDuration"
									bind:value={formData.slotDuration}
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								>
									<option value={15}>15 minutes</option>
									<option value={30}>30 minutes</option>
									<option value={45}>45 minutes</option>
									<option value={60}>1 hour</option>
									<option value={90}>1.5 hours</option>
									<option value={120}>2 hours</option>
								</select>
							</div>

							<div>
								<label for="timezone" class="block text-sm font-medium text-gray-700"
									>Timezone</label
								>
								<select
									id="timezone"
									name="timezone"
									bind:value={formData.timezone}
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								>
									<option value="Europe/Berlin">Europe/Berlin</option>
									<option value="Europe/London">Europe/London</option>
									<option value="America/New_York">America/New_York</option>
									<option value="America/Los_Angeles">America/Los_Angeles</option>
								</select>
							</div>

							<div class="sm:col-span-2 lg:col-span-3">
								<label for="notes" class="block text-sm font-medium text-gray-700"
									>Notes (Optional)</label
								>
								<textarea
									id="notes"
									name="notes"
									bind:value={formData.notes}
									rows="3"
									placeholder="Any special notes about this time slot..."
									class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
								></textarea>
							</div>

							<div class="sm:col-span-2 lg:col-span-3">
								<div class="flex items-center">
									<input
										type="checkbox"
										id="isRecurring"
										name="isRecurring"
										bind:checked={formData.isRecurring}
										class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
									/>
									<label for="isRecurring" class="ml-2 block text-sm text-gray-700">
										Make this slot recurring (weekly)
									</label>
								</div>
							</div>
						</div>

						<div class="mt-6 flex justify-end space-x-3">
							<button
								type="button"
								on:click={handleCancel}
								class="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
							>
								Cancel
							</button>
							<button
								type="submit"
								class="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
							>
								Add Time Slot
							</button>
						</div>
					</form>
				</div>
			{/if}

			<!-- Availability Windows List -->
			<div class="rounded-lg bg-white shadow">
				<div class="px-4 py-5 sm:p-6">
					<h3 class="mb-4 text-lg font-medium text-gray-900">Your Availability Windows</h3>

					{#if data.availabilityWindows && data.availabilityWindows.length > 0}
						<div class="space-y-4">
							{#each data.availabilityWindows as window}
								<div
									class="flex items-center justify-between rounded-lg border border-gray-200 p-4"
								>
									<div class="flex-1">
										<div class="flex items-center space-x-4">
											<div class="text-sm">
												<div class="flex items-center space-x-2">
													<p class="font-medium text-gray-900">{formatDate(window.date)}</p>
													{#if window.isRecurring}
														<span class="text-indigo-600" title="Recurring slot">
															<svg
																class="h-4 w-4"
																fill="none"
																viewBox="0 0 24 24"
																stroke="currentColor"
															>
																<path
																	stroke-linecap="round"
																	stroke-linejoin="round"
																	stroke-width="2"
																	d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
																/>
															</svg>
														</span>
													{/if}
												</div>
												<p class="text-gray-500">
													{formatTime(window.startTime)} - {formatTime(window.endTime)}
												</p>
												<p class="text-gray-400">
													{window.slotDuration}min slots • {window.timezone}
												</p>
											</div>
											{#if window.notes}
												<div class="text-sm text-gray-600">
													<p class="font-medium">Notes:</p>
													<p>{window.notes}</p>
												</div>
											{/if}
										</div>
									</div>
									<div class="flex items-center space-x-2">
										<form method="POST" action="?/deleteWindow" use:enhance>
											<input type="hidden" name="windowId" value={window.id} />
											<button
												type="submit"
												class="rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-50 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:outline-none"
											>
												Delete
											</button>
										</form>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="py-8 text-center">
							<div class="mb-4 text-gray-400">
								<svg
									class="mx-auto h-12 w-12"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
									/>
								</svg>
							</div>
							<h3 class="mb-2 text-lg font-medium text-gray-900">No availability windows set</h3>
							<p class="mb-4 text-gray-500">
								Add your first time slot to start receiving viewing requests.
							</p>
							<button
								on:click={handleAddWindow}
								class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
							>
								Add Your First Time Slot
							</button>
						</div>
					{/if}
				</div>
			</div>

			<!-- Calendar Export Info -->
			<div class="mt-8 rounded-lg bg-blue-50 p-6">
				<h3 class="mb-2 text-lg font-medium text-blue-900">Calendar Integration</h3>
				<p class="mb-4 text-blue-700">
					Soon you'll be able to subscribe to your availability calendar to automatically block
					these times in your personal calendar.
				</p>
				<div class="text-sm text-blue-600">
					<p>• iCal feed for Google Calendar, Outlook, and other calendar apps</p>
					<p>• Automatic sync when you add or remove time slots</p>
					<p>• Real-time availability updates for buyers</p>
				</div>
			</div>
		</div>
	</div>
</div>
