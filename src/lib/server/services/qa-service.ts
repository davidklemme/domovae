import { db } from '$lib/server/db';
import { propertyQuestions, propertyAnswers, properties } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Session } from '@auth/core/types';

// Types for Q&A
export interface CreateQuestionData {
	propertyId: number;
	question: string;
}

export interface CreateAnswerData {
	questionId: number;
	answer: string;
}

export interface UpdateQuestionStatusData {
	questionId: number;
	status: 'pending' | 'answered' | 'published' | 'rejected';
}

export interface UpdateAnswerPublicationData {
	answerId: number;
	isPublished: boolean;
}

// Validation functions
export const validateQuestionData = (data: CreateQuestionData): string[] => {
	const errors: string[] = [];

	if (!data.question || !data.question.trim()) {
		errors.push('Question is required');
	}

	if (data.question.length > 1000) {
		errors.push('Question must be less than 1000 characters');
	}

	if (!data.propertyId || data.propertyId <= 0) {
		errors.push('Valid property ID is required');
	}

	return errors;
};

export const validateAnswerData = (data: CreateAnswerData): string[] => {
	const errors: string[] = [];

	if (!data.answer || !data.answer.trim()) {
		errors.push('Answer is required');
	}

	if (data.answer.length > 2000) {
		errors.push('Answer must be less than 2000 characters');
	}

	if (!data.questionId || data.questionId <= 0) {
		errors.push('Valid question ID is required');
	}

	return errors;
};

// Create a new question
export const createQuestion = async (questionData: CreateQuestionData, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Validate data
	const validationErrors = validateQuestionData(questionData);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.join(', '));
	}

	// Create question
	const newQuestion = await db
		.insert(propertyQuestions)
		.values({
			propertyId: questionData.propertyId,
			askedBy: session.user.id,
			question: questionData.question.trim(),
			status: 'pending'
		})
		.returning();

	return newQuestion[0];
};

// Get questions for a property
export const getPropertyQuestions = async (propertyId: number, session?: Session) => {
	const questions = await db.query.propertyQuestions.findMany({
		where: eq(propertyQuestions.propertyId, propertyId),
		with: {
			askedByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			},
			answers: {
				with: {
					answeredByUser: {
						columns: {
							id: true,
							name: true,
							email: true,
							image: true
						}
					}
				},
				orderBy: [desc(propertyAnswers.createdAt)]
			}
		},
		orderBy: [desc(propertyQuestions.createdAt)]
	});

	// Determine viewer permissions
	const viewerId = session?.user?.id;
	const viewerRole = (session?.user as { role?: 'buyer' | 'owner' | 'admin' })?.role || 'buyer';
	let isOwner = false;
	if (viewerId) {
		const property = await db.query.properties.findFirst({ where: eq(properties.id, propertyId) });
		isOwner = !!property && property.ownerId === viewerId;
	}
	const isAdmin = viewerRole === 'admin';

	// Filter questions based on user permissions
	if (!viewerId) {
		// Non-authenticated users only see published Q&As
		return questions.filter(
			(q) => q.status === 'published' && q.answers.some((a) => a.isPublished)
		);
	}

	if (isOwner || isAdmin) {
		return questions; // Full access
	}

	// Authenticated non-owner users: published or their own
	return questions.filter(
		(q) =>
			(q.status === 'published' && q.answers.some((a) => a.isPublished)) || q.askedBy === viewerId
	);
};

// Get questions for property owner (dashboard view)
export const getOwnerQuestions = async (propertyId: number, session: Session) => {
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Verify the user owns this property
	const property = await db.query.properties.findFirst({
		where: eq(properties.id, propertyId)
	});

	if (!property || property.ownerId !== session.user.id) {
		throw new Error('Forbidden: You can only view questions for your own properties');
	}

	return await db.query.propertyQuestions.findMany({
		where: eq(propertyQuestions.propertyId, propertyId),
		with: {
			askedByUser: {
				columns: {
					id: true,
					name: true,
					email: true,
					image: true
				}
			},
			answers: {
				with: {
					answeredByUser: {
						columns: {
							id: true,
							name: true,
							email: true,
							image: true
						}
					}
				},
				orderBy: [desc(propertyAnswers.createdAt)]
			}
		},
		orderBy: [desc(propertyQuestions.createdAt)]
	});
};

// Create an answer to a question
export const createAnswer = async (answerData: CreateAnswerData, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Validate data
	const validationErrors = validateAnswerData(answerData);
	if (validationErrors.length > 0) {
		throw new Error(validationErrors.join(', '));
	}

	// Get the question to verify ownership
	const question = await db.query.propertyQuestions.findFirst({
		where: eq(propertyQuestions.id, answerData.questionId),
		with: {
			property: true
		}
	});

	if (!question) {
		throw new Error('Question not found');
	}

	// Only property owners can answer questions
	if (question.property.ownerId !== session.user.id) {
		throw new Error('Forbidden: Only property owners can answer questions');
	}

	// Create answer
	const newAnswer = await db
		.insert(propertyAnswers)
		.values({
			questionId: answerData.questionId,
			answeredBy: session.user.id,
			answer: answerData.answer.trim(),
			isPublished: false // Default to unpublished
		})
		.returning();

	// Update question status to answered
	await db
		.update(propertyQuestions)
		.set({
			status: 'answered',
			updatedAt: new Date()
		})
		.where(eq(propertyQuestions.id, answerData.questionId));

	return newAnswer[0];
};

// Update question status
export const updateQuestionStatus = async (
	statusData: UpdateQuestionStatusData,
	session: Session
) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Get the question to verify ownership
	const question = await db.query.propertyQuestions.findFirst({
		where: eq(propertyQuestions.id, statusData.questionId),
		with: {
			property: true
		}
	});

	if (!question) {
		throw new Error('Question not found');
	}

	// Only property owners can update question status
	if (question.property.ownerId !== session.user.id) {
		throw new Error('Forbidden: Only property owners can update question status');
	}

	// Update question status
	const updatedQuestion = await db
		.update(propertyQuestions)
		.set({
			status: statusData.status,
			updatedAt: new Date()
		})
		.where(eq(propertyQuestions.id, statusData.questionId))
		.returning();

	return updatedQuestion[0];
};

// Update answer publication status
export const updateAnswerPublication = async (
	publicationData: UpdateAnswerPublicationData,
	session: Session
) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Get the answer to verify ownership
	const answer = await db.query.propertyAnswers.findFirst({
		where: eq(propertyAnswers.id, publicationData.answerId),
		with: {
			question: {
				with: {
					property: true
				}
			}
		}
	});

	if (!answer) {
		throw new Error('Answer not found');
	}

	// Only property owners can update answer publication status
	if (answer.question.property.ownerId !== session.user.id) {
		throw new Error('Forbidden: Only property owners can update answer publication status');
	}

	// Update answer publication status
	const updatedAnswer = await db
		.update(propertyAnswers)
		.set({
			isPublished: publicationData.isPublished,
			updatedAt: new Date()
		})
		.where(eq(propertyAnswers.id, publicationData.answerId))
		.returning();

	// If publishing the answer, also update question status to published
	if (publicationData.isPublished) {
		await db
			.update(propertyQuestions)
			.set({
				status: 'published',
				updatedAt: new Date()
			})
			.where(eq(propertyQuestions.id, answer.questionId));
	}

	return updatedAnswer[0];
};

// Delete a question (only by the person who asked it)
export const deleteQuestion = async (questionId: number, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Get the question to verify ownership
	const question = await db.query.propertyQuestions.findFirst({
		where: eq(propertyQuestions.id, questionId)
	});

	if (!question) {
		throw new Error('Question not found');
	}

	// Only the person who asked the question can delete it
	if (question.askedBy !== session.user.id) {
		throw new Error('Forbidden: You can only delete your own questions');
	}

	// Delete the question (this will cascade delete answers)
	await db.delete(propertyQuestions).where(eq(propertyQuestions.id, questionId));

	return { message: 'Question deleted successfully' };
};

// Delete an answer (only by the property owner)
export const deleteAnswer = async (answerId: number, session: Session) => {
	// Validate session
	if (!session?.user) {
		throw new Error('Unauthorized');
	}

	// Get the answer to verify ownership
	const answer = await db.query.propertyAnswers.findFirst({
		where: eq(propertyAnswers.id, answerId),
		with: {
			question: {
				with: {
					property: true
				}
			}
		}
	});

	if (!answer) {
		throw new Error('Answer not found');
	}

	// Only property owners can delete answers
	if (answer.question.property.ownerId !== session.user.id) {
		throw new Error('Forbidden: Only property owners can delete answers');
	}

	// Delete the answer
	await db.delete(propertyAnswers).where(eq(propertyAnswers.id, answerId));

	// Update question status back to pending if no answers remain
	const remainingAnswers = await db.query.propertyAnswers.findMany({
		where: eq(propertyAnswers.questionId, answer.questionId)
	});

	if (remainingAnswers.length === 0) {
		await db
			.update(propertyQuestions)
			.set({
				status: 'pending',
				updatedAt: new Date()
			})
			.where(eq(propertyQuestions.id, answer.questionId));
	}

	return { message: 'Answer deleted successfully' };
};
