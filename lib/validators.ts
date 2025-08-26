import {z} from 'zod';
import {
  productsTable,
  cartsTable,
  ordersTable,
  orderItemsTable,
  favoritesTable,
} from '@/drizzle/db/schema';

export const cartItemSchema = z.object({
  id: z.string().uuid(),
  product_id: z.string().uuid(),
  quantity: z.number().int().min(1),
  price: z.string().min(1, 'Pris måste vara minst 1 kr'),
  color: z.string(),
  brand: z.string(),
  name: z.string(),
  slug: z.string(),
  images: z.array(z.string()).default([]),
  size: z.string(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const deliverySchema = z.object({
  deliveryMethod: z.string(),
  firstName: z.string().min(2, 'Förnamn måste vara minst 2 tecken'),
  lastName: z.string().min(2, 'Efternamn måste vara minst 2 tecken'),
  email: z.string().email('Ogiltig e-postadress'),
  phone: z.string().min(8, 'Telefonnummer måste vara minst 8 tecken'),
  address: z.string().min(5, 'Adress måste vara minst 5 tecken'),
  postalCode: z.string().min(5, 'Postnummer måste vara 5 siffror'),
  city: z.string().min(2, 'Stad måste vara minst 2 tecken'),
});

export type DeliveryFormData = z.infer<typeof deliverySchema>;

export const paymentSchema = z.object({
  paymentMethod: z.string(),
  cardNumber: z
    .string()
    .min(16, 'Kortnummer måste vara minst 16 siffror')
    .optional(),
  expiryDate: z
    .string()
    .min(5, 'Utgångsdatum måste vara i format MM/YY')
    .optional(),
  cvv: z.string().min(3, 'CVV måste vara 3 siffror').optional(),
  swishNumber: z
    .string()
    .min(10, 'Swishnummer måste vara minst 10 siffror')
    .optional(),
  klarnaNumber: z
    .string()
    .min(10, 'Klarnanummer måste vara minst 10 siffror')
    .optional(),
  campaignCode: z.string().optional(),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export type Product = typeof productsTable.$inferSelect & {
  isNew: boolean;
};

export type NewProduct = typeof productsTable.$inferInsert;

export type Cart = typeof cartsTable.$inferSelect;
export type NewCart = typeof cartsTable.$inferInsert;

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;

export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;

// Order with items relation for displaying orders with their items
export type OrderWithItems = Order & {
  order_items: OrderItem[];
};

// Favorite types using normalized approach with joins
export type Favorite = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  product_id: string;
  created_at: Date | null;
  product: typeof productsTable.$inferSelect;
};

export type NewFavorite = typeof favoritesTable.$inferInsert;
