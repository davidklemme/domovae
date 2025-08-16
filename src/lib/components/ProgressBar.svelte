<script lang="ts">
	export let currentStep: number;
	export let totalSteps: number;
	export let onStepClick: (step: number) => void = () => {};
</script>

<div class="mb-8">
	<div class="flex items-center justify-between">
		{#each Array(totalSteps) as _, i (i)}
			<div class="flex items-center">
				<button
					type="button"
					onclick={() => onStepClick(i + 1)}
					class="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors {i +
						1 <=
					currentStep
						? 'bg-blue-600 text-white hover:bg-blue-700'
						: 'bg-gray-200 text-gray-600 hover:bg-gray-300'}"
				>
					{i + 1}
				</button>
				{#if i < totalSteps - 1}
					<div class="mx-2 h-1 w-16 {i + 1 < currentStep ? 'bg-blue-600' : 'bg-gray-200'}"></div>
				{/if}
			</div>
		{/each}
	</div>
	<div class="mt-2 text-sm text-gray-600">
		Step {currentStep} of {totalSteps}
	</div>
</div>
