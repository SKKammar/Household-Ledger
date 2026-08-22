import { randomBytes } from 'crypto';
import { db } from './db';
import { sessions } from './db/schema';

// Generate a cryptographically secure token
export function generateToken(): string {
	return randomBytes(32).toString('hex'); // 64 hex characters
}

// Generate a session token
export function generateSessionToken(): string {
	return randomBytes(32).toString('hex');
}

// Get member from session cookie
export async function getMemberFromSession(sessionToken: string | undefined) {
	if (!sessionToken) return null;
	
	const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T');
	const result = await db.query.sessions.findFirst({
		where: (s, { eq, and, gt }) => and(
			eq(s.sessionToken, sessionToken),
			gt(s.expiresAt, now)
		),
		with: { member: true },
	});
	
	if (!result?.member || result.member.deletedAt) return null;
	return result.member;
}

// Validate a magic link token
export async function validateMagicToken(token: string) {
	const now = new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' }).replace(' ', 'T');
	const link = await db.query.magicLinks.findFirst({
		where: (ml, { eq }) => eq(ml.token, token),
		with: { member: true },
	});
	
	if (!link || !link.member || link.member.deletedAt) return { error: 'not_found' };
	if (link.used) return { error: 'already_used' };
	if (link.expiresAt < now) return { error: 'expired' };
	
	return { link, member: link.member };
}
