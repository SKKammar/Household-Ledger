import { db } from '$lib/db';
import { members, categories, expenses, expenseSplits } from '$lib/db/schema';
import { isNull, and, ne, eq, inArray } from 'drizzle-orm';
import { nowIST, todayIST, isCurrentMonthIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { redirect } from '@sveltejs/kit';
import { memberScope, categoryScope } from '$lib/db/scope';

export const load = async ({ locals }) => {
	const activeCategories = await db.select()
		.from(categories)
		.where(categoryScope(locals.member!.householdId));

	const activeMembers = await db.select()
		.from(members)
		.where(and(
			memberScope(locals.member!.householdId),
			ne(members.id, locals.member!.id)
		));

	return {
		categories: activeCategories,
		members: activeMembers,
		today: todayIST()
	};
};

export const actions = {
	default: async ({ request, locals }) => {
		const data = await request.formData();
		const amount = parseFloat(data.get('amount') as string);
		const categoryId = data.get('categoryId') as string;
		const date = data.get('date') as string;
		const note = data.get('note') as string;
		const isSplit = data.get('isSplit') === 'true';
		const splitMemberIds = data.getAll('splitMembers') as string[];

		if (isNaN(amount) || amount <= 0) {
			return { error: 'Amount must be greater than zero.' };
		}
		if (!categoryId) {
			return { error: 'Category is required.' };
		}
		if (isSplit && splitMemberIds.length === 0) {
			return { error: 'Select at least one member to split with.' };
		}
		if (!isCurrentMonthIST(date)) {
			return { error: 'You can only record expenses for the current month.' };
		}

		const currentMember = locals.member!;
		const splitAmong = isSplit ? splitMemberIds.length + 1 : null;
		
		if (isSplit && splitMemberIds.length > 0) {
			const validMembers = await db.select()
				.from(members)
				.where(and(
					memberScope(currentMember.householdId),
					inArray(members.id, splitMemberIds)
				));
			if (validMembers.length !== splitMemberIds.length) {
				return { error: 'One or more selected members are no longer active.' };
			}
		}

		await db.transaction(async (tx) => {
			const expenseId = randomUUID();
			
			await tx.insert(expenses).values({
				id: expenseId,
				householdId: currentMember.householdId,
				memberId: currentMember.id,
				categoryId,
				amount,
				note: note?.trim() || null,
				date,
				isSplit: isSplit ? 1 : 0,
				splitAmong,
				createdAt: nowIST(),
			});

			if (isSplit && splitMemberIds.length > 0) {
				const shareAmount = amount / splitAmong!;
				await tx.insert(expenseSplits).values(
					splitMemberIds.map(memberId => ({
						id: randomUUID(),
						expenseId,
						memberId,
						shareAmount,
						createdAt: nowIST(),
					}))
				);
			}
		});

		throw redirect(303, '/dashboard');
	}
};
