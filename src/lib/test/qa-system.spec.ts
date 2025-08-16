import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '$lib/server/db';
import { propertyQuestions, propertyAnswers, properties, users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import {
	createQuestion,
	createAnswer,
	updateQuestionStatus,
	updateAnswerPublication,
	deleteQuestion,
	deleteAnswer,
	getPropertyQuestions,
	getOwnerQuestions
} from '$lib/server/services/qa-service';

// Mock session for testing
const mockSession = {
	user: {
		id: 'test-user-1',
		name: 'Test User',
		email: 'test@example.com',
		role: 'buyer' as const
	},
	expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

const mockOwnerSession = {
	user: {
		id: 'test-owner-1',
		name: 'Test Owner',
		email: 'owner@example.com',
		role: 'owner' as const
	},
	expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

describe('Q&A System', () => {
	let testPropertyId: number;
	let testQuestionId: number;
	let testAnswerId: number;

	beforeAll(async () => {
		// Create test users
		await db
			.insert(users)
			.values([
				{
					id: 'test-user-1',
					name: 'Test User',
					email: 'test@example.com',
					role: 'buyer'
				},
				{
					id: 'test-owner-1',
					name: 'Test Owner',
					email: 'owner@example.com',
					role: 'owner'
				}
			])
			.onConflictDoNothing();

		// Create test property
		const newProperty = await db
			.insert(properties)
			.values({
				title: 'Test Property for Q&A',
				description: 'A test property for Q&A testing',
				price: 500000,
				propertyType: 'apartment',
				ownerId: 'test-owner-1',
				status: 'live'
			})
			.returning();

		testPropertyId = newProperty[0].id;
	});

	afterAll(async () => {
		// Clean up test data
		await db.delete(propertyAnswers).where(eq(propertyAnswers.questionId, testQuestionId));
		await db.delete(propertyQuestions).where(eq(propertyQuestions.propertyId, testPropertyId));
		await db.delete(properties).where(eq(properties.id, testPropertyId));
		await db.delete(users).where(eq(users.id, 'test-user-1'));
		await db.delete(users).where(eq(users.id, 'test-owner-1'));
	});

	describe('Question Management', () => {
		it('should create a new question', async () => {
			const questionData = {
				propertyId: testPropertyId,
				question: 'What is the monthly maintenance fee?'
			};

			const question = await createQuestion(questionData, mockSession);
			testQuestionId = question.id;

			expect(question).toBeDefined();
			expect(question.propertyId).toBe(testPropertyId);
			expect(question.askedBy).toBe('test-user-1');
			expect(question.question).toBe('What is the monthly maintenance fee?');
			expect(question.status).toBe('pending');
		});

		it('should validate question data', async () => {
			const invalidQuestionData = {
				propertyId: testPropertyId,
				question: ''
			};

			await expect(createQuestion(invalidQuestionData, mockSession)).rejects.toThrow(
				'Question is required'
			);
		});

		it('should reject questions that are too long', async () => {
			const longQuestion = 'a'.repeat(1001);
			const invalidQuestionData = {
				propertyId: testPropertyId,
				question: longQuestion
			};

			await expect(createQuestion(invalidQuestionData, mockSession)).rejects.toThrow(
				'Question must be less than 1000 characters'
			);
		});
	});

	describe('Answer Management', () => {
		it('should create an answer to a question', async () => {
			const answerData = {
				questionId: testQuestionId,
				answer: 'The monthly maintenance fee is €150.'
			};

			const answer = await createAnswer(answerData, mockOwnerSession);
			testAnswerId = answer.id;

			expect(answer).toBeDefined();
			expect(answer.questionId).toBe(testQuestionId);
			expect(answer.answeredBy).toBe('test-owner-1');
			expect(answer.answer).toBe('The monthly maintenance fee is €150.');
			expect(answer.isPublished).toBe(false);
		});

		it('should update question status to answered when answer is created', async () => {
			const question = await db.query.propertyQuestions.findFirst({
				where: eq(propertyQuestions.id, testQuestionId)
			});

			expect(question?.status).toBe('answered');
		});

		it('should validate answer data', async () => {
			const invalidAnswerData = {
				questionId: testQuestionId,
				answer: ''
			};

			await expect(createAnswer(invalidAnswerData, mockOwnerSession)).rejects.toThrow(
				'Answer is required'
			);
		});

		it('should reject answers that are too long', async () => {
			const longAnswer = 'a'.repeat(2001);
			const invalidAnswerData = {
				questionId: testQuestionId,
				answer: longAnswer
			};

			await expect(createAnswer(invalidAnswerData, mockOwnerSession)).rejects.toThrow(
				'Answer must be less than 2000 characters'
			);
		});

		it('should only allow property owners to answer questions', async () => {
			const answerData = {
				questionId: testQuestionId,
				answer: 'This should fail'
			};

			await expect(createAnswer(answerData, mockSession)).rejects.toThrow(
				'Forbidden: Only property owners can answer questions'
			);
		});
	});

	describe('Publication Management', () => {
		it('should allow property owners to publish answers', async () => {
			const publicationData = {
				answerId: testAnswerId,
				isPublished: true
			};

			const updatedAnswer = await updateAnswerPublication(publicationData, mockOwnerSession);

			expect(updatedAnswer.isPublished).toBe(true);
		});

		it('should update question status to published when answer is published', async () => {
			const question = await db.query.propertyQuestions.findFirst({
				where: eq(propertyQuestions.id, testQuestionId)
			});

			expect(question?.status).toBe('published');
		});

		it('should only allow property owners to update publication status', async () => {
			const publicationData = {
				answerId: testAnswerId,
				isPublished: false
			};

			await expect(updateAnswerPublication(publicationData, mockSession)).rejects.toThrow(
				'Forbidden: Only property owners can update answer publication status'
			);
		});
	});

	describe('Question Retrieval', () => {
		it('should get questions for a property', async () => {
			const questions = await getPropertyQuestions(testPropertyId, mockSession);

			expect(questions).toBeDefined();
			expect(questions.length).toBeGreaterThan(0);
			expect(questions[0].propertyId).toBe(testPropertyId);
		});

		it('should get owner questions for property management', async () => {
			const questions = await getOwnerQuestions(testPropertyId, mockOwnerSession);

			expect(questions).toBeDefined();
			expect(questions.length).toBeGreaterThan(0);
			expect(questions[0].propertyId).toBe(testPropertyId);
		});

		it('should reject non-owners from accessing owner questions', async () => {
			await expect(getOwnerQuestions(testPropertyId, mockSession)).rejects.toThrow(
				'Forbidden: You can only view questions for your own properties'
			);
		});
	});

	describe('Deletion', () => {
		it('should allow users to delete their own questions', async () => {
			// Create another question to delete
			const questionData = {
				propertyId: testPropertyId,
				question: 'This question will be deleted'
			};

			const question = await createQuestion(questionData, mockSession);
			const result = await deleteQuestion(question.id, mockSession);

			expect(result.message).toBe('Question deleted successfully');
		});

		it('should allow property owners to delete answers', async () => {
			// Create another answer to delete
			const answerData = {
				questionId: testQuestionId,
				answer: 'This answer will be deleted'
			};

			const answer = await createAnswer(answerData, mockOwnerSession);
			const result = await deleteAnswer(answer.id, mockOwnerSession);

			expect(result.message).toBe('Answer deleted successfully');
		});

		it("should not allow users to delete others' questions", async () => {
			// Create a question by owner
			const questionData = {
				propertyId: testPropertyId,
				question: 'Owner question'
			};

			const question = await createQuestion(questionData, mockOwnerSession);

			await expect(deleteQuestion(question.id, mockSession)).rejects.toThrow(
				'Forbidden: You can only delete your own questions'
			);
		});

		it('should not allow non-owners to delete answers', async () => {
			// Create an answer
			const answerData = {
				questionId: testQuestionId,
				answer: 'Test answer'
			};

			const answer = await createAnswer(answerData, mockOwnerSession);

			await expect(deleteAnswer(answer.id, mockSession)).rejects.toThrow(
				'Forbidden: Only property owners can delete answers'
			);
		});
	});

	describe('Status Management', () => {
		it('should allow property owners to update question status', async () => {
			// Create a new question for status testing
			const questionData = {
				propertyId: testPropertyId,
				question: 'Status test question'
			};

			const question = await createQuestion(questionData, mockSession);

			const statusData = {
				questionId: question.id,
				status: 'rejected' as const
			};

			const updatedQuestion = await updateQuestionStatus(statusData, mockOwnerSession);

			expect(updatedQuestion.status).toBe('rejected');
		});

		it('should not allow non-owners to update question status', async () => {
			const statusData = {
				questionId: testQuestionId,
				status: 'rejected' as const
			};

			await expect(updateQuestionStatus(statusData, mockSession)).rejects.toThrow(
				'Forbidden: Only property owners can update question status'
			);
		});
	});
});
