import {z} from 'zod';

export const productSchema = z.object({
  id: z.string().uuid('Ogiltigt produkt-ID format'),
  created_at: z.string().datetime(),
  name: z.string().min(1, 'Produktnamn är obligatoriskt'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Pris måste vara större än 0'),
  brand: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  slug: z.string(),
  category: z.string().optional().nullable(),
  specs: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  sizes: z.array(z.string()).default([]),
});

export type Product = z.infer<typeof productSchema>;

export const cartItemSchema = z.object({
  id: z.string().uuid('Ogiltigt kart-ID format'),
  product_id: z.string().uuid('Ogiltigt produkt-ID format'),
  quantity: z.number().int().min(1, 'Antal måste vara minst 1'),
  price: z.number().positive('Pris måste vara större än 0'),
  gender: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  name: z.string().min(1, 'Produktnamn är obligatoriskt'),
  description: z.string().optional().nullable(),
  slug: z.string(),
  category: z.string().optional().nullable(),
  specs: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).default([]),
  size: z.string().optional().nullable(),
});

export type CartItem = z.infer<typeof cartItemSchema>;

export const cartSchema = z.object({
  user_id: z.string().uuid('Ogiltigt användar-ID format').nullable(),
  session_id: z.string().uuid('Ogiltigt session-ID format').nullable(),
  items: z.array(cartItemSchema).default([]),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Cart = z.infer<typeof cartSchema>;

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
