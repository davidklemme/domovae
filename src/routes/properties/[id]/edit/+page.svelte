<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import PropertyForm from '$lib/components/PropertyForm.svelte';

	export let data: PageData;

	let isLoading = false;
	let error = '';

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function onSubmit(requestData: any) {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/properties/${data.property.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			if (response.ok) {
				goto(`/properties/${data.property.id}`);
			} else {
				const errorData = await response.json();
				error = errorData.message || 'Failed to update property';
			}
		} catch (err) {
			console.error('Error updating property:', err);
			error = 'An error occurred while updating the property';
		} finally {
			isLoading = false;
		}
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	async function onSaveDraft(requestData: any) {
		isLoading = true;
		error = '';

		try {
			const response = await fetch(`/api/properties/${data.property.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(requestData)
			});

			if (response.ok) {
				// Show success message but stay on the page
				error = ''; // Clear any previous errors
			} else {
				const errorData = await response.json();
				error = errorData.error || errorData.message || 'Failed to save draft';
			}
		} catch (err) {
			console.error('Error saving draft:', err);
			error = 'An error occurred while saving the draft';
		} finally {
			isLoading = false;
		}
	}
</script>

<PropertyForm property={data.property} {onSubmit} {onSaveDraft} {isLoading} {error} />
