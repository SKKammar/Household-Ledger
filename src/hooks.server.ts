import type { Handle } from '@sveltejs/kit';
import { getMemberFromSession } from '$lib/auth';
import { db } from '$lib/db';
import { sessions } from '$lib/db/schema';
import { eq } from 'drizzle-orm';

const PUBLIC_ROUTES = ['/login', '/auth/verify', '/setup', '/join'];

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = event.cookies.get('session');
	const member = await getMemberFromSession(sessionToken);
	event.locals.member = member;

	// Rolling session — extend on every valid request
	if (member && sessionToken) {
		const newExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
			.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' })
			.replace(' ', 'T');

		// Update DB expiry
		await db.update(sessions)
			.set({ expiresAt: newExpiry })
			.where(eq(sessions.sessionToken, sessionToken));

		// Refresh cookie expiry
		event.cookies.set('session', sessionToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			path: '/',
			maxAge: 30 * 24 * 60 * 60,
		});
	}

	const isPublic = PUBLIC_ROUTES.some(r => event.url.pathname.startsWith(r));

	if (!member && !isPublic) {
		return Response.redirect(`${event.url.origin}/login`, 303);
	}

	return resolve(event);
};
