import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { updateAnswerPublication, deleteAnswer } from '$lib/server/services/qa-service';

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
	try {
		const answerId = parseInt(params.answerId);
		if (isNaN(answerId)) {
			return json({ error: 'Invalid answer ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { isPublished } = body;

		if (typeof isPublished !== 'boolean') {
			return json({ error: 'isPublished must be a boolean' }, { status: 400 });
		}

		const updatedAnswer = await updateAnswerPublication(
			{
				answerId,
				isPublished
			},
			session
		);

		return json({ answer: updatedAnswer });
	} catch (error) {
		console.error('Error updating answer publication status:', error);
		return json(
			{
				error: error instanceof Error ? error.message : 'Failed to update answer publication status'
			},
			{ status: 500 }
		);
	}
};

export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		const answerId = parseInt(params.answerId);
		if (isNaN(answerId)) {
			return json({ error: 'Invalid answer ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const result = await deleteAnswer(answerId, session);

		return json(result);
	} catch (error) {
		console.error('Error deleting answer:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to delete answer' },
			{ status: 500 }
		);
	}
};
