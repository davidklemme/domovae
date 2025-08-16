<script lang="ts">
	import type { BuyerProfile, BuyerProfileSnapshot, TrustBadge } from '$lib/types/property';
	import { BuyerProfileService } from '$lib/server/services/buyer-profile-service';

	export let profile: BuyerProfile | BuyerProfileSnapshot;
	export let showLabels = true;
	export let compact = false;

	let badges: TrustBadge[] = [];

	$: if (profile) {
		badges = BuyerProfileService.generateTrustBadges(profile);
	}
</script>

{#if badges.length > 0}
	<div class="flex flex-wrap gap-2">
		{#each badges as badge (badge.type)}
			<div
				class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium {badge.color} {compact
					? 'px-2 py-0.5'
					: ''}"
				title={badge.description}
			>
				<span class="mr-1">{badge.icon}</span>
				{#if showLabels}
					<span>{badge.label}</span>
				{/if}
			</div>
		{/each}
	</div>
{:else}
	<div class="text-sm text-gray-500 italic">Keine Käufer-Informationen verfügbar</div>
{/if}
