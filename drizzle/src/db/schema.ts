import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type {CartItem} from '@/lib/validators';

// PRODUCTS
export const productsTable = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  name: varchar('name', {length: 255}).notNull(),
  description: varchar('description', {length: 255}).notNull(),
  price: numeric('price', {precision: 10, scale: 2}).notNull(),
  brand: varchar('brand', {length: 255}).notNull(),
  gender: varchar('gender', {length: 255}).notNull(),
  category: varchar('category', {length: 255}).notNull(),
  color: varchar('color', {length: 255}).notNull(),
  slug: varchar('slug', {length: 255}).notNull().unique(),
  specs: jsonb('specs').$type<string[]>().notNull(),
  images: jsonb('images').$type<string[]>().notNull(),
  sizes: jsonb('sizes').$type<string[]>().notNull(),
});

// CARTS
export const cartsTable = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  session_id: varchar('session_id', {length: 255}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
  items: jsonb('items').$type<CartItem[]>().notNull(),
});

// ORDERS
export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id'),
  session_id: varchar('session_id', {length: 255}),
  status: varchar('status', {length: 255}).notNull(),
  total_amount: numeric('total_amount', {precision: 10, scale: 2}).notNull(),
  delivery_info: jsonb('delivery_info').notNull(),
  payment_info: varchar('payment_info', {length: 255}).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ORDER ITEMS
export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id').references(() => ordersTable.id),
  product_id: uuid('product_id').references(() => productsTable.id),
  quantity: integer('quantity').notNull(),
  price: numeric('price', {precision: 10, scale: 2}).notNull(),
  name: varchar('name', {length: 255}).notNull(),
  size: varchar('size', {length: 255}).notNull(),
  color: varchar('color', {length: 255}).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  image: varchar('image', {length: 255}).notNull(),
});

// CATEGORIES LINKS
export const categoriesTable = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', {length: 255}).notNull().unique(),
  slug: varchar('slug', {length: 255}).notNull().unique(),
  gender: varchar('gender', {length: 255}).notNull(),
  display_order: integer('display_order').default(0),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});
