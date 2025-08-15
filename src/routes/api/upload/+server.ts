import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { put } from '@vercel/blob';

export const POST: RequestHandler = async ({ request, locals }) => {
	const session = await locals.getSession();

	if (!session?.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ error: 'No file provided' }, { status: 400 });
		}

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			return json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 });
		}

		// Validate file size (max 10MB)
		const maxSize = 10 * 1024 * 1024; // 10MB
		if (file.size > maxSize) {
			return json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
		}

		// Generate unique filename
		const timestamp = Date.now();
		const randomString = Math.random().toString(36).substring(2, 15);
		const extension = file.name.split('.').pop();
		const filename = `properties/${session.user.id}/${timestamp}-${randomString}.${extension}`;

		// Upload to Vercel Blob
		const blob = await put(filename, file, {
			access: 'public',
			addRandomSuffix: false
		});

		return json({
			url: blob.url,
			filename: filename,
			size: file.size,
			type: file.type
		});
	} catch (err) {
		console.error('Error uploading file:', err);
		return json({ error: 'Failed to upload file' }, { status: 500 });
	}
};
