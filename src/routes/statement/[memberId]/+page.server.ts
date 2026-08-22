import { db } from '$lib/db';
import { currentMonthIST } from '$lib/utils/time';
import { error } from '@sveltejs/kit';

export const load = async ({ params, url, locals }) => {
	const targetMember = await db.query.members.findFirst({
		where: (m, { eq, and }) => and(
			eq(m.id, params.memberId),
			eq(m.householdId, locals.member!.householdId)
		),
	});

	if (!targetMember) throw error(404, 'Member not found');

	const { year, month } = currentMonthIST();
	const selectedYear = parseInt(url.searchParams.get('year') ?? String(year));
	const selectedMonth = parseInt(url.searchParams.get('month') ?? String(month));
	
	const prefix = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

	const rawExpenses = await db.query.expenses.findMany({
		where: (e, { eq, like, and }) => and(
			eq(e.memberId, targetMember.id),
			like(e.date, `${prefix}%`)
		),
		with: { category: true },
		orderBy: (e, { asc }) => asc(e.date),
	});

	const ownExpenses = rawExpenses.map(e => ({
		...e,
		isEditable: false
	}));

	const splitsReceived = await db.query.expenseSplits.findMany({
		where: (es, { eq }) => eq(es.memberId, targetMember.id),
		with: { 
			expense: { 
				with: { category: true, member: true } 
			} 
		},
	});

	const filteredSplits = splitsReceived.filter(s => 
		s.expense.date.startsWith(prefix)
	);

	const totalPaid = ownExpenses.reduce((sum, e) => sum + e.amount, 0);
	const netShare = ownExpenses.reduce((sum, e) => {
		return sum + (e.isSplit && e.splitAmong ? e.amount / e.splitAmong : e.amount);
	}, 0);

	return { 
		targetMember, 
		ownExpenses, 
		filteredSplits, 
		totalPaid, 
		netShare, 
		year: selectedYear, 
		month: selectedMonth,
		readOnly: true
	};
};
