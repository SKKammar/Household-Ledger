import { db } from '$lib/db';
import { members, categories, expenses, expenseSplits } from '$lib/db/schema';
import { isNull, and, ne } from 'drizzle-orm';
import { nowIST, todayIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { redirect } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	const activeCategories = await db.select()
		.from(categories)
		.where(isNull(categories.deletedAt));

	const activeMembers = await db.select()
		.from(members)
		.where(and(
			isNull(members.deletedAt),
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

		const currentMember = locals.member!;
		const splitAmong = isSplit ? splitMemberIds.length + 1 : null;
		
		await db.transaction(async (tx) => {
			const expenseId = randomUUID();
			
			await tx.insert(expenses).values({
				id: expenseId,
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
