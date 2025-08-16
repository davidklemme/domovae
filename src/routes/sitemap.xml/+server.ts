// import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { properties } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

function escapeXml(input: string): string {
	return input
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

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
    <loc>${escapeXml(baseUrl)}</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Properties listing page -->
  <url>
    <loc>${escapeXml(baseUrl + '/properties')}</loc>
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
    <loc>${escapeXml(propertyUrl)}</loc>
    <lastmod>${escapeXml(lastmod)}</lastmod>
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
	} catch {
		console.error('Error generating sitemap');
		return new Response('Error generating sitemap', { status: 500 });
	}
};
