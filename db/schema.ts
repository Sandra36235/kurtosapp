import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { kind: text('kind').notNull(), id: text('id').notNull(), payload: text('payload').notNull(), updatedAt: text('updated_at').notNull() }, t => [primaryKey({ columns: [t.kind, t.id] }), index('records_kind_updated').on(t.kind,t.updatedAt)]);
export const revision = sqliteTable('revision', { id: integer('id').primaryKey(), version: integer('version').notNull().default(0), token: text('token').notNull().default('') });
