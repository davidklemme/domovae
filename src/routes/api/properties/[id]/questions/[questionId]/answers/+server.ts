import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAnswer } from '$lib/server/services/qa-service';

export const POST: RequestHandler = async ({ params, request, locals }) => {
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
		const { answer } = body;

		if (!answer || typeof answer !== 'string') {
			return json({ error: 'Answer is required' }, { status: 400 });
		}

		const newAnswer = await createAnswer(
			{
				questionId,
				answer
			},
			session
		);

		return json({ answer: newAnswer }, { status: 201 });
	} catch (error) {
		console.error('Error creating answer:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create answer' },
			{ status: 500 }
		);
	}
};
