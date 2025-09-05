import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  primaryKey,
  AnyPgColumn,
  unique,
  serial,
  pgEnum,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

import type {DeliveryFormData} from '@/lib/validators';
import type {AdapterAccount} from '@/lib/types/auth';

// ----------------------------------------------------------------

// LAGRAR INFO OM ANVÄNDARE
export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', {mode: 'date'}),
  image: text('image'),
  role: integer('role').notNull().default(0),
});

// KOPPLAR OAUTH-KONTON (TYP. GOOGLE, GITHUB) TILL usersTable
export const accountsTable = pgTable(
  'accounts',
  {
    userId: uuid('userId')
      .notNull()
      .references(() => usersTable.id, {onDelete: 'cascade'}),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (table) => [primaryKey({columns: [table.provider, table.providerAccountId]})]
);

// LAGRAR SESSIONER FÖR usersTable
export const sessionsTable = pgTable('sessions', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: uuid('userId')
    .notNull()
    .references(() => usersTable.id, {onDelete: 'cascade'}),
  expires: timestamp('expires', {mode: 'date'}).notNull(),
});

// PRODUCTS
export const productsTable = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', {length: 255}).notNull(),
  slug: varchar('slug', {length: 255}).notNull().unique(),
  description: varchar('description', {length: 255}).notNull(),
  price: numeric('price', {precision: 10, scale: 2}).notNull(),
  brand: varchar('brand', {length: 255}).notNull(),
  gender: varchar('gender', {length: 255}).notNull(),
  category: varchar('category', {length: 255}).notNull(),
  color: varchar('color', {length: 255}).notNull(),
  specs: jsonb('specs').$type<string[]>(),
  images: jsonb('images').$type<string[]>().notNull(),
  sizes: jsonb('sizes').$type<string[]>().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// CARTS (Uppdaterad)
// Nu håller den bara övergripande information om varukorgen.
export const cartsTable = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  session_id: varchar('session_id', {length: 255}),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// CART ITEMS (Ny tabell)
// Varje rad är en produkt i en specifik varukorg.
export const cartItemsTable = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cart_id: uuid('cart_id')
    .notNull()
    .references(() => cartsTable.id, {onDelete: 'cascade'}),
  product_id: uuid('product_id')
    .notNull()
    .references(() => productsTable.id, {onDelete: 'cascade'}),
  quantity: integer('quantity').notNull(),
  size: varchar('size', {length: 255}).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ORDERS
export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  session_id: varchar('session_id', {length: 255}),
  total_amount: numeric('total_amount', {precision: 10, scale: 2}).notNull(),
  payment_info: varchar('payment_info', {length: 255}).notNull(),
  status: varchar('status', {length: 255}).notNull(),
  delivery_info: jsonb('delivery_info').$type<DeliveryFormData>().notNull(),
  created_at: timestamp('created_at').defaultNow(),
  updated_at: timestamp('updated_at').defaultNow(),
});

// ORDER ITEMS
export const orderItemsTable = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  order_id: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, {onDelete: 'cascade'}),
  product_id: uuid('product_id').references(() => productsTable.id, {
    onDelete: 'set null',
  }),
  quantity: integer('quantity').notNull(),
  price: numeric('price', {precision: 10, scale: 2}).notNull(),
  name: varchar('name', {length: 255}).notNull(),
  size: varchar('size', {length: 255}).notNull(),
  color: varchar('color', {length: 255}).notNull(),
  slug: varchar('slug', {length: 255}).notNull(),
  created_at: timestamp('created_at').defaultNow(),
  image: varchar('image', {length: 255}).notNull(),
});

// FAVORITES
export const favoritesTable = pgTable('favorites', {
  id: uuid('id').primaryKey().defaultRandom(),
  user_id: uuid('user_id').references(() => usersTable.id, {
    onDelete: 'cascade',
  }),
  session_id: varchar('session_id', {length: 255}),
  product_id: uuid('product_id')
    .references(() => productsTable.id, {
      onDelete: 'cascade',
    })
    .notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

// CATEGORIES
export const categoryTypeEnum = pgEnum('category_type', [
  'MAIN-CATEGORY', // En huvudkategori på toppnivå (t.ex. "Dam", "Herr")
  'SUB-CATEGORY', // En underkategori som produkter kan tillhöra (t.ex. "Byxor")
  'CONTAINER', // En strukturell mapp, syns INTE i URL:en (t.ex. "Plagg")
  'COLLECTION', // En specialsida som samlar innehåll (t.ex. "Nyheter")
]);

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  type: categoryTypeEnum('type').notNull().default('SUB-CATEGORY'),
  displayOrder: integer('display_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  created_at: timestamp('created_at').notNull().defaultNow(),
  updated_at: timestamp('updated_at').notNull().defaultNow(),

  parentId: integer('parent_id').references((): AnyPgColumn => categories.id, {
    onDelete: 'cascade',
  }),
});

export const categoriesSlugParentUniqueIndex = unique(
  'slug_parent_unique_idx'
).on(categories.slug, categories.parentId);

export const categoriesNameParentUniqueIndex = unique(
  'name_unique_idx'
).on(categories.name, categories.parentId);

// Relations för nya cart-strukturen
export const cartsRelations = relations(cartsTable, ({one, many}) => ({
  user: one(usersTable, {
    fields: [cartsTable.user_id],
    references: [usersTable.id],
  }),
  cartItems: many(cartItemsTable),
}));

export const cartItemsRelations = relations(cartItemsTable, ({one}) => ({
  cart: one(cartsTable, {
    fields: [cartItemsTable.cart_id],
    references: [cartsTable.id],
  }),
  product: one(productsTable, {
    fields: [cartItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

export const productsRelations = relations(productsTable, ({many}) => ({
  orderItems: many(orderItemsTable),
  cartItems: many(cartItemsTable),
  favorites: many(favoritesTable),
}));

export const ordersRelations = relations(ordersTable, ({one, many}) => ({
  user: one(usersTable, {
    fields: [ordersTable.user_id],
    references: [usersTable.id],
  }),
  orderItems: many(orderItemsTable),
}));

export const orderItemsRelations = relations(orderItemsTable, ({one}) => ({
  order: one(ordersTable, {
    fields: [orderItemsTable.order_id],
    references: [ordersTable.id],
  }),
  product: one(productsTable, {
    fields: [orderItemsTable.product_id],
    references: [productsTable.id],
  }),
}));

// export const favoritesRelations = relations(favoritesTable, ({one}) => ({
//   user: one(usersTable, {
//     fields: [favoritesTable.user_id],
//     references: [usersTable.id],
//   }),
//   product: one(productsTable, {
//     fields: [favoritesTable.product_id],
//     references: [productsTable.id],
//   }),
// }));




