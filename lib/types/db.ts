import {
  productsTable,
  favoritesTable,
  cartsTable,
  cartItemsTable,
} from '@/drizzle/db/schema';

export type Product = Partial<typeof productsTable.$inferSelect> & {
  id: string;
  name: string;
  price: string;
  images: string[];
  brand: string;
  sizes: string[];
  color: string;
  slug: string;
  created_at: Date | null;
  isNew?: boolean;
};

export type Favorite = typeof favoritesTable.$inferSelect;

export type NewFavorite = typeof favoritesTable.$inferInsert;

export type FavoriteWithProduct = Favorite & {
  product: Product;
};

export type NewCart = typeof cartsTable.$inferInsert;

export type NewCartItem = typeof cartItemsTable.$inferInsert;

export type AddToCartItem = Omit<NewCartItem, 'cart_id'>;

export type CartItemWithProduct = typeof cartItemsTable.$inferSelect & {
  name: string;
  price: string;
  brand: string;
  color: string;
  slug: string;
  images: string[];
};
