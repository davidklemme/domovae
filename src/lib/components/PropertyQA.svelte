<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	export let propertyId: number;
	export let propertyOwnerId: string;
	export let currentUserId: string | undefined;
	export let currentUserRole: string | undefined;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let questions: any[] = [];
	let newQuestion = '';
	let isLoading = false;
	let error = '';
	let showAskQuestionForm = false;

	// Load questions on mount
	onMount(() => {
		loadQuestions();
	});

	async function loadQuestions() {
		try {
			isLoading = true;
			const response = await fetch(`/api/properties/${propertyId}/questions`);
			if (response.ok) {
				const data = await response.json();
				questions = data.questions;
			} else {
				error = 'Failed to load questions';
			}
		} catch (err) {
			error = 'Failed to load questions';
			console.error('Error loading questions:', err);
		} finally {
			isLoading = false;
		}
	}

	async function submitQuestion() {
		if (!newQuestion.trim()) return;

		try {
			isLoading = true;
			const response = await fetch(`/api/properties/${propertyId}/questions`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ question: newQuestion.trim() })
			});

			if (response.ok) {
				newQuestion = '';
				showAskQuestionForm = false;
				await loadQuestions();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to submit question';
			}
		} catch (err) {
			error = 'Failed to submit question';
			console.error('Error submitting question:', err);
		} finally {
			isLoading = false;
		}
	}

	async function deleteQuestion(questionId: number) {
		if (!confirm('Are you sure you want to delete this question?')) return;

		try {
			isLoading = true;
			const response = await fetch(`/api/properties/${propertyId}/questions/${questionId}`, {
				method: 'DELETE'
			});

			if (response.ok) {
				await loadQuestions();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to delete question';
			}
		} catch (err) {
			error = 'Failed to delete question';
			console.error('Error deleting question:', err);
		} finally {
			isLoading = false;
		}
	}

	async function submitAnswer(questionId: number, answer: string) {
		if (!answer.trim()) return;

		try {
			isLoading = true;
			const response = await fetch(
				`/api/properties/${propertyId}/questions/${questionId}/answers`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ answer: answer.trim() })
				}
			);

			if (response.ok) {
				await loadQuestions();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to submit answer';
			}
		} catch (err) {
			error = 'Failed to submit answer';
			console.error('Error submitting answer:', err);
		} finally {
			isLoading = false;
		}
	}

	async function toggleAnswerPublication(answerId: number, currentStatus: boolean) {
		try {
			isLoading = true;
			const response = await fetch(
				`/api/properties/${propertyId}/questions/0/answers/${answerId}`,
				{
					method: 'PATCH',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ isPublished: !currentStatus })
				}
			);

			if (response.ok) {
				await loadQuestions();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to update answer publication status';
			}
		} catch (err) {
			error = 'Failed to update answer publication status';
			console.error('Error updating answer publication status:', err);
		} finally {
			isLoading = false;
		}
	}

	async function deleteAnswer(answerId: number) {
		if (!confirm('Are you sure you want to delete this answer?')) return;

		try {
			isLoading = true;
			const response = await fetch(
				`/api/properties/${propertyId}/questions/0/answers/${answerId}`,
				{
					method: 'DELETE'
				}
			);

			if (response.ok) {
				await loadQuestions();
			} else {
				const data = await response.json();
				error = data.error || 'Failed to delete answer';
			}
		} catch (err) {
			error = 'Failed to delete answer';
			console.error('Error deleting answer:', err);
		} finally {
			isLoading = false;
		}
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	function canAskQuestion() {
		return currentUserId && currentUserRole === 'buyer';
	}

	function canAnswerQuestions() {
		return currentUserId && currentUserId === propertyOwnerId;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function canDeleteQuestion(question: any) {
		return currentUserId && question.askedBy === currentUserId;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function canManageAnswer(_answer: any) {
		return currentUserId && currentUserId === propertyOwnerId;
	}

	// Filter questions based on user permissions
	$: visibleQuestions = questions.filter((q) => {
		// Show all questions to property owners
		if (canAnswerQuestions()) return true;

		// Show published Q&As to everyone
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		if (q.status === 'published' && q.answers.some((a: any) => a.isPublished)) return true;

		// Show user's own questions
		if (currentUserId && q.askedBy === currentUserId) return true;

		return false;
	});

	// Group questions by status for property owners
	$: pendingQuestions = visibleQuestions.filter((q) => q.status === 'pending');
	$: answeredQuestions = visibleQuestions.filter((q) => q.status === 'answered');
	$: publishedQuestions = visibleQuestions.filter((q) => q.status === 'published');
</script>

<div class="rounded-2xl bg-white p-8 shadow-lg">
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-slate-900">Questions & Answers</h2>
		{#if canAskQuestion()}
			<button
				onclick={() => (showAskQuestionForm = !showAskQuestionForm)}
				class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				{showAskQuestionForm ? 'Cancel' : 'Ask a Question'}
			</button>
		{:else if !currentUserId}
			<button
				onclick={() => goto('/auth/signin')}
				class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
			>
				Sign in to Ask
			</button>
		{/if}
	</div>

	{#if error}
		<div class="mb-4 rounded-lg bg-red-50 p-4 text-red-700">
			{error}
		</div>
	{/if}

	<!-- Ask Question Form -->
	{#if showAskQuestionForm}
		<div class="mb-6 rounded-lg border border-slate-200 p-4">
			<h3 class="mb-3 text-lg font-semibold text-slate-900">Ask a Question</h3>
			<form onsubmit={submitQuestion} class="space-y-3">
				<textarea
					bind:value={newQuestion}
					placeholder="What would you like to know about this property?"
					class="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
					rows="3"
					maxlength="1000"
				></textarea>
				<div class="flex items-center justify-between">
					<span class="text-sm text-slate-500">{newQuestion.length}/1000 characters</span>
					<button
						type="submit"
						disabled={isLoading || !newQuestion.trim()}
						class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
					>
						{isLoading ? 'Submitting...' : 'Submit Question'}
					</button>
				</div>
			</form>
		</div>
	{/if}

	{#if isLoading && questions.length === 0}
		<div class="flex items-center justify-center py-8">
			<div class="text-slate-500">Loading questions...</div>
		</div>
	{:else if visibleQuestions.length === 0}
		<div class="py-8 text-center">
			<div class="mb-4 text-6xl">❓</div>
			<p class="text-slate-600">No questions yet. Be the first to ask!</p>
		</div>
	{:else}
		<!-- Property Owner View -->
		{#if canAnswerQuestions()}
			<!-- Pending Questions -->
			{#if pendingQuestions.length > 0}
				<div class="mb-8">
					<h3 class="mb-4 text-lg font-semibold text-amber-700">
						Pending Questions ({pendingQuestions.length})
					</h3>
					<div class="space-y-4">
						{#each pendingQuestions as question (question.id)}
							<div class="rounded-lg border border-amber-200 bg-amber-50 p-4">
								<div class="mb-3">
									<p class="font-medium text-slate-900">{question.question}</p>
									<div class="mt-2 flex items-center justify-between text-sm text-slate-600">
										<span>Asked by {question.askedByUser?.name || 'Anonymous'}</span>
										<span>{formatDate(question.createdAt)}</span>
									</div>
								</div>

								<!-- Answer Form -->
								<form
									onsubmit={(e: Event) => {
										const form = e.target as HTMLFormElement;
										const answerInput = form.querySelector('textarea') as HTMLTextAreaElement;
										submitAnswer(question.id, answerInput.value);
									}}
									class="space-y-3"
								>
									<textarea
										placeholder="Write your answer..."
										class="w-full rounded-lg border border-slate-300 p-3 focus:border-blue-500 focus:outline-none"
										rows="3"
										maxlength="2000"
										required
									></textarea>
									<div class="flex items-center justify-between">
										<span class="text-sm text-slate-500">0/2000 characters</span>
										<button
											type="submit"
											disabled={isLoading}
											class="rounded-lg bg-green-600 px-4 py-2 font-medium text-white transition-colors hover:bg-green-700 disabled:opacity-50"
										>
											{isLoading ? 'Submitting...' : 'Answer Question'}
										</button>
									</div>
								</form>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Answered Questions -->
			{#if answeredQuestions.length > 0}
				<div class="mb-8">
					<h3 class="mb-4 text-lg font-semibold text-blue-700">
						Answered Questions ({answeredQuestions.length})
					</h3>
					<div class="space-y-4">
						{#each answeredQuestions as question (question.id)}
							<div class="rounded-lg border border-blue-200 bg-blue-50 p-4">
								<div class="mb-3">
									<p class="font-medium text-slate-900">{question.question}</p>
									<div class="mt-2 flex items-center justify-between text-sm text-slate-600">
										<span>Asked by {question.askedByUser?.name || 'Anonymous'}</span>
										<span>{formatDate(question.createdAt)}</span>
									</div>
								</div>

								{#each question.answers as answer (answer.id)}
									<div class="ml-4 rounded-lg bg-white p-3">
										<p class="text-slate-700">{answer.answer}</p>
										<div class="mt-2 flex items-center justify-between">
											<span class="text-sm text-slate-600"
												>Answered by {answer.answeredByUser?.name || 'Property Owner'}</span
											>
											<div class="flex items-center space-x-2">
												<button
													onclick={() => toggleAnswerPublication(answer.id, answer.isPublished)}
													class="text-sm {answer.isPublished
														? 'text-green-600'
														: 'text-slate-600'} hover:underline"
												>
													{answer.isPublished ? 'Published' : 'Publish'}
												</button>
												<button
													onclick={() => deleteAnswer(answer.id)}
													class="text-sm text-red-600 hover:underline"
												>
													Delete
												</button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}

		<!-- Published Q&As (Visible to Everyone) -->
		{#if publishedQuestions.length > 0}
			<div class="mb-8">
				<h3 class="mb-4 text-lg font-semibold text-green-700">
					Published Q&A ({publishedQuestions.length})
				</h3>
				<div class="space-y-4">
					{#each publishedQuestions as question (question.id)}
						<div class="rounded-lg border border-green-200 bg-green-50 p-4">
							<div class="mb-3">
								<p class="font-medium text-slate-900">{question.question}</p>
								<div class="mt-2 flex items-center justify-between text-sm text-slate-600">
									<span>Asked by {question.askedByUser?.name || 'Anonymous'}</span>
									<span>{formatDate(question.createdAt)}</span>
								</div>
							</div>

							// eslint-disable-next-line @typescript-eslint/no-explicit-any
							{#each question.answers.filter((a: any) => a.isPublished) as answer (answer.id)}
								<div class="ml-4 rounded-lg bg-white p-3">
									<p class="text-slate-700">{answer.answer}</p>
									<div class="mt-2 text-sm text-slate-600">
										Answered by {answer.answeredByUser?.name || 'Property Owner'} on {formatDate(
											answer.createdAt
										)}
									</div>
								</div>
							{/each}

							{#if canDeleteQuestion(question)}
								<div class="mt-3 text-right">
									<button
										onclick={() => deleteQuestion(question.id)}
										class="text-sm text-red-600 hover:underline"
									>
										Delete Question
									</button>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- User's Own Questions (Not Published) -->
		{#if currentUserId && !canAnswerQuestions()}
			{#if visibleQuestions.filter((q) => q.askedBy === currentUserId && q.status !== 'published').length > 0}
				<div class="mb-8">
					<h3 class="mb-4 text-lg font-semibold text-slate-700">Your Questions</h3>
					<div class="space-y-4">
						{#each visibleQuestions.filter((q) => q.askedBy === currentUserId && q.status !== 'published') as question (question.id)}
							<div class="rounded-lg border border-slate-200 bg-slate-50 p-4">
								<div class="mb-3">
									<p class="font-medium text-slate-900">{question.question}</p>
									<div class="mt-2 flex items-center justify-between text-sm text-slate-600">
										<span class="capitalize">{question.status}</span>
										<span>{formatDate(question.createdAt)}</span>
									</div>
								</div>

								{#if question.answers.length > 0}
									{#each question.answers as answer (answer.id)}
										<div class="ml-4 rounded-lg bg-white p-3">
											<p class="text-slate-700">{answer.answer}</p>
											<div class="mt-2 text-sm text-slate-600">
												Answered by {answer.answeredByUser?.name || 'Property Owner'} on {formatDate(
													answer.createdAt
												)}
											</div>
										</div>
									{/each}
								{/if}

								<div class="mt-3 text-right">
									<button
										onclick={() => deleteQuestion(question.id)}
										class="text-sm text-red-600 hover:underline"
									>
										Delete Question
									</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	{/if}
</div>
