import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
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

		const memberRecords = await db.query.members.findMany({
			where: (m, { eq, and, isNull }) => and(
				eq(m.email, email.trim().toLowerCase()),
				isNull(m.deletedAt)
			),
			with: { household: true }
		});

		if (memberRecords.length === 0) {
			return { error: 'This email is not registered in any household.' };
		}

		if (memberRecords.length === 1) {
			const member = memberRecords[0];
			const result = await sendMagicLink(email.trim().toLowerCase(), member.id);

			if (!result.success) {
				return { error: 'Could not send email. Try again in a moment.' };
			}

			return { success: true, message: 'Check your email for the login link.' };
		}

		return { 
			households: memberRecords.map(m => ({
				id: m.household.id,
				name: m.household.name,
				memberId: m.id
			})),
			email: email.trim().toLowerCase()
		};
	},

	selectHousehold: async ({ request }) => {
		const data = await request.formData();
		const memberId = data.get('memberId') as string;
		const email = data.get('email') as string;

		if (!memberId || !email) return { error: 'Missing information.' };

		const result = await sendMagicLink(email.trim().toLowerCase(), memberId);
		if (!result.success) {
			return { error: 'Failed to send login email. Please try again later.' };
		}
		return { success: true, message: 'Check your email for the login link.' };
	}
};
