import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { members } from '$lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { sendMagicLink } from '$lib/email';

export const load = async ({ locals }) => {
	if (locals.member) throw redirect(303, '/dashboard');
	return {};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const email = data.get('email') as string;

		if (!email?.trim()) {
			return { error: 'Email is required' };
		}

		const member = await db.query.members.findFirst({
			where: (m, { eq, and, isNull }) => and(
				eq(m.email, email.trim().toLowerCase()),
				isNull(m.deletedAt)
			)
		});

		if (!member) {
			return { error: 'This email is not registered in your household.' };
		}

		await sendMagicLink(email.trim().toLowerCase(), member.id);

		return { success: true, message: 'Check your email for the login link.' };
	}
};
