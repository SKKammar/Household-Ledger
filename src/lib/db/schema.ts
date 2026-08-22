import { sql } from 'drizzle-orm';
import { text, integer, real, sqliteTable } from 'drizzle-orm/sqlite-core';

export const members = sqliteTable('members', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	avatarColor: text('avatar_color').notNull(),
	isAdmin: integer('is_admin').notNull().default(0),
	deletedAt: text('deleted_at'),
	createdAt: text('created_at').notNull(),
});

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
	name: text('name').notNull(),
	isDefault: integer('is_default').notNull().default(0),
	createdBy: text('created_by').references(() => members.id),
	deletedAt: text('deleted_at'),
	createdAt: text('created_at').notNull(),
});

export const expenses = sqliteTable('expenses', {
	id: text('id').primaryKey(),
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
