<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PropertyForm from '$lib/components/PropertyForm.svelte';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	export let data: any;

	let isLoading = false;
	let error = '';

	onMount(() => {
		// Redirect if not authenticated
		if (!$page.data.session) {
			goto('/auth/signin');
			return;
		}
	});

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function onSubmit(requestData: any) {
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			const responseData = await response.json();

			if (response.ok) {
				goto(`/properties/${responseData.property.id}`);
			} else {
				error = responseData.error || 'Failed to create property';
			}
		} catch (err) {
			console.error('Error creating property:', err);
			error = 'An error occurred while creating the property';
		} finally {
			isLoading = false;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function onSaveDraft(requestData: any) {
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/properties', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			if (response.ok) {
				const result = await response.json();
				goto(`/properties/${result.property.id}`);
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Failed to save draft';
			}
		} catch (err) {
			console.error('Error saving draft:', err);
			error = 'An error occurred while saving the draft';
		} finally {
			isLoading = false;
		}
	}
</script>

<PropertyForm property={null} {onSubmit} {onSaveDraft} {isLoading} {error} />
