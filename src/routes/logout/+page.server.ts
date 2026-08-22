import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { sessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

export const actions = {
	default: async ({ cookies }) => {
		const sessionToken = cookies.get('session');
		
		if (sessionToken) {
			// Remove from database
			await db.delete(sessions).where(eq(sessions.sessionToken, sessionToken));
			
			// Clear cookie
			cookies.delete('session', { path: '/' });
		}
		
		throw redirect(303, '/login');
	}
};
