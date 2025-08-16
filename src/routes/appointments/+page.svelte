<script lang="ts">
	import { goto } from '$app/navigation';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	export let data: PageData;
	export let form: unknown;

	let activeTab = data.role;
	let showNotesModal = false;
	let selectedAppointment: { ownerNotes?: string | null; buyerNotes?: string | null } | null = null;
	let notes = '';

	function formatPrice(price: number) {
		return new Intl.NumberFormat('de-DE', {
			style: 'currency',
			currency: 'EUR'
		}).format(price);
	}

	function formatDate(dateInput: string | Date) {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		return date.toLocaleDateString('en-US', {
			weekday: 'short',
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function formatTime(dateInput: string | Date) {
		const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
		return date.toLocaleTimeString('en-US', {
			hour: 'numeric',
			minute: '2-digit',
			hour12: true
		});
	}

	function getStatusColor(status: string | null) {
		switch (status) {
			case 'requested':
				return 'bg-yellow-100 text-yellow-800';
			case 'confirmed':
				return 'bg-green-100 text-green-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			case 'no_show':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusLabel(status: string | null) {
		switch (status) {
			case 'requested':
				return 'Pending';
			case 'confirmed':
				return 'Confirmed';
			case 'cancelled':
				return 'Cancelled';
			case 'completed':
				return 'Completed';
			case 'no_show':
				return 'No Show';
			default:
				return status || 'Unknown';
		}
	}

	function openNotesModal(appointment: { ownerNotes?: string | null; buyerNotes?: string | null }) {
		selectedAppointment = appointment;
		notes = appointment.ownerNotes || appointment.buyerNotes || '';
		showNotesModal = true;
	}

	function closeNotesModal() {
		showNotesModal = false;
		selectedAppointment = null;
		notes = '';
	}

	function switchTab(tab: 'buyer' | 'owner') {
		activeTab = tab;
		goto(`/appointments?role=${tab}`);
	}

	function _canManageAppointment(appointment: { ownerId: string; buyerId: string }) {
		if (activeTab === 'owner') {
			return appointment.ownerId === data.user.id;
		}
		return appointment.buyerId === data.user.id;
	}

	function canUpdateStatus(appointment: { ownerId: string }) {
		return activeTab === 'owner' && appointment.ownerId === data.user.id;
	}

	function canDeleteAppointment(appointment: { buyerId: string; status: string | null }) {
		return (
			activeTab === 'buyer' &&
			appointment.buyerId === data.user.id &&
			appointment.status === 'requested'
		);
	}

	$: filteredAppointments = data.appointments.filter((appointment) => {
		if (activeTab === 'buyer') {
			return appointment.buyerId === data.user.id;
		}
		return appointment.ownerId === data.user.id;
	});

	$: pendingAppointments = filteredAppointments.filter((a) => a.status === 'requested');
	$: confirmedAppointments = filteredAppointments.filter((a) => a.status === 'confirmed');
	$: completedAppointments = filteredAppointments.filter((a) => a.status === 'completed');
	$: cancelledAppointments = filteredAppointments.filter((a) => a.status === 'cancelled');
</script>

<svelte:head>
	<title>My Appointments | Domovae</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<button onclick={() => goto('/dashboard')} class="mr-4 text-gray-500 hover:text-gray-700">
						← Back to Dashboard
					</button>
					<h1 class="text-xl font-semibold text-gray-900">My Appointments</h1>
				</div>
			</div>
		</div>
	</nav>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<!-- Tab Navigation -->
		<div class="mb-8">
			<div class="border-b border-gray-200">
				<nav class="-mb-px flex space-x-8">
					<button
						onclick={() => switchTab('buyer')}
						class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'buyer'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						My Viewing Requests
					</button>
					<button
						onclick={() => switchTab('owner')}
						class="border-b-2 px-1 py-2 text-sm font-medium {activeTab === 'owner'
							? 'border-blue-500 text-blue-600'
							: 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
					>
						Property Viewing Requests
					</button>
				</nav>
			</div>
		</div>

		{#if form?.error}
			<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
				{form.error}
			</div>
		{/if}

		{#if form?.success}
			<div class="mb-4 rounded-lg bg-green-50 p-4 text-green-700">
				Appointment updated successfully!
			</div>
		{/if}

		<!-- Appointments List -->
		{#if filteredAppointments.length === 0}
			<div class="rounded-lg bg-white p-8 text-center shadow-sm">
				<div class="mb-4 text-6xl">📅</div>
				<h3 class="mb-2 text-lg font-medium text-gray-900">No appointments found</h3>
				<p class="text-gray-600">
					{activeTab === 'buyer'
						? "You haven't scheduled any property viewings yet."
						: "You don't have any viewing requests for your properties yet."}
				</p>
				{#if activeTab === 'buyer'}
					<button
						onclick={() => goto('/properties')}
						class="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Browse Properties
					</button>
				{/if}
			</div>
		{:else}
			<!-- Pending Appointments -->
			{#if pendingAppointments.length > 0}
				<div class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-gray-900">
						Pending ({pendingAppointments.length})
					</h2>
					<div class="space-y-4">
						{#each pendingAppointments as appointment (appointment.id)}
							<div class="rounded-lg border-l-4 border-yellow-400 bg-white p-6 shadow-sm">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center space-x-3">
											<h3 class="text-lg font-medium text-gray-900">
												{appointment.property?.title}
											</h3>
											<span
												class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													appointment.status
												)}"
											>
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<p class="mb-2 text-gray-600">
											{appointment.property?.location?.street}, {appointment.property?.location
												?.city}
										</p>

										<div class="mb-3 flex items-center space-x-4 text-sm text-gray-500">
											<span>📅 {formatDate(appointment.scheduledAt.toString())}</span>
											<span>🕐 {formatTime(appointment.scheduledAt.toString())}</span>
											<span>⏱️ {appointment.duration} minutes</span>
											<span>💰 {formatPrice(appointment.property?.price || 0)}</span>
										</div>

										{#if activeTab === 'owner'}
											<div class="mb-3 text-sm text-gray-600">
												Requested by: {appointment.buyer?.name || appointment.buyer?.email}
											</div>
										{:else}
											<div class="mb-3 text-sm text-gray-600">
												Property owner: {appointment.owner?.name || appointment.owner?.email}
											</div>
										{/if}

										{#if appointment.notes || appointment.buyerNotes}
											<div class="mb-3 text-sm text-gray-600">
												<strong>Notes:</strong>
												{appointment.notes || appointment.buyerNotes}
											</div>
										{/if}
									</div>

									<div class="ml-4 flex flex-col space-y-2">
										{#if canUpdateStatus(appointment)}
											<form
												method="POST"
												action="?/updateStatus"
												use:enhance
												class="flex space-x-2"
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<input type="hidden" name="status" value="confirmed" />
												<button
													type="submit"
													class="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
												>
													Confirm
												</button>
											</form>
											<form
												method="POST"
												action="?/updateStatus"
												use:enhance
												class="flex space-x-2"
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<input type="hidden" name="status" value="cancelled" />
												<button
													type="submit"
													class="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
												>
													Decline
												</button>
											</form>
										{/if}

										{#if canDeleteAppointment(appointment)}
											<form
												method="POST"
												action="?/deleteAppointment"
												use:enhance
												onsubmit={(e) => {
													if (!confirm('Are you sure you want to cancel this appointment?')) {
														e.preventDefault();
													}
												}}
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<button
													type="submit"
													class="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
												>
													Cancel
												</button>
											</form>
										{/if}

										<button
											onclick={() => openNotesModal(appointment)}
											class="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700"
										>
											Notes
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Confirmed Appointments -->
			{#if confirmedAppointments.length > 0}
				<div class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-gray-900">
						Confirmed ({confirmedAppointments.length})
					</h2>
					<div class="space-y-4">
						{#each confirmedAppointments as appointment (appointment.id)}
							<div class="rounded-lg border-l-4 border-green-400 bg-white p-6 shadow-sm">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center space-x-3">
											<h3 class="text-lg font-medium text-gray-900">
												{appointment.property?.title}
											</h3>
											<span
												class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													appointment.status
												)}"
											>
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<p class="mb-2 text-gray-600">
											{appointment.property?.location?.street}, {appointment.property?.location
												?.city}
										</p>

										<div class="mb-3 flex items-center space-x-4 text-sm text-gray-500">
											<span>📅 {formatDate(appointment.scheduledAt)}</span>
											<span>🕐 {formatTime(appointment.scheduledAt)}</span>
											<span>⏱️ {appointment.duration} minutes</span>
											<span>💰 {formatPrice(appointment.property?.price || 0)}</span>
										</div>

										{#if appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											<div class="mb-3 text-sm text-gray-600">
												<strong>Notes:</strong>
												{appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											</div>
										{/if}
									</div>

									<div class="ml-4 flex flex-col space-y-2">
										{#if canUpdateStatus(appointment)}
											<form
												method="POST"
												action="?/updateStatus"
												use:enhance
												class="flex space-x-2"
											>
												<input type="hidden" name="appointmentId" value={appointment.id} />
												<input type="hidden" name="status" value="completed" />
												<button
													type="submit"
													class="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700"
												>
													Mark Complete
												</button>
											</form>
										{/if}

										<button
											onclick={() => openNotesModal(appointment)}
											class="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700"
										>
											Notes
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Completed Appointments -->
			{#if completedAppointments.length > 0}
				<div class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-gray-900">
						Completed ({completedAppointments.length})
					</h2>
					<div class="space-y-4">
						{#each completedAppointments as appointment (appointment.id)}
							<div class="rounded-lg border-l-4 border-blue-400 bg-white p-6 shadow-sm">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center space-x-3">
											<h3 class="text-lg font-medium text-gray-900">
												{appointment.property?.title}
											</h3>
											<span
												class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													appointment.status
												)}"
											>
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<p class="mb-2 text-gray-600">
											{appointment.property?.location?.street}, {appointment.property?.location
												?.city}
										</p>

										<div class="mb-3 flex items-center space-x-4 text-sm text-gray-500">
											<span>📅 {formatDate(appointment.scheduledAt)}</span>
											<span>🕐 {formatTime(appointment.scheduledAt)}</span>
											<span>⏱️ {appointment.duration} minutes</span>
											<span>💰 {formatPrice(appointment.property?.price || 0)}</span>
										</div>

										{#if appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											<div class="mb-3 text-sm text-gray-600">
												<strong>Notes:</strong>
												{appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											</div>
										{/if}
									</div>

									<div class="ml-4 flex flex-col space-y-2">
										<button
											onclick={() => openNotesModal(appointment)}
											class="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700"
										>
											Notes
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Cancelled Appointments -->
			{#if cancelledAppointments.length > 0}
				<div class="mb-8">
					<h2 class="mb-4 text-lg font-semibold text-gray-900">
						Cancelled ({cancelledAppointments.length})
					</h2>
					<div class="space-y-4">
						{#each cancelledAppointments as appointment (appointment.id)}
							<div class="rounded-lg border-l-4 border-red-400 bg-white p-6 opacity-75 shadow-sm">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="mb-2 flex items-center space-x-3">
											<h3 class="text-lg font-medium text-gray-900">
												{appointment.property?.title}
											</h3>
											<span
												class="rounded-full px-2 py-1 text-xs font-medium {getStatusColor(
													appointment.status
												)}"
											>
												{getStatusLabel(appointment.status)}
											</span>
										</div>

										<p class="mb-2 text-gray-600">
											{appointment.property?.location?.street}, {appointment.property?.location
												?.city}
										</p>

										<div class="mb-3 flex items-center space-x-4 text-sm text-gray-500">
											<span>📅 {formatDate(appointment.scheduledAt)}</span>
											<span>🕐 {formatTime(appointment.scheduledAt)}</span>
											<span>⏱️ {appointment.duration} minutes</span>
											<span>💰 {formatPrice(appointment.property?.price || 0)}</span>
										</div>

										{#if appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											<div class="mb-3 text-sm text-gray-600">
												<strong>Notes:</strong>
												{appointment.notes || appointment.buyerNotes || appointment.ownerNotes}
											</div>
										{/if}
									</div>

									<div class="ml-4 flex flex-col space-y-2">
										<button
											onclick={() => openNotesModal(appointment)}
											class="rounded bg-gray-600 px-3 py-1 text-xs text-white hover:bg-gray-700"
										>
											Notes
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
</div>

<!-- Notes Modal -->
{#if showNotesModal && selectedAppointment}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex min-h-screen items-center justify-center p-4">
			<div class="fixed inset-0 bg-black opacity-50" onclick={closeNotesModal}></div>
			<div class="relative w-full max-w-md rounded-lg bg-white p-6">
				<h3 class="mb-4 text-lg font-medium text-gray-900">Appointment Notes</h3>
				<textarea
					bind:value={notes}
					rows="4"
					class="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
					placeholder="Add notes about this appointment..."
				></textarea>
				<div class="mt-4 flex justify-end space-x-3">
					<button
						onclick={closeNotesModal}
						class="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50"
					>
						Cancel
					</button>
					<button
						onclick={() => {
							// TODO: Implement notes update
							closeNotesModal();
						}}
						class="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
					>
						Save
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
