import { redirect } from '@sveltejs/kit';
import { validateMagicToken, generateSessionToken } from '$lib/auth';
import { db } from '$lib/db';
import { sessions, magicLinks } from '$lib/db/schema';
import { eq } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';

export const load = async ({ url, cookies }) => {
	const token = url.searchParams.get('token');
	if (!token) throw redirect(303, '/login');

	const result = await validateMagicToken(token);

	if (result.error === 'not_found') {
		return { error: 'This login link is invalid.' };
	}
	if (result.error === 'already_used') {
		return { error: 'This link has already been used. Request a new one.' };
	}
	if (result.error === 'expired') {
		return { error: 'This link has expired. Request a new one.' };
	}

	// Mark token as used
	await db.update(magicLinks)
		.set({ used: 1 })
		.where(eq(magicLinks.token, token));

	// Create session
	const sessionToken = generateSessionToken();
	const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
		.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' })
		.replace(' ', 'T');

	await db.insert(sessions).values({
		id: randomUUID(),
		memberId: result.member!.id,
		sessionToken,
		expiresAt,
		createdAt: nowIST(),
	});

	// Set cookie
	cookies.set('session', sessionToken, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
	});

	throw redirect(303, '/dashboard');
};
