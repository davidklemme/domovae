<script lang="ts">
	import { goto } from '$app/navigation';

	export let propertyId: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let currentUser: any = null;
	export let propertyOwnerId: string = '';

	$: isOwner = currentUser?.id === propertyOwnerId;
	$: isBuyer = currentUser?.role === 'buyer' && !isOwner; // Only buyer if not the owner
	$: isAuthenticated = !!currentUser;
</script>

<div class="sticky top-24 rounded-xl bg-slate-900 p-4 text-white shadow-xl">
	{#if isAuthenticated}
		{#if isOwner}
			<button
				on:click={() => goto(`/availability/manage?propertyId=${propertyId}`)}
				class="w-full rounded-lg bg-black px-2 py-3 text-xl font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
			>
				📅 Manage Availability
			</button>
			<p class="mt-2 text-center text-xs text-slate-400">Set when you're available for viewings</p>
		{:else if isBuyer}
			<button
				on:click={() => goto(`/appointments/create?propertyId=${propertyId}`)}
				class="w-full rounded-lg bg-black px-2 py-3 text-xl font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
			>
				📅 Request Viewing
			</button>
		{:else}
			<div class="text-center">
				<p class="mb-2 text-xs text-slate-300">Contact the owner</p>
				<button
					on:click={() => {
						// TODO: Implement contact functionality
					}}
					class="w-full rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-xs text-white transition-colors hover:bg-white/20"
				>
					Send Message
				</button>
			</div>
		{/if}
	{:else}
		<div class="text-center">
			<p class="mb-3 text-xs text-slate-300">Sign in to schedule a viewing</p>
			<button
				on:click={() => goto('/auth/signin')}
				class="w-full rounded-lg bg-black px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:bg-slate-800 hover:shadow-xl"
			>
				Sign In
			</button>
		</div>
	{/if}
</div>
