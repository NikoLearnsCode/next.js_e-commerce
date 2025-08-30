import {
  productsTable,

  ordersTable,
  orderItemsTable,
  favoritesTable,
} from '@/drizzle/db/schema';

export type Product = typeof productsTable.$inferSelect & {
  isNew?: boolean;
};
export type NewProduct = typeof productsTable.$inferInsert;



export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;

export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

export type Favorite = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  created_at: Date | null;
  product: typeof productsTable.$inferSelect;
};

export type NewFavorite = typeof favoritesTable.$inferInsert;
