import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { members } from '$lib/db/schema';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { sendMagicLink } from '$lib/email';

const palette = ['#8b3a2a', '#3a6b4a', '#2a4a6b', '#7a5a1a', '#5a2a7a', '#2a7a7a'];
function pickRandomColor() {
	return palette[Math.floor(Math.random() * palette.length)];
}

export const load = async ({ locals }) => {
	if (locals.member) throw redirect(303, '/dashboard');
	return {};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const inviteCode = data.get('inviteCode') as string;
		const name = data.get('name') as string;
		const email = data.get('email') as string;

		if (!inviteCode?.trim() || !name?.trim() || !email?.trim()) {
			return { error: 'All fields are required.' };
		}

		// 1. Validate invite code
		const household = await db.query.households.findFirst({
			where: (h, { eq }) => eq(h.inviteCode, inviteCode.trim().toUpperCase())
		});

		if (!household) {
			return { error: 'Invalid invite code.' };
		}

		const cleanEmail = email.trim().toLowerCase();

		// 2. Check for existing member with this email IN THIS HOUSEHOLD
		const existing = await db.query.members.findFirst({
			where: (m, { eq, and }) => and(
				eq(m.email, cleanEmail),
				eq(m.householdId, household.id)
			)
		});

		if (existing && !existing.deletedAt) {
			return { error: 'This email is already registered in this household.' };
		}
		if (existing && existing.deletedAt) {
			return { error: 'This account was removed. Contact your admin.' };
		}

		const memberId = randomUUID();

		// 3. Create member
		await db.insert(members).values({
			id: memberId,
			householdId: household.id,
			name: name.trim(),
			email: cleanEmail,
			avatarColor: pickRandomColor(),
			isAdmin: 0,
			createdAt: nowIST(),
		});

		// 4. Send magic link
		const result = await sendMagicLink(cleanEmail, memberId);

		if (!result.success) {
			return { error: 'Joined household, but could not send login email. Ask your admin to re-invite you from the dashboard.' };
		}

		return { success: true, message: 'Welcome! Check your email for the login link.' };
	}
};
