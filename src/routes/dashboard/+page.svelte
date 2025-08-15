<script lang="ts">
	import { page } from '$app/stores';
	import { signOut } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// Redirect if not authenticated
		if (!$page.data.session) {
			goto('/auth/signin');
		}
	});

	async function handleSignOut() {
		await signOut({ callbackUrl: '/' });
	}
</script>

<svelte:head>
	<title>Dashboard - Domovae</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
	<!-- Navigation -->
	<nav class="bg-white shadow">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 justify-between">
				<div class="flex items-center">
					<h1 class="text-xl font-semibold text-gray-900">Domovae</h1>
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
							<button on:click={handleSignOut} class="text-sm text-gray-500 hover:text-gray-700">
								Sign out
							</button>
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
				<div class="h-96 rounded-lg border-4 border-dashed border-gray-200 p-8">
					<div class="text-center">
						<h2 class="mb-4 text-2xl font-bold text-gray-900">
							Welcome, {$page.data.session.user.name || 'User'}!
						</h2>
						<p class="mb-6 text-gray-600">
							You are signed in as a <span class="font-semibold"
								>{$page.data.session.user.role}</span
							>
						</p>

						{#if $page.data.session.user.role === 'owner'}
							<div class="space-y-4">
								<p class="text-gray-600">As a property owner, you can:</p>
								<div class="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">Manage Properties</h3>
										<p class="text-sm text-gray-600">Create and edit your property listings</p>
									</div>
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">View Appointments</h3>
										<p class="text-sm text-gray-600">See and manage viewing requests</p>
									</div>
								</div>
							</div>
						{:else if $page.data.session.user.role === 'buyer'}
							<div class="space-y-4">
								<p class="text-gray-600">As a buyer, you can:</p>
								<div class="mx-auto grid max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">Browse Properties</h3>
										<p class="text-sm text-gray-600">Search and view available properties</p>
									</div>
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">Book Appointments</h3>
										<p class="text-sm text-gray-600">Schedule property viewings</p>
									</div>
								</div>
							</div>
						{:else if $page.data.session.user.role === 'admin'}
							<div class="space-y-4">
								<p class="text-gray-600">As an admin, you can:</p>
								<div class="mx-auto grid max-w-3xl grid-cols-1 gap-4 md:grid-cols-3">
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">Manage Users</h3>
										<p class="text-sm text-gray-600">View and manage user accounts</p>
									</div>
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">Moderate Properties</h3>
										<p class="text-sm text-gray-600">Review and approve listings</p>
									</div>
									<div class="rounded-lg border bg-white p-4">
										<h3 class="font-semibold text-gray-900">System Analytics</h3>
										<p class="text-sm text-gray-600">View platform statistics</p>
									</div>
								</div>
							</div>
						{/if}

						<div class="mt-8">
							<p class="text-sm text-gray-500">
								This is a placeholder dashboard. Property management features will be implemented in
								upcoming sprints.
							</p>
						</div>
					</div>
				</div>
			</div>
		{/if}
	</div>
</div>
