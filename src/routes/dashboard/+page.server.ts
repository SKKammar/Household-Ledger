import { db } from '$lib/db';
import { members } from '$lib/db/schema';
import { currentMonthIST } from '$lib/utils/time';
import { isNull, and, eq, like } from 'drizzle-orm';
import { memberScope } from '$lib/db/scope';

export const load = async ({ locals, url }) => {
	const member = locals.member!;
	
	// Get month/year from query params, default to current IST month
	const { year, month } = currentMonthIST();
	const selectedYear = parseInt(url.searchParams.get('year') ?? String(year));
	const selectedMonth = parseInt(url.searchParams.get('month') ?? String(month));
	
	// Format for date comparison: YYYY-MM
	const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
	
	// Get all active members in the same household
	const allMembers = await db.select()
		.from(members)
		.where(memberScope(member.householdId));
		
	// For each member, get their expenses in the selected period
	const memberData = await Promise.all(
		allMembers.map(async (m) => {
			const memberExpenses = await db.query.expenses.findMany({
				where: (e, { eq, like, and }) => and(
					eq(e.householdId, member.householdId),
					eq(e.memberId, m.id),
					like(e.date, `${prefix}%`)
				),
				with: { category: true },
				orderBy: (e, { asc }) => asc(e.date),
			});
			
			const totalPaid = memberExpenses.reduce((sum, e) => sum + e.amount, 0);
			const netShare = memberExpenses.reduce((sum, e) => {
				if (e.isSplit && e.splitAmong) {
					return sum + (e.amount / e.splitAmong);
				}
				return sum + e.amount;
			}, 0);
			
			return { member: m, expenses: memberExpenses, totalPaid, netShare };
		})
	);
	
	return { memberData, selectedYear, selectedMonth };
};
