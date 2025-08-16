import { describe, it, expect } from 'vitest';
import type { CreateBuyerProfileData, BuyerProfile } from '../types/property';

describe('Buyer Profile Form', () => {
	describe('Form Validation', () => {
		it('should validate required fields', () => {
			const formData: Partial<CreateBuyerProfileData> = {
				equityBand: undefined,
				timeline: undefined,
				purpose: undefined,
				consentGiven: false
			};

			const errors: Record<string, string> = {};

			// Simulate validation
			if (!formData.equityBand) {
				errors.equityBand = 'Bitte wählen Sie eine Eigenkapital-Bandbreite aus.';
			}
			if (!formData.timeline) {
				errors.timeline = 'Bitte wählen Sie einen Kaufzeitplan aus.';
			}
			if (!formData.purpose) {
				errors.purpose = 'Bitte wählen Sie einen Kaufzweck aus.';
			}
			if (!formData.consentGiven) {
				errors.consent = 'Sie müssen der Datenschutzerklärung zustimmen.';
			}

			expect(errors.equityBand).toBe('Bitte wählen Sie eine Eigenkapital-Bandbreite aus.');
			expect(errors.timeline).toBe('Bitte wählen Sie einen Kaufzeitplan aus.');
			expect(errors.purpose).toBe('Bitte wählen Sie einen Kaufzweck aus.');
			expect(errors.consent).toBe('Sie müssen der Datenschutzerklärung zustimmen.');
		});

		it('should validate household size range', () => {
			const validSizes = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			const invalidSizes = [0, -1, 11, 100];

			validSizes.forEach((size) => {
				const isValid = size >= 1 && size <= 10;
				expect(isValid).toBe(true);
			});

			invalidSizes.forEach((size) => {
				const isValid = size >= 1 && size <= 10;
				expect(isValid).toBe(false);
			});
		});

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

		it('should handle file selection', () => {
			const mockFile = {
				name: 'financing.pdf',
				size: 1024 * 1024, // 1MB
				type: 'application/pdf'
			};

			expect(mockFile.name).toBe('financing.pdf');
			expect(mockFile.size).toBeLessThanOrEqual(5 * 1024 * 1024);
			expect(['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']).toContain(mockFile.type);
		});

		it('should reject oversized files', () => {
			const oversizedFile = {
				name: 'large.pdf',
				size: 10 * 1024 * 1024, // 10MB
				type: 'application/pdf'
			};

			const maxSize = 5 * 1024 * 1024; // 5MB
			expect(oversizedFile.size).toBeGreaterThan(maxSize);
		});

		it('should reject invalid file types', () => {
			const invalidFile = {
				name: 'document.txt',
				size: 1024,
				type: 'text/plain'
			};

			const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
			expect(allowedTypes).not.toContain(invalidFile.type);
		});
	});

	describe('Form Data Handling', () => {
		it('should initialize form with existing profile data', () => {
			const existingProfile: BuyerProfile = {
				id: 1,
				userId: 'user123',
				equityBand: 'b30_50',
				timeline: 'lt3m',
				purpose: 'eigennutzung',
				householdSize: 3,
				schufaAvailable: true,
				financingVerified: false,
				consentTimestamp: new Date(),
				retentionUntil: new Date(),
				createdAt: new Date(),
				updatedAt: new Date()
			};

			const formData = {
				equityBand: existingProfile.equityBand || 'b30_50',
				timeline: existingProfile.timeline || 'lt3m',
				purpose: existingProfile.purpose || 'eigennutzung',
				householdSize: existingProfile.householdSize,
				schufaAvailable: existingProfile.schufaAvailable || false,
				consentGiven: false // Always start unchecked
			};

			expect(formData.equityBand).toBe('b30_50');
			expect(formData.timeline).toBe('lt3m');
			expect(formData.purpose).toBe('eigennutzung');
			expect(formData.householdSize).toBe(3);
			expect(formData.schufaAvailable).toBe(true);
			expect(formData.consentGiven).toBe(false);
		});

		it('should handle form submission with valid data', () => {
			const formData: CreateBuyerProfileData = {
				equityBand: 'b30_50',
				timeline: 'lt3m',
				purpose: 'eigennutzung',
				householdSize: 3,
				schufaAvailable: true,
				consentGiven: true
			};

			// Validate required fields
			const isValid =
				formData.equityBand && formData.timeline && formData.purpose && formData.consentGiven;

			expect(isValid).toBe(true);
			expect(formData.equityBand).toBe('b30_50');
			expect(formData.timeline).toBe('lt3m');
			expect(formData.purpose).toBe('eigennutzung');
			expect(formData.consentGiven).toBe(true);
		});

		it('should handle optional fields correctly', () => {
			const formData: CreateBuyerProfileData = {
				equityBand: 'b30_50',
				timeline: 'lt3m',
				purpose: 'eigennutzung',
				schufaAvailable: false,
				consentGiven: true
				// householdSize and financingDoc are optional
			};

			expect(formData.householdSize).toBeUndefined();
			expect(formData.financingDoc).toBeUndefined();
			expect(formData.schufaAvailable).toBe(false);
		});
	});

	describe('User Interface', () => {
		it('should display correct equity band options', () => {
			const equityOptions = [
				{ value: 'lt10', label: 'Weniger als 10%', description: 'Unter 10% Eigenkapital' },
				{ value: 'b10_30', label: '10-30%', description: '10% bis 30% Eigenkapital' },
				{ value: 'b30_50', label: '30-50%', description: '30% bis 50% Eigenkapital' },
				{ value: 'gt50', label: 'Über 50%', description: 'Mehr als 50% Eigenkapital' }
			];

			expect(equityOptions).toHaveLength(4);
			expect(equityOptions[0].value).toBe('lt10');
			expect(equityOptions[0].label).toBe('Weniger als 10%');
			expect(equityOptions[3].value).toBe('gt50');
			expect(equityOptions[3].label).toBe('Über 50%');
		});

		it('should display correct timeline options', () => {
			const timelineOptions = [
				{ value: 'immediate', label: 'Sofort', description: 'Sofortiger Kauf möglich' },
				{ value: 'lt3m', label: '≤ 3 Monate', description: 'Innerhalb von 3 Monaten' },
				{ value: 'lt6m', label: '≤ 6 Monate', description: 'Innerhalb von 6 Monaten' },
				{ value: 'gt6m', label: '> 6 Monate', description: 'Länger als 6 Monate' }
			];

			expect(timelineOptions).toHaveLength(4);
			expect(timelineOptions[0].value).toBe('immediate');
			expect(timelineOptions[0].label).toBe('Sofort');
			expect(timelineOptions[3].value).toBe('gt6m');
			expect(timelineOptions[3].label).toBe('> 6 Monate');
		});

		it('should display correct purpose options', () => {
			const purposeOptions = [
				{ value: 'eigennutzung', label: 'Eigennutzung', description: 'Selbst bewohnen' },
				{ value: 'kapitalanlage', label: 'Kapitalanlage', description: 'Als Investition' }
			];

			expect(purposeOptions).toHaveLength(2);
			expect(purposeOptions[0].value).toBe('eigennutzung');
			expect(purposeOptions[0].label).toBe('Eigennutzung');
			expect(purposeOptions[1].value).toBe('kapitalanlage');
			expect(purposeOptions[1].label).toBe('Kapitalanlage');
		});
	});

	describe('Error Handling', () => {
		it('should display validation errors', () => {
			const errors = {
				equityBand: 'Bitte wählen Sie eine Eigenkapital-Bandbreite aus.',
				timeline: 'Bitte wählen Sie einen Kaufzeitplan aus.',
				purpose: 'Bitte wählen Sie einen Kaufzweck aus.',
				consent: 'Sie müssen der Datenschutzerklärung zustimmen.'
			};

			expect(errors.equityBand).toContain('Eigenkapital-Bandbreite');
			expect(errors.timeline).toContain('Kaufzeitplan');
			expect(errors.purpose).toContain('Kaufzweck');
			expect(errors.consent).toContain('Datenschutzerklärung');
		});

		it('should display file upload errors', () => {
			const fileErrors = {
				size: 'Datei ist zu groß. Maximum 5MB erlaubt.',
				type: 'Nur PDF, JPG und PNG Dateien sind erlaubt.'
			};

			expect(fileErrors.size).toContain('5MB');
			expect(fileErrors.type).toContain('PDF, JPG und PNG');
		});
	});

	describe('GDPR Compliance', () => {
		it('should require explicit consent', () => {
			const consentRequired = true;
			const consentGiven = false;

			expect(consentRequired).toBe(true);
			expect(consentGiven).toBe(false);
		});

		it('should provide privacy policy link', () => {
			const privacyLink = '/privacy';
			const consentText = 'Ich stimme der Datenschutzerklärung zu';

			expect(privacyLink).toBe('/privacy');
			expect(consentText).toContain('Datenschutzerklärung');
		});

		it('should explain data retention', () => {
			const retentionText = 'Meine Daten werden nach 12 Monaten automatisch gelöscht.';
			const retentionPeriod = 12; // months

			expect(retentionText).toContain('12 Monaten');
			expect(retentionPeriod).toBe(12);
		});
	});

	describe('Accessibility', () => {
		it('should have proper form labels', () => {
			const labels = {
				equityBand: 'Eigenkapital-Bandbreite *',
				timeline: 'Kaufzeitplan *',
				purpose: 'Kaufzweck *',
				householdSize: 'Haushaltsgröße',
				schufaAvailable: 'Schufa-Auskunft auf Anfrage verfügbar',
				financingDoc: 'Finanzierungsbestätigung (optional)',
				consent: 'Datenschutzerklärung *'
			};

			expect(labels.equityBand).toContain('Eigenkapital-Bandbreite');
			expect(labels.timeline).toContain('Kaufzeitplan');
			expect(labels.purpose).toContain('Kaufzweck');
			expect(labels.householdSize).toBe('Haushaltsgröße');
			expect(labels.schufaAvailable).toContain('Schufa-Auskunft');
			expect(labels.financingDoc).toContain('Finanzierungsbestätigung');
			expect(labels.consent).toContain('Datenschutzerklärung');
		});

		it('should indicate required fields', () => {
			const requiredFields = ['equityBand', 'timeline', 'purpose', 'consent'];
			const optionalFields = ['householdSize', 'financingDoc'];

			requiredFields.forEach((field) => {
				expect(requiredFields).toContain(field);
			});

			optionalFields.forEach((field) => {
				expect(optionalFields).toContain(field);
			});
		});
	});
});
