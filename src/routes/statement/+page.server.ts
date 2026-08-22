import { db } from '$lib/db';
import { currentMonthIST } from '$lib/utils/time';

export const load = async ({ locals, url }) => {
	const member = locals.member!;
	const { year, month } = currentMonthIST();
	
	const selectedYear = parseInt(url.searchParams.get('year') ?? String(year));
	const selectedMonth = parseInt(url.searchParams.get('month') ?? String(month));
	
	const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

	// Own expenses
	const ownExpenses = await db.query.expenses.findMany({
		where: (e, { eq, like, and }) => and(
			eq(e.memberId, member.id),
			like(e.date, `${prefix}%`)
		),
		with: { category: true },
		orderBy: (e, { asc }) => asc(e.date),
	});

	// Splits received
	const splitsReceived = await db.query.expenseSplits.findMany({
		where: (es, { eq }) => eq(es.memberId, member.id),
		with: { 
			expense: { 
				with: { category: true, member: true } 
			} 
		},
	});

	// Filter splits to selected period
	const filteredSplits = splitsReceived.filter(s => 
		s.expense.date.startsWith(prefix)
	);

	const totalPaid = ownExpenses.reduce((sum, e) => sum + e.amount, 0);
	const netShare = ownExpenses.reduce((sum, e) => {
		return sum + (e.isSplit && e.splitAmong ? e.amount / e.splitAmong : e.amount);
	}, 0);

	return { 
		targetMember: member, 
		ownExpenses, 
		filteredSplits, 
		totalPaid, 
		netShare, 
		year: selectedYear, 
		month: selectedMonth,
		readOnly: false
	};
};
