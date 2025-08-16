import { db } from '../src/lib/server/db/index.js';
import { users } from '../src/lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// Replace with your actual email
const YOUR_EMAIL = 'your-email@example.com'; // Change this to your email

async function switchRole() {
	try {
		// Get current role
		const user = await db.query.users.findFirst({
			where: eq(users.email, YOUR_EMAIL)
		});

		if (!user) {
			console.log('❌ User not found. Please update YOUR_EMAIL in the script.');
			return;
		}

		console.log('Current role:', user.role);

		// Switch role
		const newRole = user.role === 'buyer' ? 'owner' : 'buyer';

		await db.update(users).set({ role: newRole }).where(eq(users.email, YOUR_EMAIL));

		console.log(`✅ Role switched from '${user.role}' to '${newRole}'`);
		console.log('🔄 Please refresh your browser and sign out/in to see the changes');
	} catch (error) {
		console.error('❌ Error switching role:', error);
	}
}

switchRole();
