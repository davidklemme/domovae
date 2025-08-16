<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
	import type { PageData } from './$types';
	import PropertyList from '$lib/components/PropertyList.svelte';

	export let data: PageData;

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
					{#if data.session?.user}
						<div class="flex items-center space-x-3">
							{#if data.session.user.image}
								<img
									class="h-8 w-8 rounded-full"
									src={data.session.user.image}
									alt={data.session.user.name || 'User'}
								/>
							{/if}
							<span class="text-sm text-gray-700">
								{data.session.user.name || data.session.user.email}
							</span>
							<a href="/profile" class="text-sm text-gray-500 hover:text-gray-700"> Profile </a>
							<button onclick={handleSignOut} class="text-sm text-gray-500 hover:text-gray-700">
								Sign out
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</nav>

	<!-- Header -->
	<div class="border-b bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<div>
					<h1 class="text-3xl font-bold text-gray-900">My Dashboard</h1>
					<p class="mt-2 text-gray-600">Manage your properties and view listings</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Property List -->
	<PropertyList
		properties={data.properties}
		showAddButton={true}
		showUserActions={true}
		currentUserId={data.session?.user?.id}
	/>
</div>
