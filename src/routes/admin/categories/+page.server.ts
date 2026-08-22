import { db } from '$lib/db';
import { categories } from '$lib/db/schema';
import { eq, isNull } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { error } from '@sveltejs/kit';

export const load = async () => {
	const activeCategories = await db.select()
		.from(categories)
		.where(isNull(categories.deletedAt));

	return { categories: activeCategories };
};

export const actions = {
	add: async ({ request, locals }) => {
		const name = (await request.formData()).get('name') as string;
		if (!name?.trim()) return { error: 'Category name cannot be empty.' };

		await db.insert(categories).values({
			id: randomUUID(),
			name: name.trim(),
			createdBy: locals.member!.id,
			createdAt: nowIST(),
		});
		return { success: true };
	},
	rename: async ({ request }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;

		if (!name?.trim()) return { error: 'Category name cannot be empty.' };

		await db.update(categories)
			.set({ name: name.trim() })
			.where(eq(categories.id, id));
		return { success: true };
	},
	delete: async ({ request }) => {
		const id = (await request.formData()).get('id') as string;
		
		await db.update(categories)
			.set({ deletedAt: nowIST() })
			.where(eq(categories.id, id));
		return { success: true };
	}
};
