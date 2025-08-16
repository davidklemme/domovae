<script lang="ts">
	import type {
		BuyerProfile,
		CreateBuyerProfileData,
		EquityBand,
		PurchaseTimeline,
		PurchasePurpose
	} from '$lib/types/property';

	export let profile: BuyerProfile | null = null;
	export let isLoading = false;
	export let onSave: (data: CreateBuyerProfileData) => void = () => {};

	let formData = {
		equityBand: profile?.equityBand || 'b30_50',
		timeline: profile?.timeline || 'lt3m',
		purpose: profile?.purpose || 'eigennutzung',
		householdSize: profile?.householdSize || undefined,
		schufaAvailable: profile?.schufaAvailable || false,
		consentGiven: false
	};

	let selectedFile: File | null = null;
	let fileError = '';
	let formErrors: Record<string, string> = {};

	// Equity band options
	const equityOptions = [
		{ value: 'lt10', label: 'Weniger als 10%', description: 'Unter 10% Eigenkapital' },
		{ value: 'b10_30', label: '10-30%', description: '10% bis 30% Eigenkapital' },
		{ value: 'b30_50', label: '30-50%', description: '30% bis 50% Eigenkapital' },
		{ value: 'gt50', label: 'Über 50%', description: 'Mehr als 50% Eigenkapital' }
	];

	// Timeline options
	const timelineOptions = [
		{ value: 'immediate', label: 'Sofort', description: 'Sofortiger Kauf möglich' },
		{ value: 'lt3m', label: '≤ 3 Monate', description: 'Innerhalb von 3 Monaten' },
		{ value: 'lt6m', label: '≤ 6 Monate', description: 'Innerhalb von 6 Monaten' },
		{ value: 'gt6m', label: '> 6 Monate', description: 'Länger als 6 Monate' }
	];

	// Purpose options
	const purposeOptions = [
		{ value: 'eigennutzung', label: 'Eigennutzung', description: 'Selbst bewohnen' },
		{ value: 'kapitalanlage', label: 'Kapitalanlage', description: 'Als Investition' }
	];

	function handleFileSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (file) {
			// Validate file type
			const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
			if (!allowedTypes.includes(file.type)) {
				fileError = 'Nur PDF, JPG und PNG Dateien sind erlaubt.';
				selectedFile = null;
				return;
			}

			// Validate file size (5MB)
			const maxSize = 5 * 1024 * 1024;
			if (file.size > maxSize) {
				fileError = 'Datei ist zu groß. Maximum 5MB erlaubt.';
				selectedFile = null;
				return;
			}

			fileError = '';
			selectedFile = file;
		}
	}

	function validateForm(): boolean {
		formErrors = {};

		if (!formData.equityBand) {
			formErrors.equityBand = 'Bitte wählen Sie eine Eigenkapital-Bandbreite.';
		}

		if (!formData.timeline) {
			formErrors.timeline = 'Bitte wählen Sie einen Zeitplan.';
		}

		if (!formData.purpose) {
			formErrors.purpose = 'Bitte wählen Sie einen Kaufzweck.';
		}

		if (formData.householdSize && (formData.householdSize < 1 || formData.householdSize > 10)) {
			formErrors.householdSize = 'Haushaltsgröße muss zwischen 1 und 10 liegen.';
		}

		if (!formData.consentGiven) {
			formErrors.consent = 'Sie müssen der Datenschutzerklärung zustimmen.';
		}

		return Object.keys(formErrors).length === 0;
	}

	function _handleSubmit() {
		if (!validateForm()) {
			return;
		}

		const submitData: CreateBuyerProfileData = {
			equityBand: formData.equityBand as EquityBand,
			timeline: formData.timeline as PurchaseTimeline,
			purpose: formData.purpose as PurchasePurpose,
			householdSize: formData.householdSize,
			schufaAvailable: formData.schufaAvailable,
			financingDoc: selectedFile || undefined,
			consentGiven: formData.consentGiven
		};

		onSave(submitData);
	}

	function removeFile() {
		selectedFile = null;
		fileError = '';
	}
</script>

<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
	<!-- Left Column -->
	<div class="space-y-6">
		<!-- Equity Band Selection -->
		<div>
			<label for="equityBand" class="block text-sm font-medium text-gray-700">
				Eigenkapital-Bandbreite *
			</label>
			<select
				id="equityBand"
				bind:value={formData.equityBand}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			>
				{#each equityOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-gray-500">
				{equityOptions.find((opt) => opt.value === formData.equityBand)?.description}
			</p>
			{#if formErrors.equityBand}
				<p class="mt-1 text-sm text-red-600">{formErrors.equityBand}</p>
			{/if}
		</div>

		<!-- Timeline Selection -->
		<div>
			<label for="timeline" class="block text-sm font-medium text-gray-700"> Kaufzeitplan * </label>
			<select
				id="timeline"
				bind:value={formData.timeline}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			>
				{#each timelineOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-gray-500">
				{timelineOptions.find((opt) => opt.value === formData.timeline)?.description}
			</p>
			{#if formErrors.timeline}
				<p class="mt-1 text-sm text-red-600">{formErrors.timeline}</p>
			{/if}
		</div>

		<!-- Purpose Selection -->
		<div>
			<label for="purpose" class="block text-sm font-medium text-gray-700"> Kaufzweck * </label>
			<select
				id="purpose"
				bind:value={formData.purpose}
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			>
				{#each purposeOptions as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<p class="mt-1 text-sm text-gray-500">
				{purposeOptions.find((opt) => opt.value === formData.purpose)?.description}
			</p>
			{#if formErrors.purpose}
				<p class="mt-1 text-sm text-red-600">{formErrors.purpose}</p>
			{/if}
		</div>

		<!-- Household Size -->
		<div>
			<label for="householdSize" class="block text-sm font-medium text-gray-700">
				Haushaltsgröße (optional)
			</label>
			<input
				id="householdSize"
				type="number"
				min="1"
				max="10"
				bind:value={formData.householdSize}
				placeholder="Anzahl der Personen"
				class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
			/>
			<p class="mt-1 text-sm text-gray-500">
				Anzahl der Personen, die in der Immobilie wohnen werden
			</p>
			{#if formErrors.householdSize}
				<p class="mt-1 text-sm text-red-600">{formErrors.householdSize}</p>
			{/if}
		</div>
	</div>

	<!-- Right Column -->
	<div class="space-y-6">
		<!-- Schufa Availability -->
		<div>
			<label class="flex cursor-pointer items-start space-x-3">
				<input
					type="checkbox"
					bind:checked={formData.schufaAvailable}
					class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<div class="flex-1">
					<div class="text-sm font-medium text-gray-900">Schufa-Auskunft auf Anfrage verfügbar</div>
					<div class="text-sm text-gray-500">
						Ich bin bereit, auf Anfrage eine Schufa-Auskunft bereitzustellen
					</div>
				</div>
			</label>
		</div>

		<!-- Financing Document Upload -->
		<div>
			<label class="mb-2 block text-sm font-medium text-gray-700">
				Finanzierungsbestätigung (optional)
			</label>
			<div class="space-y-3">
				<div class="flex items-center space-x-3">
					<input
						type="file"
						accept=".pdf,.jpg,.jpeg,.png"
						on:change={handleFileSelect}
						class="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
					/>
				</div>

				{#if selectedFile}
					<div class="flex items-center justify-between rounded-md bg-green-50 p-3">
						<div class="flex items-center space-x-2">
							<span class="text-green-600">✓</span>
							<span class="text-sm text-green-800">{selectedFile.name}</span>
							<span class="text-xs text-green-600">
								({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
							</span>
						</div>
						<button
							type="button"
							on:click={removeFile}
							class="text-sm text-red-600 hover:text-red-800"
						>
							Entfernen
						</button>
					</div>
				{/if}

				{#if fileError}
					<p class="text-sm text-red-600">{fileError}</p>
				{/if}

				<p class="text-sm text-gray-500">
					Unterstützte Formate: PDF, JPG, PNG (max. 5MB). Ihr Dokument wird sicher gespeichert und
					nur an Verkäufer weitergegeben, die Sie kontaktiert haben.
				</p>
			</div>
		</div>

		<!-- Consent -->
		<div>
			<label class="flex cursor-pointer items-start space-x-3">
				<input
					type="checkbox"
					bind:checked={formData.consentGiven}
					class="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
				/>
				<div class="flex-1">
					<div class="text-sm font-medium text-gray-900">Datenschutzerklärung *</div>
					<div class="text-sm text-gray-500">
						Ich stimme der
						<a href="/privacy" target="_blank" class="text-blue-600 underline hover:text-blue-800">
							Datenschutzerklärung
						</a>
						zu und erkläre mich damit einverstanden, dass meine Daten für die Kontaktaufnahme mit Verkäufern
						verwendet werden. Meine Daten werden nach 12 Monaten automatisch gelöscht.
					</div>
				</div>
			</label>
			{#if formErrors.consent}
				<p class="mt-1 text-sm text-red-600">{formErrors.consent}</p>
			{/if}
		</div>
	</div>
</div>
