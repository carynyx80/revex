import {sqliteTable,text} from 'drizzle-orm/sqlite-core';
export const investigations=sqliteTable('investigations',{id:text('id').primaryKey(),address:text('address').notNull(),network:text('network').notNull(),evidence:text('evidence').notNull(),createdAt:text('created_at').notNull()});
