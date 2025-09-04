import {z} from 'zod';

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

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Kategorinamn får inte vara tomt.')
    .max(100, 'Kategorinamn får inte vara längre än 100 tecken.'),
  slug: z
    .string()
    .min(1, 'Slug får inte vara tom.')
    .max(100, 'Slug får inte vara längre än 100 tecken.')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug får endast innehålla små bokstäver, siffror och bindestreck.'
    ),
  type: z.enum(['MAIN-CATEGORY', 'SUB-CATEGORY', 'CONTAINER', 'COLLECTION'], {
    required_error: 'Du måste välja en kategori-typ.',
  }),
  displayOrder: z.coerce
    .number()
    .int('Sorteringsordning måste vara ett heltal.')
    .min(0, 'Sorteringsordning får inte vara negativ.'),
  isActive: z.boolean(),
  parentId: z.number().int().positive().nullable().optional(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
