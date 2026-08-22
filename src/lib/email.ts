import { Resend } from 'resend';
import { RESEND_API_KEY } from '$env/static/private';
import { PUBLIC_APP_URL } from '$env/static/public';
import { db } from './db';
import { magicLinks } from './db/schema';
import { eq } from 'drizzle-orm';
import { generateToken } from './auth';
import { nowIST } from './utils/time';
import { randomUUID } from 'crypto';

const resend = new Resend(RESEND_API_KEY);

export async function sendMagicLink(email: string, memberId: string) {
	// Invalidate all previous unused tokens for this member
	await db.update(magicLinks)
		.set({ used: 1 })
		.where(eq(magicLinks.memberId, memberId));

	const token = generateToken();
	const now = nowIST();
	// Expires in 15 minutes
	const expiresAt = new Date(Date.now() + 15 * 60 * 1000)
		.toLocaleString('sv-SE', { timeZone: 'Asia/Kolkata' })
		.replace(' ', 'T');

	await db.insert(magicLinks).values({
		id: randomUUID(),
		memberId,
		token,
		expiresAt,
		used: 0,
		createdAt: now,
	});

	const link = `${PUBLIC_APP_URL}/auth/verify?token=${token}`;

	await resend.emails.send({
		from: 'Household Ledger <noreply@yourdomain.com>',
		to: email,
		subject: 'Your login link — Household Ledger',
		html: `
			<p>Click the link below to log in. This link expires in 15 minutes and can only be used once.</p>
			<a href="${link}">Log in to Household Ledger</a>
			<p>If you did not request this, ignore this email.</p>
		`,
	});
}
