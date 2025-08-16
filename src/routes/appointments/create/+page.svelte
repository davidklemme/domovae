<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form: { success?: boolean; error?: string } | undefined;

	let selectedDate = '';
	let selectedTime = '';
	let selectedDuration = 60;
	let selectedType = 'viewing';
	let notes = '';
	let isLoading = false;
	let availableTimeSlots: Array<{
		startTime: string;
		endTime: string;
		isAvailable: boolean;
		timezone?: string;
	}> = [];
	let loadingSlots = false;
	let availableDates: string[] = [];
	let loadingDates = false;

	// Function to format time in user's timezone
	function formatTimeInUserTimezone(
		timeString: string,
		dateString: string,
		_ownerTimezone: string = 'Europe/Berlin'
	): string {
		try {
			// Create a date object with the time in the owner's timezone
			const dateTimeString = `${dateString}T${timeString}:00`;
			const date = new Date(dateTimeString);

			// Format the time in the user's local timezone
			return date.toLocaleTimeString('en-US', {
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
				timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
			});
		} catch (error) {
			console.error('Error formatting time:', error);
			return timeString; // Fallback to original time string
		}
	}

	// Generate date range (next 30 days)
	const generateDateRange = () => {
		const baseDate = new Date();
		const dates = Array.from({ length: 30 }, (_, i) => {
			const date = new Date(baseDate.getTime() + (i + 1) * 24 * 60 * 60 * 1000); // Start from tomorrow
			return date.toISOString().split('T')[0];
		});
		return dates;
	};

	// Fetch available dates for the property owner
	async function fetchAvailableDates() {
		loadingDates = true;
		try {
			const dateRange = generateDateRange();
			const startDate = dateRange[0];
			const endDate = dateRange[dateRange.length - 1];

			const response = await fetch(
				`/api/properties/${data.property.id}/available-dates?startDate=${startDate}&endDate=${endDate}`
			);
			const result = await response.json();

			if (response.ok) {
				availableDates = result.availableDates || [];
			} else {
				console.error('Error fetching available dates:', result.error);
				availableDates = [];
			}
		} catch (error) {
			console.error('Error fetching available dates:', error);
			availableDates = [];
		} finally {
			loadingDates = false;
		}
	}

	// Fetch available time slots for selected date
	async function fetchAvailableSlots(date: string) {
		if (!date) {
			availableTimeSlots = [];
			return;
		}

		loadingSlots = true;
		try {
			const response = await fetch(`/api/properties/${data.property.id}/timeslots?date=${date}`);
			const result = await response.json();

			if (response.ok) {
				availableTimeSlots = result.availableSlots || [];
			} else {
				console.error('Error fetching time slots:', result.error);
				availableTimeSlots = [];
			}
		} catch (error) {
			console.error('Error fetching time slots:', error);
			availableTimeSlots = [];
		} finally {
			loadingSlots = false;
		}
	}

	// Fetch available dates on component mount
	onMount(() => {
		fetchAvailableDates();
	});

	// Watch for date changes
	$: if (selectedDate) {
		fetchAvailableSlots(selectedDate);
		selectedTime = ''; // Reset time when date changes
	}

	const durationOptions = [
		{ value: 30, label: '30 minutes' },
		{ value: 60, label: '1 hour' },
		{ value: 90, label: '1.5 hours' },
		{ value: 120, label: '2 hours' }
	];

	const typeOptions = [
		{ value: 'viewing', label: 'Property Viewing' },
		{ value: 'consultation', label: 'Consultation' },
		{ value: 'negotiation', label: 'Negotiation' }
	];

	function formatPrice(price: number) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(price);
	}

	function _handleSubmit() {
		if (!selectedDate || !selectedTime) {
			alert('Please select a date and time');
			return;
		}
		isLoading = true;
	}

	function goBack() {
		goto(`/properties/${data.property.id}`);
	}
</script>

<svelte:head>
	<title>Schedule Viewing - {data.property.title} | Brickly</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<button on:click={goBack} class="mr-4 text-gray-500 hover:text-gray-700"> ← Back </button>
					<h1 class="text-xl font-semibold text-gray-900">Schedule Viewing</h1>
				</div>
			</div>
		</div>
	</nav>

	<div class="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Property Summary -->
		<div class="mb-8 rounded-lg bg-white p-6 shadow-sm">
			<div class="flex items-start space-x-4">
				<div class="flex h-24 w-32 items-center justify-center rounded-lg bg-gray-200">
					<span class="text-2xl">🏠</span>
				</div>
				<div class="flex-1">
					<h2 class="text-xl font-semibold text-gray-900">{data.property.title}</h2>
					<p class="text-gray-600">
						{data.property.location?.street}, {data.property.location?.city}
					</p>
					<div class="mt-2 flex items-center justify-between">
						<span class="text-lg font-bold text-gray-900">
							{formatPrice(data.property.price)}
						</span>
						<span class="text-sm text-gray-500 capitalize">
							{data.property.propertyType}
						</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Appointment Form -->
		<div class="rounded-lg bg-white p-6 shadow-sm">
			<h3 class="mb-6 text-lg font-semibold text-gray-900">Schedule Your Viewing</h3>

			<!-- Form will be shown here -->
			<form
				method="POST"
				use:enhance={() => {
					return async ({ result, formData }) => {
						console.log('Form submitted with data:', Object.fromEntries(formData));
						isLoading = true;

						if (result.type === 'success') {
							console.log('Form submission successful:', result);
							isLoading = false;
							// Show success message
							alert('Appointment scheduled successfully!');
							// Redirect to profile page
							goto('/profile');
						} else if (result.type === 'failure') {
							console.error('Form submission failed:', result);
							isLoading = false;
							// Show error message
							alert('Failed to schedule appointment. Please try again.');
						}
					};
				}}
				class="space-y-6"
			>
				<input type="hidden" name="propertyId" value={data.property.id} />

				<!-- Date Selection -->
				<div>
					<label for="date" class="block text-sm font-medium text-gray-700"> Select Date </label>
					{#if loadingDates}
						<div
							class="mt-1 flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-gray-500"
						>
							Loading available dates...
						</div>
					{:else if availableDates.length === 0}
						<div class="mt-1 rounded-md border border-gray-300 px-3 py-2 text-gray-500">
							No available dates found. The property owner may not have set their availability yet.
						</div>
					{:else}
						<select
							id="date"
							name="date"
							bind:value={selectedDate}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Choose a date</option>
							{#each availableDates as date (date)}
								<option value={date}>
									{new Date(date).toLocaleDateString('en-US', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric'
									})}
								</option>
							{/each}
						</select>
					{/if}

					{#if availableDates.length > 0}
						<p class="mt-1 text-sm text-gray-500">
							Showing {availableDates.length} available date{availableDates.length !== 1 ? 's' : ''}
						</p>
					{/if}
				</div>

				<!-- Time Selection -->
				<div>
					<label for="time" class="block text-sm font-medium text-gray-700">
						Select Start Time
					</label>
					{#if loadingSlots}
						<div
							class="mt-1 flex items-center justify-center rounded-md border border-gray-300 px-3 py-2 text-gray-500"
						>
							Loading available start times...
						</div>
					{:else if availableTimeSlots.filter((slot) => slot.isAvailable).length === 0 && selectedDate}
						<div class="mt-1 rounded-md border border-gray-300 px-3 py-2 text-gray-500">
							No available time slots for this date. Please select a different date.
						</div>
					{:else if availableTimeSlots.filter((slot) => slot.isAvailable).length > 0}
						<select
							id="time"
							name="time"
							bind:value={selectedTime}
							required
							class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
						>
							<option value="">Choose a time</option>
							{#each availableTimeSlots.filter((slot) => slot.isAvailable) as slot (slot.startTime)}
								<option value={slot.startTime}>
									{formatTimeInUserTimezone(slot.startTime, selectedDate, slot.timezone)}
								</option>
							{/each}
						</select>
					{/if}

					{#if selectedDate && availableTimeSlots.filter((slot) => slot.isAvailable).length > 0}
						<p class="mt-1 text-sm text-gray-500">
							Showing {availableTimeSlots.filter((slot) => slot.isAvailable).length} available starting
							times (in your timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone})
						</p>
					{/if}
				</div>

				<!-- Duration Selection -->
				<div>
					<label for="duration" class="block text-sm font-medium text-gray-700"> Duration </label>
					<select
						id="duration"
						name="duration"
						bind:value={selectedDuration}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
					>
						{#each durationOptions as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Type Selection -->
				<div>
					<label for="type" class="block text-sm font-medium text-gray-700">
						Appointment Type
					</label>
					<select
						id="type"
						name="type"
						bind:value={selectedType}
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
					>
						{#each typeOptions as option (option.value)}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<!-- Notes -->
				<div>
					<label for="notes" class="block text-sm font-medium text-gray-700">
						Additional Notes (Optional)
					</label>
					<textarea
						id="notes"
						name="notes"
						bind:value={notes}
						rows="4"
						placeholder="Any special requests or questions for the property owner..."
						class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
					></textarea>
				</div>

				<!-- Buyer Profile Notice -->
				<div class="rounded-lg bg-blue-50 p-4">
					<div class="flex items-start space-x-3">
						<div class="flex-shrink-0">
							<span class="text-blue-600">💡</span>
						</div>
						<div class="flex-1">
							<h4 class="text-sm font-medium text-blue-900">Buyer-Profil</h4>
							<p class="mt-1 text-sm text-blue-800">
								Update your profile to show sellers that you are serious and get faster responses.
								Your profile will be automatically linked to this request.
							</p>
							<div class="mt-3">
								<a
									href="/profile"
									class="text-sm font-medium text-blue-600 underline hover:text-blue-500"
								>
									Update relevant buyer information in your profile →
								</a>
							</div>
						</div>
					</div>
				</div>

				<!-- Hidden field for scheduledAt -->
				<input
					type="hidden"
					name="scheduledAt"
					value={selectedDate && selectedTime ? `${selectedDate}T${selectedTime}:00` : ''}
				/>

				<!-- Submit Button -->
				<div class="flex justify-end space-x-4">
					<button
						type="button"
						on:click={goBack}
						class="rounded-lg border border-gray-300 px-6 py-2 text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						type="submit"
						disabled={isLoading || !selectedDate || !selectedTime}
						class="flex items-center space-x-2 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
					>
						{#if isLoading}
							<div
								class="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
							></div>
							<span>Scheduling...</span>
						{:else}
							<span>Schedule Viewing</span>
						{/if}
					</button>
				</div>
			</form>
		</div>

		<!-- Information -->
		<div class="mt-8 rounded-lg bg-blue-50 p-6">
			<h4 class="mb-3 text-lg font-medium text-blue-900">What happens next?</h4>
			<ul class="space-y-2 text-sm text-blue-800">
				<li>• Your viewing request will be sent to the property owner</li>
				<li>• The owner will review and confirm your appointment</li>
				<li>• You'll receive a confirmation email once approved</li>
				<li>• You can manage all your appointments in your dashboard</li>
			</ul>
		</div>
	</div>
</div>
