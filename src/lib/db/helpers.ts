import { eq } from 'drizzle-orm';

export function householdScope(householdId: string) {
	return (table: any) => eq(table.householdId, householdId);
}
