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
  publishedAt: z.date().optional(),
});

export type ProductFormData = z.infer<typeof productFormSchema>;

export const CREATABLE_CATEGORY_TYPES = [
  'MAIN-CATEGORY',
  'SUB-CATEGORY',
  'CONTAINER',
  // 'COLLECTION',
] as const;

export const CATEGORY_TYPE_LABELS: Record<
  (typeof CREATABLE_CATEGORY_TYPES)[number],
  string
> = {
  'MAIN-CATEGORY': 'Huvudkategori',
  'SUB-CATEGORY': 'Underkategori',
  CONTAINER: 'Container (endast struktur)',
  // COLLECTION: 'Collection',
};

export const CATEGORY_TYPE_OPTIONS = CREATABLE_CATEGORY_TYPES.map((type) => ({
  value: type,
  label: CATEGORY_TYPE_LABELS[type],
}));

export const categoryFormSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Kategorinamn får inte vara tomt.')
      .max(20, 'Kategorinamn får inte vara längre än 20 tecken.'),
    slug: z
      .string()
      .min(1, 'Slug får inte vara tom.')
      .max(20, 'Slug får inte vara längre än 20 tecken.')
      .regex(
        /^[a-z0-9-]+$/,
        'Slug får endast innehålla små bokstäver, siffror och bindestreck.'
      ),
    type: z.preprocess(
      (val) => (val === '' ? undefined : val),
      z.enum(CREATABLE_CATEGORY_TYPES, {
        required_error: 'Du måste välja en kategori-typ.',
      })
    ),
    displayOrder: z.coerce
      .number()
      .int('Sorteringsordning måste vara ett heltal.')
      .min(0, 'Sorteringsordning får inte vara negativ.'),
    isActive: z.boolean(),
    parentId: z.coerce
      .number()
      .int()
      .positive('Du måste välja en föräldrakategori.')
      .nullable(),
  })
  .refine(
    (data) => {
      // Om typen är SUB-CATEGORY eller CONTAINER, MÅSTE parentId vara ett nummer
      if (
        (data.type === 'SUB-CATEGORY' || data.type === 'CONTAINER') &&
        data.parentId === null
      ) {
        return false; // Valideringen misslyckas
      }
      return true; // Valideringen lyckas
    },
    {
      // Detta felmeddelande kopplas till `parentId`-fältet
      message: 'En föräldrakategori måste väljas för denna typ.',
      path: ['parentId'],
    }
  );

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
