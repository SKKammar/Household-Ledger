import { eq, and, isNull } from 'drizzle-orm';
import { members, categories, expenses } from './schema';

export function memberScope(householdId: string) {
	return and(
		eq(members.householdId, householdId),
		isNull(members.deletedAt)
	);
}

export function categoryScope(householdId: string) {
	return and(
		eq(categories.householdId, householdId),
		isNull(categories.deletedAt)
	);
}

export function expenseScope(householdId: string) {
	return eq(expenses.householdId, householdId);
}
