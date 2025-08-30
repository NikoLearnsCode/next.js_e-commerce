import {cartsTable} from '@/drizzle/db/schema';
import {z} from 'zod';

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
export type Cart = typeof cartsTable.$inferSelect;
export type NewCart = typeof cartsTable.$inferInsert;

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
