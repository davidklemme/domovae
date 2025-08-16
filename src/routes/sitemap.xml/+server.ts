// import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	try {
		// Get all live properties
		const liveProperties = await db
			.select({
				id: properties.id,
				title: properties.title,
				updatedAt: properties.updatedAt
			})
			.from(properties)
			.where(eq(properties.status, 'live'));

		const baseUrl = `${url.protocol}//${url.host}`;

		// Generate sitemap XML
		const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Properties listing page -->
  <url>
    <loc>${baseUrl}/properties</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  
  <!-- Individual property pages -->
  ${liveProperties
		.map((property) => {
			const propertyUrl = `${baseUrl}/properties/${property.id}`;
			const lastmod = property.updatedAt
				? new Date(property.updatedAt).toISOString()
				: new Date().toISOString();

			return `  <url>
    <loc>${propertyUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
		})
		.join('\n')}
</urlset>`;

		return new Response(sitemap, {
			headers: {
				'Content-Type': 'application/xml',
				'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
			}
		});
	} catch (error) {
		console.error('Error generating sitemap:', error);
		return new Response('Error generating sitemap', { status: 500 });
	}
};
