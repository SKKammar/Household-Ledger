import { db } from '$lib/db';
import { members, magicLinks, sessions, categories, expenses, expenseSplits, households } from '$lib/db/schema';
import { eq, isNull, and, ne, inArray } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { sendMagicLink } from '$lib/email';
import { memberScope } from '$lib/db/scope';
import { redirect, error } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.member?.isAdmin) throw redirect(303, '/dashboard');

	const household = await db.query.households.findFirst({
		where: (h, { eq }) => eq(h.id, locals.member!.householdId)
	});

	const allMembers = await db.select()
		.from(members)
		.where(memberScope(locals.member!.householdId))
		.orderBy(members.createdAt);
	
	const activeMembers = allMembers.filter(m => !m.deletedAt);

	return {
		allMembers,
		isOnlyAdmin: activeMembers.length === 1 && locals.member.isAdmin === 1,
		inviteCode: household?.inviteCode,
		householdName: household?.name
	};
};

const palette = ['#8b3a2a', '#3a6b4a', '#2a4a6b', '#7a5a1a', '#5a2a7a', '#2a7a7a'];
function pickRandomColor() {
	return palette[Math.floor(Math.random() * palette.length)];
}

function generateInviteCode(): string {
	const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export const actions = {
	updateHouseholdName: async ({ request, locals }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const name = (await request.formData()).get('householdName') as string;
		if (!name?.trim()) return { error: 'Household name is required.' };
		
		await db.update(households)
			.set({ name: name.trim() })
			.where(eq(households.id, locals.member!.householdId));
			
		return { success: true };
	},

	addMember: async ({ request, locals }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const data = await request.formData();
		const name = data.get('name') as string;
		const email = data.get('email') as string;

		const existing = await db.query.members.findFirst({
			where: (m, { eq, and }) => and(
				eq(m.email, email.toLowerCase()),
				eq(m.householdId, locals.member!.householdId)
			)
		});

		if (existing && !existing.deletedAt) return { error: 'This email is already registered in this household.' };
		if (existing && existing.deletedAt) return { error: 'This account was removed. Delete from DB fully if you wish to add again.' };

		const memberId = randomUUID();
		await db.insert(members).values({
			id: memberId,
			householdId: locals.member!.householdId,
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
		
		const target = await db.query.members.findFirst({
			where: (m, { eq, and }) => and(eq(m.id, memberId), eq(m.householdId, locals.member!.householdId))
		});
		if (!target) throw error(404, 'Member not found');

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
				memberScope(locals.member!.householdId),
				eq(members.isAdmin, 1),
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

		const target = await db.query.members.findFirst({
			where: (m, { eq, and }) => and(eq(m.id, memberId), eq(m.householdId, locals.member!.householdId))
		});
		if (!target) throw error(404, 'Member not found');

		const activeMembers = await db.select()
			.from(members)
			.where(memberScope(locals.member!.householdId));

		if (activeMembers.length <= 1) {
			return { error: 'Cannot remove the last member.' };
		}

		await db.update(members)
			.set({ deletedAt: nowIST() })
			.where(eq(members.id, memberId));
		return { success: true };
	},

	regenerateInviteCode: async ({ locals }) => {
		if (!locals.member?.isAdmin) throw error(403);

		const newCode = generateInviteCode();

		await db.update(households)
			.set({ inviteCode: newCode })
			.where(eq(households.id, locals.member!.householdId));

		return { success: true, newCode };
	},

	resetHousehold: async ({ request, locals, cookies }) => {
		if (!locals.member?.isAdmin) throw error(403);
		
		const confirm = (await request.formData()).get('confirm') as string;
		
		if (confirm !== 'CONFIRM') {
			return { error: 'Type CONFIRM to reset.' };
		}

		const householdId = locals.member!.householdId;

		const householdExpenses = await db.select({ id: expenses.id })
			.from(expenses)
			.where(eq(expenses.householdId, householdId));
		const expenseIds = householdExpenses.map(e => e.id);

		if (expenseIds.length > 0) {
			await db.delete(expenseSplits).where(inArray(expenseSplits.expenseId, expenseIds));
		}
		
		await db.delete(expenses).where(eq(expenses.householdId, householdId));
		await db.delete(categories).where(eq(categories.householdId, householdId));

		const householdMembers = await db.select({ id: members.id })
			.from(members)
			.where(eq(members.householdId, householdId));
		const memberIds = householdMembers.map(m => m.id);

		if (memberIds.length > 0) {
			await db.delete(sessions).where(inArray(sessions.memberId, memberIds));
			await db.delete(magicLinks).where(inArray(magicLinks.memberId, memberIds));
			await db.delete(members).where(eq(members.householdId, householdId));
		}

		await db.delete(households).where(eq(households.id, householdId));

		cookies.delete('session', { path: '/' });
		
		throw redirect(303, '/setup');
	}
};
