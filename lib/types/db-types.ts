import {
  productsTable,
  favoritesTable,
  cartsTable,
  cartItemsTable,
  ordersTable,
  orderItemsTable,
} from '@/drizzle/db/schema';

export type Product = typeof productsTable.$inferSelect & {
  isNew?: boolean;
};

export type Favorite = typeof favoritesTable.$inferSelect;

export type NewFavorite = typeof favoritesTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;

export type OrderItem = typeof orderItemsTable.$inferSelect;

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type OrderOverview = Pick<OrderWithItems, 'id' | 'created_at'> & {
  order_items: Pick<OrderItem, 'order_id' | 'image' | 'name'>[];
};

/* export type OrderOverview = {
  id: string;
  created_at: Date;
  order_items: {
    order_id: string;
    image: string | null;
    name: string;
  }[];
}; */

export type NewCart = typeof cartsTable.$inferInsert;

export type NewCartItem = typeof cartItemsTable.$inferInsert;

export type AddToCartItem = Omit<NewCartItem, 'cart_id'>;

export type CartItemWithProduct = typeof cartItemsTable.$inferSelect & {
  name: string;
  price: number;
  brand: string;
  color: string;
  slug: string;
  images: string[];
};

// För carousel/related products
export type CarouselCard = Pick<
  Product,
  'id' | 'name' | 'price' | 'images' | 'slug' | 'created_at'
> & {
  isNew?: boolean;
};

// För produktsidor och favorites
export type ProductCard = Pick<
  Product,
  | 'id'
  | 'name'
  | 'price'
  | 'brand'
  | 'color'
  | 'sizes'
  | 'images'
  | 'slug'
  | 'created_at'
> & {
  isNew?: boolean;
};

export type ProductDetail = Product;

export type FavoriteWithProduct = Favorite & {
  product: ProductCard;
};

export type FavoriteButtonProduct = Pick<CarouselCard, 'id'>;

export type CreateOrderResult =
  | {success: true; orderId: string}
  | {success: false; error: string};
