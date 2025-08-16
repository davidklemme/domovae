<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.png';
	import favicon16 from '$lib/assets/favicon-16x16.png';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="icon" type="image/png" sizes="16x16" href={favicon16} />
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<meta name="theme-color" content="#1e293b" />

	<!-- Basic SEO -->
	<meta name="robots" content="index, follow" />
	<meta name="language" content="en" />
	<meta name="author" content="Brickly" />

	<!-- Default Open Graph -->
	<meta property="og:site_name" content="Brickly" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:type" content="website" />

	<!-- Default Twitter -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@brickly" />
</svelte:head>

{@render children?.()}
