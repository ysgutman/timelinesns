import { pgTable, serial, text, integer, timestamp } from 'drizzle-orm/pg-core';

// Users table (for optional Firebase Auth sign in and classroom profile linking)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Posts table for writing timeline SNS
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  authorName: text('author_name').notNull(),
  content: text('content').notNull(),
  password: text('password').notNull(), // 4-digit PIN for edit & delete
  likesCount: integer('likes_count').notNull().default(0),
  category: text('category').default('자유글'), // e.g., 일기, 독후감, 시, 수필, 생각나눔
  userUid: text('user_uid'), // Optional link to Firebase UID if logged in
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Likes table to track liked posts
export const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id')
    .references(() => posts.id, { onDelete: 'cascade' })
    .notNull(),
  clientId: text('client_id').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
