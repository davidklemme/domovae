<script lang="ts">
	import type { PageData } from './$types';
	import PropertyList from '$lib/components/PropertyList.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>Properties - Brickly</title>
</svelte:head>

<PropertyList
	properties={data.properties}
	showAddButton={!!data.session?.user}
	showUserActions={false}
	currentUserId={data.session?.user?.id}
/>
