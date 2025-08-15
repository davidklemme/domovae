import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { put } from '@vercel/blob';
import { db } from '$lib/server/db';
import { propertyMedia } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;
	if (!propertyId) {
		return json({ error: 'Property ID is required' }, { status: 400 });
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
			const blob = await put(fileName, file, {
				access: 'public',
				token: BLOB_READ_WRITE_TOKEN
			});

			// Save to database
			const mediaRecord = await db
				.insert(propertyMedia)
				.values({
					propertyId: parseInt(propertyId),
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
	} catch (error) {
		console.error('Error uploading media:', error);
		return json({ error: 'Failed to upload media' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ params, request, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const propertyId = params.id;
	if (!propertyId) {
		return json({ error: 'Property ID is required' }, { status: 400 });
	}

	try {
		const { mediaId } = await request.json();

		if (!mediaId) {
			return json({ error: 'Media ID is required' }, { status: 400 });
		}

		// Delete from database
		await db.delete(propertyMedia).where(eq(propertyMedia.id, mediaId));

		return json({
			success: true,
			message: 'Media deleted successfully'
		});
	} catch (error) {
		console.error('Error deleting media:', error);
		return json({ error: 'Failed to delete media' }, { status: 500 });
	}
};
