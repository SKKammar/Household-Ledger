import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { members, categories, households } from '$lib/db/schema';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { sendMagicLink } from '$lib/email';

function generateInviteCode(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const load = async ({ locals }) => {
	if (locals.member) throw redirect(303, '/dashboard');

	const existingHousehold = await db.select()
		.from(households)
		.limit(1);
	
	if (existingHousehold.length > 0) throw redirect(303, '/login');
	return {};
};

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;

		if (!name?.trim() || !email?.trim()) {
			return { error: 'Name and email are required' };
		}

		// Double check to prevent race conditions
		const existingHousehold = await db.select().from(households).limit(1);
		if (existingHousehold.length > 0) {
			throw redirect(303, '/login');
		}

		const now = nowIST();
		const householdId = randomUUID();
		const memberId = randomUUID();

		await db.transaction(async (tx) => {
			await tx.insert(households).values({
				id: householdId,
				name: 'My Household', // Default name
				inviteCode: generateInviteCode(),
				createdAt: now,
			});

			await tx.insert(members).values({
				id: memberId,
				householdId,
				name: name.trim(),
				email: email.trim().toLowerCase(),
				avatarColor: '#8b3a2a',
				isAdmin: 1,
				createdAt: now,
			});

			const defaults = ['Rent', 'Groceries', 'Electricity', 'Water', 'Fuel'];
			await tx.insert(categories).values(
				defaults.map(catName => ({
					id: randomUUID(),
					householdId,
					name: catName,
					isDefault: 1,
					createdBy: null,
					createdAt: now,
				}))
			);
		});

		const result = await sendMagicLink(email.trim().toLowerCase(), memberId);

		if (!result.success) {
			return { error: 'Household created, but could not send login email. Check logs.' };
		}

		return { success: true, message: 'Check your email for the login link.' };
	}
};
