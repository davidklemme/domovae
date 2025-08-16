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

// Create a test property with the test user as owner
async function createTestProperty() {
	try {
		// Use the test user ID that was created manually
		const testOwnerId = 'test-owner-user-12345'; // This should match the ID you created manually

		const [newProperty] = await db
			.insert(schema.properties)
			.values({
				ownerId: testOwnerId,
				title: 'Test Property for Scheduling',
				description: 'This is a test property to test the scheduling feature',
				price: 250000,
				propertyType: 'apartment',
				status: 'live'
			})
			.returning();

		// Add location for the property
		await db.insert(schema.propertyLocations).values({
			propertyId: newProperty.id,
			street: 'Test Street 123',
			city: 'Berlin',
			postalCode: '10115',
			country: 'Germany'
		});

		console.log('✅ Test property created successfully!');
		console.log('Property ID:', newProperty.id);
		console.log('Owner ID:', testOwnerId);
		console.log('You can now test scheduling as a buyer for this property');
	} catch (error) {
		console.error('❌ Error creating test property:', error);
	}
}

createTestProperty();
