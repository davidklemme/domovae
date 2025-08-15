<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	onMount(() => {
		// If user is already authenticated, redirect to dashboard
		if ($page.data.session) {
			goto('/dashboard');
		}
	});
</script>

<svelte:head>
	<title>Domovae - Find Your Perfect Home</title>
	<meta
		name="description"
		content="Discover beautiful properties for sale. Connect with sellers and find your dream home."
	/>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
	<!-- Navigation -->
	<nav class="bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="flex h-16 items-center justify-between">
				<div class="flex items-center">
					<h1 class="text-2xl font-bold text-indigo-600">Domovae</h1>
				</div>
				<div class="flex items-center space-x-4">
					<a
						href="/auth/signin"
						class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
					>
						Sign In
					</a>
				</div>
			</div>
		</div>
	</nav>

	<!-- Hero Section -->
	<div class="relative overflow-hidden">
		<div class="mx-auto max-w-7xl">
			<div class="relative z-10 pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
				<main
					class="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28"
				>
					<div class="sm:text-center lg:text-left">
						<h1
							class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
						>
							<span class="block xl:inline">Find Your Perfect</span>
							<span class="block text-indigo-600 xl:inline">Home</span>
						</h1>
						<p
							class="mt-3 text-base text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 md:text-xl lg:mx-0"
						>
							Discover beautiful properties for sale. Connect directly with sellers and find your
							dream home with our trusted platform.
						</p>
						<div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
							<div class="rounded-md shadow">
								<a
									href="/auth/signin"
									class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-600 px-8 py-3 text-base font-medium text-white hover:bg-indigo-700 md:px-10 md:py-4 md:text-lg"
								>
									Get Started
								</a>
							</div>
							<div class="mt-3 sm:mt-0 sm:ml-3">
								<a
									href="#features"
									class="flex w-full items-center justify-center rounded-md border border-transparent bg-indigo-100 px-8 py-3 text-base font-medium text-indigo-700 hover:bg-indigo-200 md:px-10 md:py-4 md:text-lg"
								>
									Learn More
								</a>
							</div>
						</div>
					</div>
				</main>
			</div>
		</div>
	</div>

	<!-- Features Section -->
	<div id="features" class="bg-white py-12">
		<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
			<div class="lg:text-center">
				<h2 class="text-base font-semibold tracking-wide text-indigo-600 uppercase">Features</h2>
				<p class="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
					Everything you need to find your perfect home
				</p>
				<p class="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
					Our platform connects buyers and sellers with a seamless, secure experience.
				</p>
			</div>

			<div class="mt-10">
				<div class="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
					<div class="relative">
						<div
							class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
								/>
							</svg>
						</div>
						<p class="ml-16 text-lg leading-6 font-medium text-gray-900">Property Listings</p>
						<p class="mt-2 ml-16 text-base text-gray-500">
							Browse through carefully curated property listings with detailed information and
							high-quality photos.
						</p>
					</div>

					<div class="relative">
						<div
							class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
								/>
							</svg>
						</div>
						<p class="ml-16 text-lg leading-6 font-medium text-gray-900">Appointment Booking</p>
						<p class="mt-2 ml-16 text-base text-gray-500">
							Schedule viewings directly with property owners through our integrated appointment
							system.
						</p>
					</div>

					<div class="relative">
						<div
							class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
								/>
							</svg>
						</div>
						<p class="ml-16 text-lg leading-6 font-medium text-gray-900">Verified Users</p>
						<p class="mt-2 ml-16 text-base text-gray-500">
							All users are verified to ensure a safe and trustworthy environment for property
							transactions.
						</p>
					</div>

					<div class="relative">
						<div
							class="absolute flex h-12 w-12 items-center justify-center rounded-md bg-indigo-500 text-white"
						>
							<svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<p class="ml-16 text-lg leading-6 font-medium text-gray-900">Fast & Secure</p>
						<p class="mt-2 ml-16 text-base text-gray-500">
							Built with modern technology to provide a fast, secure, and reliable platform for
							property transactions.
						</p>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Footer -->
	<footer class="bg-gray-800">
		<div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
			<div class="text-center">
				<p class="text-base text-gray-400">&copy; 2024 Domovae. All rights reserved.</p>
			</div>
		</div>
	</footer>
</div>
