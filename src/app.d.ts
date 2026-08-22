declare global {
	namespace App {
		interface Locals {
			member: import('$lib/db/schema').members.$inferSelect | null;
		}
	}
}

export {};
