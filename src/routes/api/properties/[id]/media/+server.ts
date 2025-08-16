import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { put } from '@vercel/blob';
import { db } from '$lib/server/db';
import { propertyMedia, properties } from '$lib/server/db/schema';
import { and, eq } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyIdParam = params.id;
	if (!propertyIdParam) {
		return json({ error: 'Property ID is required' }, { status: 400 });
	}
	const propertyId = parseInt(propertyIdParam);
	if (isNaN(propertyId)) {
		return json({ error: 'Invalid property ID' }, { status: 400 });
	}

	// Verify property ownership or admin role
	const property = await db.query.properties.findFirst({ where: eq(properties.id, propertyId) });
	if (!property) {
		return json({ error: 'Property not found' }, { status: 404 });
	}
	const isOwner = property.ownerId === session.user.id;
	const isAdmin = (session.user as { role?: string }).role === 'admin';
	if (!isOwner && !isAdmin) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const formData = await request.formData();
		const files = formData.getAll('files') as File[];
		const mediaCategory = formData.get('mediaCategory') as string;

		if (!files || files.length === 0) {
			return json({ error: 'No files provided' }, { status: 400 });
		}

		if (!mediaCategory || !['hero', 'slideshow', 'layout'].includes(mediaCategory)) {
			return json(
				{ error: 'Invalid media category. Must be hero, slideshow, or layout' },
				{ status: 400 }
			);
		}

		const uploadedMedia = [];

		for (const file of files) {
			// Validate file type
			if (!file.type.startsWith('image/')) {
				continue; // Skip non-image files
			}

			// Validate file size (max 10MB)
			if (file.size > 10 * 1024 * 1024) {
				continue; // Skip files larger than 10MB
			}

			// Generate unique filename
			const timestamp = Date.now();
			const randomString = Math.random().toString(36).substring(2, 15);
			const extension = file.name.split('.').pop();
			const fileName = `${propertyId}_${mediaCategory}_${timestamp}_${randomString}.${extension}`;

			// Upload to Vercel Blob
			const putOptions: Record<string, unknown> = { access: 'public' };
			if (env.BLOB_READ_WRITE_TOKEN) {
				putOptions.token = env.BLOB_READ_WRITE_TOKEN;
			}
			const blob = await put(fileName, file, putOptions as { access: 'public'; token?: string });

			// Save to database
			const mediaRecord = await db
				.insert(propertyMedia)
				.values({
					propertyId: propertyId,
					mediaType: 'image',
					mediaCategory: mediaCategory,
					mediaUrl: blob.url,
					fileName: file.name,
					fileSize: file.size,
					mimeType: file.type,
					altText: file.name,
					displayOrder: 0
				})
				.returning();

			uploadedMedia.push(mediaRecord[0]);
		}

		return json({
			success: true,
			media: uploadedMedia,
			message: `Successfully uploaded ${uploadedMedia.length} files`
		});
	} catch {
		console.error('Error uploading media');
		return json({ error: 'Failed to upload media' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyIdParam = params.id;
	if (!propertyIdParam) {
		return json({ error: 'Property ID is required' }, { status: 400 });
	}
	const propertyId = parseInt(propertyIdParam);
	if (isNaN(propertyId)) {
		return json({ error: 'Invalid property ID' }, { status: 400 });
	}

	// Verify property ownership or admin role
	const property = await db.query.properties.findFirst({ where: eq(properties.id, propertyId) });
	if (!property) {
		return json({ error: 'Property not found' }, { status: 404 });
	}
	const isOwner = property.ownerId === session.user.id;
	const isAdmin = (session.user as { role?: string }).role === 'admin';
	if (!isOwner && !isAdmin) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	try {
		const { mediaId } = await request.json();

		if (!mediaId || Number.isNaN(Number(mediaId))) {
			return json({ error: 'Valid media ID is required' }, { status: 400 });
		}

		// Ensure media belongs to the property
		const mediaRecord = await db.query.propertyMedia.findFirst({
			where: and(eq(propertyMedia.id, Number(mediaId)), eq(propertyMedia.propertyId, propertyId))
		});
		if (!mediaRecord) {
			return json({ error: 'Media not found' }, { status: 404 });
		}

		// Delete from database
		await db
			.delete(propertyMedia)
			.where(and(eq(propertyMedia.id, Number(mediaId)), eq(propertyMedia.propertyId, propertyId)));

		return json({
			success: true,
			message: 'Media deleted successfully'
		});
	} catch {
		console.error('Error deleting media');
		return json({ error: 'Failed to delete media' }, { status: 500 });
	}
};
