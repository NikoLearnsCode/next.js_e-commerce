import {z} from 'zod';
import {createInsertSchema} from 'drizzle-zod';
import {productsTable} from '@/drizzle/db/schema';

export const productFormSchema = createInsertSchema(productsTable, {
  price: z.coerce
    .number({required_error: 'Pris måste anges.'})
    .positive('Priset måste vara ett positivt tal.'),

  sizes: z.string().min(1, {message: 'Minst en storlek måste anges.'}),

  specs: z.string().optional(),

  published_at: z.preprocess(
    (val) => (val === '' ? undefined : val),
    z.coerce.date().optional()
  ),
})
  .omit({
    images: true,
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    name: z.string().min(3, 'Produktnamnet måste vara minst 3 tecken.'),
    slug: z
      .string()
      .min(1, 'Slug får inte vara tom.')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug får endast innehålla små bokstäver, siffror och bindestreck.'
      ),
    description: z.string().min(1, 'Beskrivning får inte vara tom.'),
    brand: z.string().min(1, 'Märke får inte vara tomt.'),
    gender: z
      .string({required_error: 'Du måste välja en huvudkategori.'})
      .min(1, 'Du måste välja en huvudkategori.'),
    category: z
      .string({required_error: 'Du måste välja en underkategori.'})
      .min(1, 'Du måste välja en underkategori.'),
    color: z.string().min(1, 'Färg får inte vara tom.'),
  });

export type ProductFormData = z.infer<typeof productFormSchema>;

// Utökar form-schemat och lägger till transformationen.
export const productApiSchema = productFormSchema.extend({
  sizes: z.preprocess(
    (val) => {
      if (typeof val === 'string' && val.trim().length > 0) {
        return val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean);
      }
      return [];
    },
    z.array(z.string()).min(1, {message: 'Minst en storlek måste anges.'})
  ),
  specs: z.preprocess((val) => {
    if (typeof val === 'string' && val.trim().length > 0) {
      return val
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  }, z.array(z.string()).optional()),
});
