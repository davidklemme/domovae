<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let propertyId: number;
	export let mediaCategory: 'hero' | 'slideshow' | 'layout';
	export let existingMedia: any[] = [];

	const dispatch = createEventDispatcher();

	let dragOver = false;
	let uploading = false;
	let uploadProgress = 0;
	let error = '';

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		dragOver = true;
	}

	function handleDragLeave(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
	}

	function handleDrop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;

		const files = event.dataTransfer?.files;
		if (files) {
			handleFiles(Array.from(files));
		}
	}

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.files) {
			handleFiles(Array.from(target.files));
		}
	}

	async function handleFiles(files: File[]) {
		if (files.length === 0) return;

		uploading = true;
		error = '';
		uploadProgress = 0;

		try {
			const formData = new FormData();
			files.forEach((file) => {
				formData.append('files', file);
			});
			formData.append('mediaCategory', mediaCategory);

			const response = await fetch(`/api/properties/${propertyId}/media`, {
				method: 'POST',
				body: formData
			});

			if (response.ok) {
				const result = await response.json();
				dispatch('uploaded', { media: result.media, category: mediaCategory });
				uploadProgress = 100;
			} else {
				const errorData = await response.json();
				error = errorData.error || 'Upload failed';
			}
		} catch (err) {
			error = 'Upload failed. Please try again.';
			console.error('Upload error:', err);
		} finally {
			uploading = false;
		}
	}

	async function deleteMedia(mediaId: number) {
		try {
			const response = await fetch(`/api/properties/${propertyId}/media`, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ mediaId })
			});

			if (response.ok) {
				dispatch('deleted', { mediaId, category: mediaCategory });
			} else {
				error = 'Failed to delete media';
			}
		} catch (err) {
			error = 'Failed to delete media';
			console.error('Delete error:', err);
		}
	}

	function getCategoryTitle() {
		switch (mediaCategory) {
			case 'hero':
				return 'Hero Image';
			case 'slideshow':
				return 'Slideshow Images';
			case 'layout':
				return 'Layout Images';
			default:
				return 'Media';
		}
	}

	function getCategoryDescription() {
		switch (mediaCategory) {
			case 'hero':
				return 'Upload the main hero image for this property (recommended: 1200x800px)';
			case 'slideshow':
				return 'Upload multiple images for the property slideshow (recommended: 1200x800px)';
			case 'layout':
				return 'Upload layout/floor plan images (PDF or images)';
			default:
				return 'Upload media files';
		}
	}

	$: categoryMedia = existingMedia.filter((media) => media.mediaCategory === mediaCategory);
</script>

<div class="space-y-4">
	<div class="border-b border-gray-200 pb-4">
		<h3 class="text-lg font-medium text-gray-900">{getCategoryTitle()}</h3>
		<p class="text-sm text-gray-600">{getCategoryDescription()}</p>
	</div>

	<!-- Upload Area -->
	<div
		class="relative rounded-lg border-2 border-dashed p-6 text-center transition-colors {dragOver
			? 'border-blue-400 bg-blue-50'
			: 'border-gray-300 hover:border-gray-400'}"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		role="button"
		tabindex="0"
		aria-label="Upload media files"
	>
		{#if uploading}
			<div class="space-y-2">
				<div class="text-sm text-gray-600">Uploading...</div>
				<div class="h-2 w-full rounded-full bg-gray-200">
					<div
						class="h-2 rounded-full bg-blue-600 transition-all duration-300"
						style="width: {uploadProgress}%"
					></div>
				</div>
			</div>
		{:else}
			<div class="space-y-2">
				<div class="text-4xl text-gray-400">📁</div>
				<div class="text-sm text-gray-600">
					Drag and drop files here, or
					<label
						for="file-upload-{mediaCategory}"
						class="cursor-pointer text-blue-600 hover:text-blue-500"
					>
						browse files
					</label>
				</div>
				<div class="text-xs text-gray-500">Supports: JPG, PNG, GIF (max 10MB each)</div>
			</div>
			<input
				id="file-upload-{mediaCategory}"
				type="file"
				multiple
				accept="image/*"
				class="hidden"
				onchange={handleFileSelect}
			/>
		{/if}
	</div>

	<!-- Error Message -->
	{#if error}
		<div class="rounded-md bg-red-50 p-3 text-sm text-red-600">
			{error}
		</div>
	{/if}

	<!-- Existing Media -->
	{#if categoryMedia.length > 0}
		<div class="space-y-3">
			<h4 class="text-sm font-medium text-gray-900">Uploaded {getCategoryTitle()}</h4>
			<div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
				{#each categoryMedia as media}
					<div class="group relative">
						<img
							src={media.mediaUrl}
							alt={media.altText || 'Property image'}
							class="h-32 w-full rounded-lg object-cover"
						/>
						<button
							onclick={() => deleteMedia(media.id)}
							class="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
							title="Delete image"
						>
							×
						</button>
						<div class="mt-1 truncate text-xs text-gray-600">
							{media.fileName}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
