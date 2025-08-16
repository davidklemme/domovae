import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateQuestionStatus, deleteQuestion } from '$lib/server/services/qa-service';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const questionId = parseInt(params.questionId);
		if (isNaN(questionId)) {
			return json({ error: 'Invalid question ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { status } = body;

		if (!status || !['pending', 'answered', 'published', 'rejected'].includes(status)) {
			return json({ error: 'Valid status is required' }, { status: 400 });
		}

		const updatedQuestion = await updateQuestionStatus(
			{
				questionId,
				status
			},
			session
		);

		return json({ question: updatedQuestion });
	} catch (error) {
		console.error('Error updating question status:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to update question status' },
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const questionId = parseInt(params.questionId);
		if (isNaN(questionId)) {
			return json({ error: 'Invalid question ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const result = await deleteQuestion(questionId, session);

		return json(result);
	} catch (error) {
		console.error('Error deleting question:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to delete question' },
			{ status: 500 }
		);
	}
};
