<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#1e293b" />

	<!-- Basic SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="author" content="Domovae" />

	<!-- Default Open Graph -->
	<meta property="og:site_name" content="Domovae" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:type" content="website" />

	<!-- Default Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@domovae" />
</svelte:head>

{@render children?.()}
