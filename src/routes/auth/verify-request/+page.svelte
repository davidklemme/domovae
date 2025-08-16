<script lang="ts">
	import { goto } from '$app/navigation';
</script>

<svelte:head>
	<title>Check your email - Brickly</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<svg class="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
						/>
					</svg>
				</div>
				<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Check your email</h2>
				<p class="mt-2 text-center text-sm text-gray-600">
					A sign in link has been sent to your email address.
				</p>
				<p class="mt-2 text-center text-sm text-gray-500">
					If you don't see it, check your spam folder.
				</p>
			</div>

			<div class="mt-6">
				<div class="text-center">
					<button
						on:click={() => goto('/auth/signin')}
						class="font-medium text-indigo-600 hover:text-indigo-500"
					>
						Back to sign in
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
