<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	$: error = $page.url.searchParams.get('error');
	$: errorMessage = getErrorMessage(error);

	function getErrorMessage(errorCode: string | null): string {
		switch (errorCode) {
			case 'Configuration':
				return 'There is a problem with the server configuration.';
			case 'AccessDenied':
				return 'You do not have permission to sign in.';
			case 'Verification':
				return 'The verification token has expired or has already been used.';
			case 'Default':
			default:
				return 'An error occurred during authentication.';
		}
	}
</script>

<svelte:head>
	<title>Authentication Error - Domovae</title>
</svelte:head>

<div class="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
	<div class="sm:mx-auto sm:w-full sm:max-w-md">
		<div class="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
			<div class="text-center">
				<div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
					<svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
						/>
					</svg>
				</div>
				<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Authentication Error</h2>
				<p class="mt-2 text-center text-sm text-gray-600">
					{errorMessage}
				</p>
			</div>

			<div class="mt-6">
				<div class="text-center">
					<button
						on:click={() => goto('/auth/signin')}
						class="flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
					>
						Try again
					</button>
				</div>
			</div>
		</div>
	</div>
</div>
