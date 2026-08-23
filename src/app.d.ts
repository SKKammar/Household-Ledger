declare global {
	namespace App {
		interface Locals {
			member: import('$lib/db/schema').members.$inferSelect | null;
			household: import('$lib/db/schema').households.$inferSelect | null;
		}
	}
}

export {};
