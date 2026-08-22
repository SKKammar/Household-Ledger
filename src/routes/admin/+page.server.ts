import { db } from '$lib/db';
import { members, magicLinks, sessions, categories, expenses, expenseSplits } from '$lib/db/schema';
import { eq, isNull, and, ne } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { sendMagicLink } from '$lib/email';
import { redirect, error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.member?.isAdmin) throw redirect(303, '/dashboard');

	const allMembers = await db.select().from(members).orderBy(members.createdAt);
	
	const activeMembers = allMembers.filter(m => !m.deletedAt);

	return {
		allMembers,
		isOnlyAdmin: activeMembers.length === 1 && locals.member.isAdmin === 1
	};
};

const palette = ['#8b3a2a', '#3a6b4a', '#2a4a6b', '#7a5a1a', '#5a2a7a', '#2a7a7a'];
function pickRandomColor() {
	return palette[Math.floor(Math.random() * palette.length)];
}

export const actions = {
	addMember: async ({ request, locals }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;

		const existing = await db.query.members.findFirst({
			where: (m, { eq }) => eq(m.email, email.toLowerCase()),
		});

		if (existing) return { error: 'This email is already registered.' };

		const memberId = randomUUID();
		await db.insert(members).values({
			id: memberId,
			name: name.trim(),
			email: email.trim().toLowerCase(),
			avatarColor: pickRandomColor(),
			isAdmin: 0,
			createdAt: nowIST(),
		});

		const result = await sendMagicLink(email.trim().toLowerCase(), memberId);

		if (!result.success) {
			return {
				error: 'Member added but welcome email failed to send. Try re-inviting them from the admin panel.'
			};
		}

		return { success: true };
	},

	promoteAdmin: async ({ request, locals }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const memberId = (await request.formData()).get('memberId') as string;
		await db.update(members)
			.set({ isAdmin: 1 })
			.where(eq(members.id, memberId));
		return { success: true };
	},

	stepDown: async ({ locals }) => {
		if (!locals.member?.isAdmin) throw error(403);

		const otherAdmins = await db.select()
			.from(members)
			.where(and(
				eq(members.isAdmin, 1),
				isNull(members.deletedAt),
				ne(members.id, locals.member!.id)
			));

		if (otherAdmins.length === 0) {
			return { error: 'Assign another admin before stepping down.' };
		}

		await db.update(members)
			.set({ isAdmin: 0 })
			.where(eq(members.id, locals.member!.id));
		return { success: true };
	},

	removeMember: async ({ request, locals }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const memberId = (await request.formData()).get('memberId') as string;

		if (memberId === locals.member!.id) {
			return { error: 'You cannot remove yourself.' };
		}

		const activeMembers = await db.select()
			.from(members)
			.where(isNull(members.deletedAt));

		if (activeMembers.length <= 1) {
			return { error: 'Cannot remove the last member.' };
		}

		await db.update(members)
			.set({ deletedAt: nowIST() })
			.where(eq(members.id, memberId));
		return { success: true };
	},

	resetHousehold: async ({ request, locals, cookies }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const confirm = (await request.formData()).get('confirm') as string;
		
		if (confirm !== 'CONFIRM') {
			return { error: 'Type CONFIRM to reset.' };
		}

		// Hard delete everything in order (respect foreign keys)
		await db.delete(expenseSplits);
		await db.delete(expenses);
		await db.delete(categories);
		await db.delete(sessions);
		await db.delete(magicLinks);
		await db.delete(members);

		cookies.delete('session', { path: '/' });
		
		throw redirect(303, '/setup');
	}
};
