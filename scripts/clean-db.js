import { neon } from '@neondatabase/serverless';
import { DATABASE_URL } from '$env/static/private';

if (!DATABASE_URL) {
	console.error('DATABASE_URL environment variable is not set');
	process.exit(1);
}

async function cleanDatabase() {
	try {
		console.log('🔧 Connecting to database...');
		const sql = neon(DATABASE_URL);

		console.log('🗑️ Dropping all existing tables...');

		// Drop all tables in the correct order
		await sql`DROP TABLE IF EXISTS "proximities" CASCADE`;
		await sql`DROP TABLE IF EXISTS "property_media" CASCADE`;
		await sql`DROP TABLE IF EXISTS "property_amenities" CASCADE`;
		await sql`DROP TABLE IF EXISTS "property_locations" CASCADE`;
		await sql`DROP TABLE IF EXISTS "properties" CASCADE`;
		await sql`DROP TABLE IF EXISTS "data_subject_requests" CASCADE`;
		await sql`DROP TABLE IF EXISTS "consent_records" CASCADE`;
		await sql`DROP TABLE IF EXISTS "audit_logs" CASCADE`;
		await sql`DROP TABLE IF EXISTS "data_processing_activities" CASCADE`;
		await sql`DROP TABLE IF EXISTS "amenities" CASCADE`;
		await sql`DROP TABLE IF EXISTS "verificationToken" CASCADE`;
		await sql`DROP TABLE IF EXISTS "session" CASCADE`;
		await sql`DROP TABLE IF EXISTS "account" CASCADE`;
		await sql`DROP TABLE IF EXISTS "user" CASCADE`;

		console.log('✅ All tables dropped successfully!');
		console.log('🎉 Database is now clean and ready for new schema');
	} catch (error) {
		console.error('❌ Error cleaning database:', error);
		console.error('❌ Error details:', {
			message: error instanceof Error ? error.message : 'Unknown error',
			stack: error instanceof Error ? error.stack : 'No stack trace',
			code: error?.code || 'No error code'
		});
		process.exit(1);
	}
}

cleanDatabase();
