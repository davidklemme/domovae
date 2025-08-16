import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../src/lib/server/db/schema';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get DATABASE_URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
	console.error('❌ DATABASE_URL environment variable is not set');
	console.log('Please make sure you have a .env file with DATABASE_URL');
	process.exit(1);
}

const client = neon(DATABASE_URL);
const db = drizzle(client, { schema });

// Create a test user with owner role
async function createTestUser() {
	try {
		const testUser = {
			id: 'test-owner-user-12345',
			email: 'test-owner@example.com',
			name: 'Test Owner',
			role: 'owner',
			phone: '+49123456789',
			city: 'Berlin',
			country: 'Germany',
			isVerified: true
		};

		await db.insert(schema.users).values(testUser);

		console.log('✅ Test owner user created successfully!');
		console.log('User ID:', testUser.id);
		console.log('Email:', testUser.email);
		console.log('Role:', testUser.role);
		console.log('');
		console.log('🔑 You can now:');
		console.log('1. Sign up with email: test-owner@example.com');
		console.log('2. Create properties as this owner');
		console.log('3. Test the scheduling feature from both perspectives');
	} catch (error: unknown) {
		const errorMessage = error instanceof Error ? error.message : String(error);
		if (errorMessage.includes('duplicate key')) {
			console.log('ℹ️  Test user already exists');
			console.log('Email: test-owner@example.com');
			console.log('Role: owner');
		} else {
			console.error('❌ Error creating test user:', error);
		}
	}
}

createTestUser();
