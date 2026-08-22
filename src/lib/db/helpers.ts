import { eq } from 'drizzle-orm';


export function householdScope(householdId: string) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (table: any) => eq(table.householdId, householdId);
}
