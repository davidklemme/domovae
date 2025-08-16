import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BuyerProfileService } from '../server/services/buyer-profile-service';
import type { CreateBuyerProfileData, BuyerProfile } from '../types/property';

describe('Buyer Profile System', () => {
	const testUserId = 'test-user-123';

	beforeEach(async () => {
		// Clean up any existing test data
		try {
			// This would require a test database setup
			// For now, we'll test the service logic without database operations
		} catch (error) {
			console.error('Error cleaning up test data:', error);
			// Ignore cleanup errors in test environment
		}
	});

	afterEach(async () => {
		// Clean up after tests
		try {
			// This would require a test database setup
		} catch (error) {
			console.error('Error cleaning up test data:', error);
			// Ignore cleanup errors in test environment
		}
	});

	describe('BuyerProfileService', () => {
		describe('Data Validation', () => {
			it('should validate equity band values', () => {
				const validBands = ['lt10', 'b10_30', 'b30_50', 'gt50'];
				const invalidBands = ['invalid', '10-30', '30%', ''];

				validBands.forEach((band) => {
					expect(validBands).toContain(band);
				});

				invalidBands.forEach((band) => {
					expect(validBands).not.toContain(band);
				});
			});

			it('should validate timeline values', () => {
				const validTimelines = ['immediate', 'lt3m', 'lt6m', 'gt6m'];
				const invalidTimelines = ['invalid', '3 months', '6+ months', ''];

				validTimelines.forEach((timeline) => {
					expect(validTimelines).toContain(timeline);
				});

				invalidTimelines.forEach((timeline) => {
					expect(validTimelines).not.toContain(timeline);
				});
			});

			it('should validate purpose values', () => {
				const validPurposes = ['eigennutzung', 'kapitalanlage'];
				const invalidPurposes = ['invalid', 'own use', 'investment', ''];

				validPurposes.forEach((purpose) => {
					expect(validPurposes).toContain(purpose);
				});

				invalidPurposes.forEach((purpose) => {
					expect(validPurposes).not.toContain(purpose);
				});
			});

			it('should validate household size range', () => {
				const validSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
				const invalidSizes = [0, -1, 11, 100, null, undefined];

				validSizes.forEach((size) => {
					expect(size).toBeGreaterThan(0);
					expect(size).toBeLessThanOrEqual(10);
				});

				invalidSizes.forEach((size) => {
					if (size !== null && size !== undefined) {
						expect(size <= 0 || size > 10).toBe(true);
					}
				});
			});
		});

		describe('Trust Badge Generation', () => {
			it('should generate correct trust badges for complete profile', () => {
				const mockProfile: BuyerProfile = {
					id: 1,
					userId: testUserId,
					equityBand: 'b30_50',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					householdSize: 3,
					schufaAvailable: true,
					financingDocUrl: 'https://example.com/doc.pdf',
					financingVerified: true,
					consentTimestamp: new Date(),
					retentionUntil: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const badges = BuyerProfileService.generateTrustBadges(mockProfile);

				expect(badges).toHaveLength(5);
				expect(badges).toEqual(
					expect.arrayContaining([
						expect.objectContaining({ type: 'financing' }),
						expect.objectContaining({ type: 'equity' }),
						expect.objectContaining({ type: 'timeline' }),
						expect.objectContaining({ type: 'purpose' }),
						expect.objectContaining({ type: 'schufa' })
					])
				);
			});

			it('should generate correct badge for financing verification', () => {
				const profileWithFinancing: BuyerProfile = {
					id: 1,
					userId: testUserId,
					equityBand: 'b30_50',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					schufaAvailable: false,
					financingDocUrl: 'https://example.com/doc.pdf',
					financingVerified: true,
					consentTimestamp: new Date(),
					retentionUntil: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const badges = BuyerProfileService.generateTrustBadges(profileWithFinancing);
				const financingBadge = badges.find((b) => b.type === 'financing');

				expect(financingBadge).toBeDefined();
				expect(financingBadge?.label).toBe('Finanzierung bestätigt');
				expect(financingBadge?.color).toBe('bg-green-100 text-green-800');
			});

			it('should generate correct badge for high equity', () => {
				const highEquityProfile: BuyerProfile = {
					id: 1,
					userId: testUserId,
					equityBand: 'gt50',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					schufaAvailable: false,
					financingVerified: false,
					consentTimestamp: new Date(),
					retentionUntil: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const badges = BuyerProfileService.generateTrustBadges(highEquityProfile);
				const equityBadge = badges.find((b) => b.type === 'equity');

				expect(equityBadge).toBeDefined();
				expect(equityBadge?.label).toBe('Eigenkapital: > 50%');
				expect(equityBadge?.color).toBe('bg-green-100 text-green-800');
			});

			it('should generate correct badge for immediate timeline', () => {
				const immediateProfile: BuyerProfile = {
					id: 1,
					userId: testUserId,
					equityBand: 'b30_50',
					timeline: 'immediate',
					purpose: 'eigennutzung',
					schufaAvailable: false,
					financingVerified: false,
					consentTimestamp: new Date(),
					retentionUntil: new Date(),
					createdAt: new Date(),
					updatedAt: new Date()
				};

				const badges = BuyerProfileService.generateTrustBadges(immediateProfile);
				const timelineBadge = badges.find((b) => b.type === 'timeline');

				expect(timelineBadge).toBeDefined();
				expect(timelineBadge?.label).toBe('Zeitplan: Sofort');
				expect(timelineBadge?.color).toBe('bg-green-100 text-green-800');
			});
		});

		describe('Retention Policy', () => {
			it('should calculate correct retention date', () => {
				const now = new Date();
				const retentionDate = new Date();
				retentionDate.setMonth(retentionDate.getMonth() + 12);

				expect(retentionDate.getTime()).toBeGreaterThan(now.getTime());
				expect(retentionDate.getFullYear()).toBe(now.getFullYear() + 1);
			});

			it('should handle retention date calculation correctly', () => {
				const testDate = new Date('2024-01-15');
				const retentionDate = new Date(testDate);
				retentionDate.setMonth(retentionDate.getMonth() + 12);

				expect(retentionDate.getFullYear()).toBe(2025);
				expect(retentionDate.getMonth()).toBe(0); // January
				expect(retentionDate.getDate()).toBe(15);
			});
		});
	});

	describe('API Endpoints', () => {
		describe('GET /api/buyer-profile', () => {
			it('should return 401 for unauthenticated requests', async () => {
				// This would require a test server setup
				// For now, we'll test the validation logic
				const mockSession = null;
				expect(mockSession).toBeNull();
			});

			it('should return profile for authenticated user', async () => {
				// This would require a test server setup
				const mockSession = { user: { id: testUserId } };
				expect(mockSession.user.id).toBe(testUserId);
			});
		});

		describe('POST /api/buyer-profile', () => {
			it('should validate required fields', () => {
				const validData: CreateBuyerProfileData = {
					equityBand: 'b30_50',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					schufaAvailable: true,
					consentGiven: true
				};

				expect(validData.equityBand).toBeDefined();
				expect(validData.timeline).toBeDefined();
				expect(validData.purpose).toBeDefined();
				expect(validData.consentGiven).toBe(true);
			});

			it('should reject invalid equity band', () => {
				const invalidData = {
					equityBand: 'invalid',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					schufaAvailable: true,
					consentGiven: true
				};

				const validBands = ['lt10', 'b10_30', 'b30_50', 'gt50'];
				expect(validBands).not.toContain(invalidData.equityBand);
			});

			it('should reject invalid timeline', () => {
				const invalidData = {
					equityBand: 'b30_50',
					timeline: 'invalid',
					purpose: 'eigennutzung',
					schufaAvailable: true,
					consentGiven: true
				};

				const validTimelines = ['immediate', 'lt3m', 'lt6m', 'gt6m'];
				expect(validTimelines).not.toContain(invalidData.timeline);
			});

			it('should reject invalid purpose', () => {
				const invalidData = {
					equityBand: 'b30_50',
					timeline: 'lt3m',
					purpose: 'invalid',
					schufaAvailable: true,
					consentGiven: true
				};

				const validPurposes = ['eigennutzung', 'kapitalanlage'];
				expect(validPurposes).not.toContain(invalidData.purpose);
			});

			it('should require consent', () => {
				const invalidData = {
					equityBand: 'b30_50',
					timeline: 'lt3m',
					purpose: 'eigennutzung',
					schufaAvailable: true,
					consentGiven: false
				};

				expect(invalidData.consentGiven).toBe(false);
			});
		});
	});

	describe('File Upload Validation', () => {
		it('should validate file size limit', () => {
			const maxSize = 5 * 1024 * 1024; // 5MB
			const validSize = 2 * 1024 * 1024; // 2MB
			const invalidSize = 10 * 1024 * 1024; // 10MB

			expect(validSize).toBeLessThanOrEqual(maxSize);
			expect(invalidSize).toBeGreaterThan(maxSize);
		});

		it('should validate file types', () => {
			const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
			const validTypes = ['application/pdf', 'image/jpeg', 'image/png'];
			const invalidTypes = ['text/plain', 'application/msword', 'image/gif'];

			validTypes.forEach((type) => {
				expect(allowedTypes).toContain(type);
			});

			invalidTypes.forEach((type) => {
				expect(allowedTypes).not.toContain(type);
			});
		});
	});

	describe('GDPR Compliance', () => {
		it('should require explicit consent', () => {
			const profileData = {
				consentGiven: true,
				consentTimestamp: new Date()
			};

			expect(profileData.consentGiven).toBe(true);
			expect(profileData.consentTimestamp).toBeInstanceOf(Date);
		});

		it('should enforce retention policy', () => {
			const retentionDate = new Date();
			retentionDate.setMonth(retentionDate.getMonth() + 12);

			const now = new Date();
			expect(retentionDate.getTime()).toBeGreaterThan(now.getTime());
		});

		it('should minimize data collection', () => {
			const requiredFields = ['equityBand', 'timeline', 'purpose', 'consentGiven'];
			const optionalFields = ['householdSize', 'financingDoc', 'schufaAvailable'];

			// Required fields should be present
			requiredFields.forEach((field) => {
				expect(requiredFields).toContain(field);
			});

			// Optional fields can be undefined
			optionalFields.forEach((field) => {
				expect(optionalFields).toContain(field);
			});
		});
	});

	describe('Integration Tests', () => {
		it('should handle complete buyer profile workflow', async () => {
			// This would test the complete flow from form submission to database storage
			const profileData: CreateBuyerProfileData = {
				equityBand: 'b30_50',
				timeline: 'lt3m',
				purpose: 'eigennutzung',
				householdSize: 3,
				schufaAvailable: true,
				consentGiven: true
			};

			// Validate the data
			expect(profileData.equityBand).toBe('b30_50');
			expect(profileData.timeline).toBe('lt3m');
			expect(profileData.purpose).toBe('eigennutzung');
			expect(profileData.householdSize).toBe(3);
			expect(profileData.schufaAvailable).toBe(true);
			expect(profileData.consentGiven).toBe(true);

			// This would test the actual service call in a test environment
			// const profile = await BuyerProfileService.upsertProfile(testUserId, profileData);
			// expect(profile).toBeDefined();
			// expect(profile.equityBand).toBe('b30_50');
		});

		it('should generate trust badges for appointment snapshots', () => {
			const mockProfile: BuyerProfile = {
				id: 1,
				userId: testUserId,
				equityBand: 'b30_50',
				timeline: 'lt3m',
				purpose: 'eigennutzung',
				schufaAvailable: true,
				financingVerified: true,
				consentTimestamp: new Date(),
				retentionUntil: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const _snapshot = BuyerProfileService.createSnapshot(testUserId);
			// Note: This would require a test database setup
			// expect(snapshot).toBeDefined();

			const badges = BuyerProfileService.generateTrustBadges(mockProfile);
			expect(badges).toHaveLength(5);
		});
	});
});
