import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getPropertyQuestions, createQuestion } from '$lib/server/services/qa-service';

export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		const propertyId = parseInt(params.id);
		if (isNaN(propertyId)) {
			return json({ error: 'Invalid property ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		const questions = await getPropertyQuestions(propertyId, session || undefined);

		return json({ questions });
	} catch (error) {
		console.error('Error fetching questions:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to fetch questions' },
			{ status: 500 }
		);
	}
};

export const POST: RequestHandler = async ({ params, request, locals }) => {
	try {
		const propertyId = parseInt(params.id);
		if (isNaN(propertyId)) {
			return json({ error: 'Invalid property ID' }, { status: 400 });
		}

		const session = await locals.getSession();
		if (!session?.user) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}

		const body = await request.json();
		const { question } = body;

		if (!question || typeof question !== 'string') {
			return json({ error: 'Question is required' }, { status: 400 });
		}

		const newQuestion = await createQuestion(
			{
				propertyId,
				question
			},
			session
		);

		return json({ question: newQuestion }, { status: 201 });
	} catch (error) {
		console.error('Error creating question:', error);
		return json(
			{ error: error instanceof Error ? error.message : 'Failed to create question' },
			{ status: 500 }
		);
	}
};
