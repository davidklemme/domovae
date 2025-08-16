import { db } from '../db';
import { buyerProfile } from '../db/schema';
import { eq } from 'drizzle-orm';
import type {
	BuyerProfile,
	CreateBuyerProfileData,
	BuyerProfileSnapshot,
	EquityBand,
	PurchaseTimeline,
	PurchasePurpose
} from '../../types/property';

export class BuyerProfileService {
	/**
	 * Create or update a buyer profile
	 */
	static async upsertProfile(userId: string, data: CreateBuyerProfileData): Promise<BuyerProfile> {
		// Calculate retention date (12 months from now)
		const retentionUntil = new Date();
		retentionUntil.setMonth(retentionUntil.getMonth() + 12);

		// Handle file upload if provided
		let financingDocUrl: string | undefined;
		if (data.financingDoc) {
			financingDocUrl = await this.uploadFinancingDocument(userId, data.financingDoc);
		}

		const profileData = {
			userId,
			equityBand: data.equityBand,
			timeline: data.timeline,
			purpose: data.purpose,
			householdSize: data.householdSize,
			schufaAvailable: data.schufaAvailable,
			financingDocUrl,
			financingVerified: false, // Will be verified by admin
			consentTimestamp: new Date(),
			retentionUntil: retentionUntil,
			updatedAt: new Date()
		};

		// Check if profile exists
		const existingProfile = await db
			.select()
			.from(buyerProfile)
			.where(eq(buyerProfile.userId, userId));

		if (existingProfile.length > 0) {
			// Update existing profile
			const [updated] = await db
				.update(buyerProfile)
				.set(profileData)
				.where(eq(buyerProfile.userId, userId))
				.returning();

			return this.mapToBuyerProfile(updated);
		} else {
			// Create new profile
			const [created] = await db.insert(buyerProfile).values(profileData).returning();

			return this.mapToBuyerProfile(created);
		}
	}

	/**
	 * Get buyer profile by user ID
	 */
	static async getProfile(userId: string): Promise<BuyerProfile | null> {
		const profiles = await db.select().from(buyerProfile).where(eq(buyerProfile.userId, userId));

		if (profiles.length === 0) {
			return null;
		}

		return this.mapToBuyerProfile(profiles[0]);
	}

	/**
	 * Create a snapshot of buyer profile for appointments
	 */
	static async createSnapshot(userId: string): Promise<BuyerProfileSnapshot | null> {
		const profile = await this.getProfile(userId);

		if (!profile) {
			return null;
		}

		return {
			equityBand: profile.equityBand,
			timeline: profile.timeline,
			purpose: profile.purpose,
			householdSize: profile.householdSize,
			schufaAvailable: profile.schufaAvailable,
			financingVerified: profile.financingVerified,
			snapshotDate: new Date()
		};
	}

	/**
	 * Generate trust badges from buyer profile
	 */
	static generateTrustBadges(profile: BuyerProfile | BuyerProfileSnapshot) {
		const badges = [];

		// Financing badge
		if ('financingVerified' in profile && profile.financingVerified) {
			badges.push({
				type: 'financing' as const,
				label: 'Finanzierung bestätigt',
				description: 'Finanzierungsbestätigung verifiziert',
				icon: '💰',
				color: 'bg-green-100 text-green-800',
				value: 'verified'
			});
		}

		// Equity badge
		const equityLabels = {
			lt10: '< 10%',
			b10_30: '10-30%',
			b30_50: '30-50%',
			gt50: '> 50%'
		};

		badges.push({
			type: 'equity' as const,
			label: `Eigenkapital: ${equityLabels[profile.equityBand]}`,
			description: `Eigenkapital: ${equityLabels[profile.equityBand]}`,
			icon: '🏦',
			color:
				profile.equityBand === 'gt50'
					? 'bg-green-100 text-green-800'
					: profile.equityBand === 'b30_50'
						? 'bg-blue-100 text-blue-800'
						: profile.equityBand === 'b10_30'
							? 'bg-yellow-100 text-yellow-800'
							: 'bg-gray-100 text-gray-800',
			value: profile.equityBand
		});

		// Timeline badge
		const timelineLabels = {
			immediate: 'Sofort',
			lt3m: '≤ 3 Monate',
			lt6m: '≤ 6 Monate',
			gt6m: '> 6 Monate'
		};

		badges.push({
			type: 'timeline' as const,
			label: `Zeitplan: ${timelineLabels[profile.timeline]}`,
			description: `Kaufzeitplan: ${timelineLabels[profile.timeline]}`,
			icon: '⏰',
			color:
				profile.timeline === 'immediate'
					? 'bg-green-100 text-green-800'
					: profile.timeline === 'lt3m'
						? 'bg-blue-100 text-blue-800'
						: profile.timeline === 'lt6m'
							? 'bg-yellow-100 text-yellow-800'
							: 'bg-gray-100 text-gray-800',
			value: profile.timeline
		});

		// Purpose badge
		const purposeLabels = {
			eigennutzung: 'Eigennutzung',
			kapitalanlage: 'Kapitalanlage'
		};

		badges.push({
			type: 'purpose' as const,
			label: purposeLabels[profile.purpose],
			description: `Kaufzweck: ${purposeLabels[profile.purpose]}`,
			icon: profile.purpose === 'eigennutzung' ? '🏠' : '📈',
			color:
				profile.purpose === 'eigennutzung'
					? 'bg-blue-100 text-blue-800'
					: 'bg-purple-100 text-purple-800',
			value: profile.purpose
		});

		// Schufa badge
		if (profile.schufaAvailable) {
			badges.push({
				type: 'schufa' as const,
				label: 'Schufa verfügbar',
				description: 'Schufa-Auskunft auf Anfrage verfügbar',
				icon: '📋',
				color: 'bg-green-100 text-green-800',
				value: 'available'
			});
		}

		return badges;
	}

	/**
	 * Upload financing document
	 */
	private static async uploadFinancingDocument(userId: string, file: File): Promise<string> {
		// TODO: Implement secure file upload to private storage
		// For now, return a placeholder URL
		// In production, this should:
		// 1. Validate file type (PDF, JPG, PNG)
		// 2. Check file size (max 5MB)
		// 3. Scan for viruses
		// 4. Upload to private storage
		// 5. Return signed URL

		const timestamp = Date.now();
		const fileName = `financing_${userId}_${timestamp}.${file.name.split('.').pop()}`;

		return `/api/buyer-profile/financing-docs/${fileName}`;
	}

	/**
	 * Map database record to BuyerProfile interface
	 */
	private static mapToBuyerProfile(record: {
		id: number;
		userId: string;
		equityBand: string;
		timeline: string;
		purpose: string;
		householdSize: number | null;
		schufaAvailable: boolean | null;
		financingDocUrl: string | null;
		financingVerified: boolean | null;
		consentTimestamp: Date;
		retentionUntil: Date;
		createdAt: Date | null;
		updatedAt: Date | null;
	}): BuyerProfile {
		return {
			id: record.id,
			userId: record.userId,
			equityBand: record.equityBand as EquityBand,
			timeline: record.timeline as PurchaseTimeline,
			purpose: record.purpose as PurchasePurpose,
			householdSize: record.householdSize || undefined,
			schufaAvailable: record.schufaAvailable || false,
			financingDocUrl: record.financingDocUrl || undefined,
			financingVerified: record.financingVerified || false,
			consentTimestamp: new Date(record.consentTimestamp),
			retentionUntil: new Date(record.retentionUntil),
			createdAt: new Date(record.createdAt || new Date()),
			updatedAt: new Date(record.updatedAt || new Date())
		};
	}

	/**
	 * Clean up expired profiles (retention policy)
	 */
	static async cleanupExpiredProfiles(): Promise<number> {
		const now = new Date();

		const result = await db
			.delete(buyerProfile)
			.where(eq(buyerProfile.retentionUntil, now))
			.returning();

		return result.length;
	}
}
