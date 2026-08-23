import { db } from '$lib/db';
import { categories } from '$lib/db/schema';
import { eq, isNull, and } from 'drizzle-orm';
import { nowIST } from '$lib/utils/time';
import { randomUUID } from 'crypto';
import { error } from '@sveltejs/kit';
import { categoryScope } from '$lib/db/scope';

export const load = async ({ locals }) => {
	const activeCategories = await db.select()
		.from(categories)
		.where(categoryScope(locals.member!.householdId));

	return { categories: activeCategories };
};

export const actions = {
	add: async ({ request, locals }) => {
		const name = (await request.formData()).get('name') as string;
		if (!name?.trim()) return { error: 'Category name cannot be empty.' };

		await db.insert(categories).values({
			id: randomUUID(),
			householdId: locals.member!.householdId,
			name: name.trim(),
			createdBy: locals.member!.id,
			createdAt: nowIST(),
		});
		return { success: true };
	},
	rename: async ({ request, locals }) => {
		const data = await request.formData();
		const id = data.get('id') as string;
		const name = data.get('name') as string;

		if (!name?.trim()) return { error: 'Category name cannot be empty.' };

		const target = await db.query.categories.findFirst({
			where: (c, { eq, and }) => and(eq(c.id, id), eq(c.householdId, locals.member!.householdId))
		});
		if (!target) throw error(404, 'Category not found');

		await db.update(categories)
			.set({ name: name.trim() })
			.where(eq(categories.id, id));
		return { success: true };
	},
	delete: async ({ request, locals }) => {
		const id = (await request.formData()).get('id') as string;
		
		const target = await db.query.categories.findFirst({
			where: (c, { eq, and }) => and(eq(c.id, id), eq(c.householdId, locals.member!.householdId))
		});
		if (!target) throw error(404, 'Category not found');

		await db.update(categories)
			.set({ deletedAt: nowIST() })
			.where(eq(categories.id, id));
		return { success: true };
	}
};
