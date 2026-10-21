import { sqliteTable, text, integer, primaryKey, index } from 'drizzle-orm/sqlite-core';
export const records = sqliteTable('records', { kind: text('kind').notNull(), id: text('id').notNull(), payload: text('payload').notNull(), updatedAt: text('updated_at').notNull() }, t => [primaryKey({ columns: [t.kind, t.id] }), index('records_kind_updated').on(t.kind,t.updatedAt)]);
export const revision = sqliteTable('revision', { id: integer('id').primaryKey(), version: integer('version').notNull().default(0), token: text('token').notNull().default('') });
export const webOrders = sqliteTable('web_orders', {
 id: integer('id').primaryKey({autoIncrement:true}), requestKey:text('request_key').notNull().unique(), requestHash:text('request_hash').notNull(),
 payload:text('payload').notNull(), status:text('status').notNull().default('pending'), version:integer('version').notNull().default(0),
 createdAt:text('created_at').notNull(), updatedAt:text('updated_at').notNull()
},t=>[index('web_orders_status_created').on(t.status,t.createdAt)]);
