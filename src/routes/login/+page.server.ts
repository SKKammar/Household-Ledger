import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { sendMagicLink } from '$lib/email';

export const load = async ({ locals }) => {
	if (locals.member) throw redirect(303, '/dashboard');
	return {};
};

export const actions = {
	findHouseholds: async ({ request }) => {
		const data = await request.formData();
		const email = (data.get('email') as string)?.trim().toLowerCase();

		if (!email) return { error: 'Enter your email.' };

		const memberships = await db.query.members.findMany({
			where: (m, { eq, isNull, and }) => and(
				eq(m.email, email),
				isNull(m.deletedAt)
			),
			with: { household: true }
		});

		if (memberships.length === 0) {
			return { error: 'This email is not registered in any household.' };
		}

		if (memberships.length === 1) {
			await sendMagicLink(email, memberships[0].id);
			return { sent: true };
		}

		return {
			households: memberships.map(m => ({
				memberId: m.id,
				householdName: m.household.name,
				createdAt: m.household.createdAt
			})),
			email
		};
	},

	sendLink: async ({ request }) => {
		const data = await request.formData();
		const memberId = data.get('memberId') as string;

		if (!memberId) return { error: 'Select a household.' };

		const member = await db.query.members.findFirst({
			where: (m, { eq, isNull, and }) => and(
				eq(m.id, memberId),
				isNull(m.deletedAt)
			)
		});

		if (!member) {
			return { error: 'This account is no longer active.' };
		}

		await sendMagicLink(member.email, member.id);
		return { sent: true };
	}
};
