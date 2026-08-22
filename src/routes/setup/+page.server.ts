import { redirect } from '@sveltejs/kit';
import { db } from '$lib/db';
import { members, categories } from '$lib/db/schema';
import { isNull } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { sendMagicLink } from '$lib/email';

export const load = async () => {
	// Check if any active member exists
	const existing = await db.select()
		.from(members)
		.where(isNull(members.deletedAt))
		.limit(1);
	
	// If members exist, setup is done — redirect to login
	if (existing.length > 0) throw redirect(303, '/login');
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

		const now = nowIST();
		const memberId = randomUUID();

		// Create the first admin member
		await db.insert(members).values({
			id: memberId,
			name: name.trim(),
			email: email.trim().toLowerCase(),
			avatarColor: '#8b3a2a',
			isAdmin: 1,
			createdAt: now,
		});

		// Seed default categories
		const defaults = ['Rent', 'Groceries', 'Electricity', 'Water', 'Fuel'];
		await db.insert(categories).values(
			defaults.map(name => ({
				id: randomUUID(),
				name,
				isDefault: 1,
				createdBy: null,
				createdAt: now,
			}))
		);

		// Send magic link to the new admin
		const result = await sendMagicLink(email.trim().toLowerCase(), memberId);

		if (!result.success) {
			return { error: 'Could not send login email. Try again in a moment.' };
		}

		return { success: true, message: 'Check your email for the login link.' };
	}
};
