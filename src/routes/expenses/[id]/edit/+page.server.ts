import { db } from '$lib/db';
import { expenses, expenseSplits } from '$lib/db/schema';
import { isCurrentMonthIST } from '$lib/utils/time';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';

export const load = async ({ params, locals }) => {
	const expense = await db.query.expenses.findFirst({
		where: (e, { eq, and }) => and(
			eq(e.id, params.id),
			eq(e.householdId, locals.member!.householdId)
		),
	});

	if (!expense) throw error(404, 'Expense not found');

	// Ownership check
	if (expense.memberId !== locals.member!.id) {
		throw error(403, 'You can only edit your own expenses');
	}

	// Month lock check
	if (!isCurrentMonthIST(expense.date)) {
		throw error(403, 'Expenses from past months cannot be edited');
	}

	// For edit UI, we would load categories and members similarly
	// For this basic flow, if we just want to demonstrate month lock, we can return it.
	return { expense };
};

export const actions = {
	delete: async ({ params, locals }) => {
		const expense = await db.query.expenses.findFirst({
			where: (e, { eq, and }) => and(
				eq(e.id, params.id),
				eq(e.householdId, locals.member!.householdId)
			),
		});

		if (!expense) throw error(404, 'Expense not found');
		if (expense.memberId !== locals.member!.id) throw error(403, 'You can only delete your own expenses');
		if (!isCurrentMonthIST(expense.date)) throw error(403, 'Expenses from past months cannot be edited');

		await db.transaction(async (tx) => {
			await tx.delete(expenseSplits).where(eq(expenseSplits.expenseId, params.id));
			await tx.delete(expenses).where(eq(expenses.id, params.id));
		});

		throw redirect(303, '/dashboard');
	}
};
