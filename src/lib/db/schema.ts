import { relations } from 'drizzle-orm';
import { text, integer, real, sqliteTable, unique } from 'drizzle-orm/sqlite-core';

export const households = sqliteTable('households', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	inviteCode: text('invite_code').notNull().unique(),
	createdAt: text('created_at').notNull(),
});

export const members = sqliteTable('members', {
	id: text('id').primaryKey(),
	householdId: text('household_id').notNull().references(() => households.id),
	name: text('name').notNull(),
	email: text('email').notNull(),
	avatarColor: text('avatar_color').notNull(),
	isAdmin: integer('is_admin').notNull().default(0),
	deletedAt: text('deleted_at'),
	createdAt: text('created_at').notNull(),
}, (t) => ({
	unq: unique().on(t.email, t.householdId)
}));

export const magicLinks = sqliteTable('magic_links', {
	id: text('id').primaryKey(),
	memberId: text('member_id').notNull().references(() => members.id),
	token: text('token').notNull().unique(),
	expiresAt: text('expires_at').notNull(),
	used: integer('used').notNull().default(0),
	createdAt: text('created_at').notNull(),
});

export const sessions = sqliteTable('sessions', {
	id: text('id').primaryKey(),
	memberId: text('member_id').notNull().references(() => members.id),
	sessionToken: text('session_token').notNull().unique(),
	expiresAt: text('expires_at').notNull(),
	createdAt: text('created_at').notNull(),
});

export const categories = sqliteTable('categories', {
	id: text('id').primaryKey(),
	householdId: text('household_id').notNull().references(() => households.id),
	name: text('name').notNull(),
	isDefault: integer('is_default').notNull().default(0),
	createdBy: text('created_by').references(() => members.id),
	deletedAt: text('deleted_at'),
	createdAt: text('created_at').notNull(),
});

export const expenses = sqliteTable('expenses', {
	id: text('id').primaryKey(),
	householdId: text('household_id').notNull().references(() => households.id),
	memberId: text('member_id').notNull().references(() => members.id),
	categoryId: text('category_id').notNull().references(() => categories.id),
	amount: real('amount').notNull(),
	note: text('note'),
	date: text('date').notNull(),
	isSplit: integer('is_split').notNull().default(0),
	splitAmong: integer('split_among'),
	createdAt: text('created_at').notNull(),
});

export const expenseSplits = sqliteTable('expense_splits', {
	id: text('id').primaryKey(),
	expenseId: text('expense_id').notNull().references(() => expenses.id),
	memberId: text('member_id').notNull().references(() => members.id),
	shareAmount: real('share_amount').notNull(),
	createdAt: text('created_at').notNull(),
});

export const magicLinksRelations = relations(magicLinks, ({ one }) => ({
	member: one(members, {
		fields: [magicLinks.memberId],
		references: [members.id],
	}),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
	member: one(members, {
		fields: [sessions.memberId],
		references: [members.id],
	}),
}));

export const categoriesRelations = relations(categories, ({ one }) => ({
	createdBy: one(members, {
		fields: [categories.createdBy],
		references: [members.id],
	}),
	household: one(households, {
		fields: [categories.householdId],
		references: [households.id],
	}),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
	household: one(households, {
		fields: [expenses.householdId],
		references: [households.id],
	}),
	member: one(members, {
		fields: [expenses.memberId],
		references: [members.id],
	}),
	category: one(categories, {
		fields: [expenses.categoryId],
		references: [categories.id],
	}),
	splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
	expense: one(expenses, {
		fields: [expenseSplits.expenseId],
		references: [expenses.id],
	}),
	member: one(members, {
		fields: [expenseSplits.memberId],
		references: [members.id],
	}),
}));

export const householdsRelations = relations(households, ({ many }) => ({
	members: many(members),
	categories: many(categories),
	expenses: many(expenses),
}));

export const membersRelations = relations(members, ({ one }) => ({
	household: one(households, {
		fields: [members.householdId],
		references: [households.id],
	}),
}));
