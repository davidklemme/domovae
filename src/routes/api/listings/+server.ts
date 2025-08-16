import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function stripHtml(input: string | null): string | null {
	if (!input) return input;
	return input.replace(/<[^>]*>/g, '');
}

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get all live properties with essential data
		const liveProperties = await db
			.select({
				id: properties.id,
				title: properties.title,
				description: properties.description,
				price: properties.price,
				status: properties.status,
				createdAt: properties.createdAt,
				updatedAt: properties.updatedAt
			})
			.from(properties)
			.where(eq(properties.status, 'live'))
			.orderBy(properties.updatedAt);

		const baseUrl = `${url.protocol}//${url.host}`;

		// Transform data for AI consumption
		const listings = liveProperties.map((property) => ({
			id: property.id,
			title: property.title,
			description: stripHtml(property.description) || undefined,
			price: property.price,
			url: `${baseUrl}/properties/${property.id}`,
			createdAt: property.createdAt,
			updatedAt: property.updatedAt
		}));

		return json(
			{
				metadata: {
					generatedAt: new Date().toISOString(),
					totalListings: listings.length,
					baseUrl: baseUrl
				},
				listings: listings
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'Cache-Control': 'public, max-age=1800' // Cache for 30 minutes
				}
			}
		);
	} catch (error) {
		console.error('Error generating listings feed');
		return json({ error: 'Failed to generate listings feed' }, { status: 500 });
	}
};
