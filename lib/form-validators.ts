import {z} from 'zod';

// This schema defines the shape of the form's input data.
export const productFormSchema = z.object({
  name: z.string().min(3, 'Produktnamnet måste vara minst 3 tecken.'),
  slug: z.string().min(1, 'Slug får inte vara tom.'),
  description: z.string().min(1, 'Beskrivning får inte vara tom.'),
  price: z.coerce
    .number({required_error: 'Pris måste anges.'})
    .positive('Priset måste vara ett positivt tal.'),
  brand: z.string().min(1, 'Märke får inte vara tomt.'),
  gender: z
    .string({required_error: 'Du måste välja en huvudkategori.'})
    .min(1, 'Du måste välja en huvudkategori.'),
  category: z
    .string({required_error: 'Du måste välja en underkategori.'})
    .min(1, 'Du måste välja en underkategori.'),
  color: z.string().min(1, 'Färg får inte vara tom.'),
  sizes: z
    .string({required_error: 'Minst en storlek måste anges.'})
    .min(1, 'Minst en storlek måste anges.'),
  specs: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;
