import {z} from 'zod';
import {createInsertSchema} from 'drizzle-zod';
import {categories, productsTable, categoryTypeEnum} from '@/drizzle/db/schema';

const allDbCategoryTypes = categoryTypeEnum.enumValues;

export const CREATABLE_CATEGORY_TYPES = allDbCategoryTypes.filter(
  (t) => t !== 'COLLECTION'
) as Exclude<(typeof allDbCategoryTypes)[number], 'COLLECTION'>[];

export const CATEGORY_TYPE_LABELS: Record<
  (typeof CREATABLE_CATEGORY_TYPES)[number],
  string
> = {
  'MAIN-CATEGORY': 'Huvudkategori',
  'SUB-CATEGORY': 'Underkategori',
  CONTAINER: 'Behållare (endast struktur)',
};

export const CATEGORY_TYPE_OPTIONS = CREATABLE_CATEGORY_TYPES.map((type) => ({
  value: type,
  label: CATEGORY_TYPE_LABELS[type],
}));

export const insertCategorySchema = createInsertSchema(categories);

// I din fil med validators

export const categoryFormSchema = insertCategorySchema
  .extend({
    name: z.string().min(1, 'Namn får inte vara tomt.'),
    slug: z.string().min(1, 'Slug får inte vara tom.'),
    type: z.enum(CREATABLE_CATEGORY_TYPES as [string, ...string[]], {
      errorMap: () => ({message: 'Du måste välja en kategori-typ.'}),
    }),
    displayOrder: z.coerce.number().int().min(0),
    isActive: z.coerce.boolean(),
    parentId: z.preprocess(
      value =>
        value === 'null' || value === '' || value === undefined ? null : value,
      z.coerce.number().int().positive().nullable(),
    ),
  })
  .omit({
    desktopImage: true,
    mobileImage: true,
    id: true,
    created_at: true,
    updated_at: true,
  })
  // =================================================================
  // LÄGG TILL DETTA BLOCK FÖR ATT HANTERA FILERNA
  // =================================================================
  .extend({
    desktopImageFile: z
      .any()
      .optional()
      .refine(file => !file || file instanceof File, {
        message: 'Ogiltig filtyp för desktop-bild.',
      })
      .transform(file =>
        file instanceof File && file.size > 0 ? file : null,
      ),

    mobileImageFile: z
      .any()
      .optional()
      .refine(file => !file || file instanceof File, {
        message: 'Ogiltig filtyp för mobil-bild.',
      })
      .transform(file =>
        file instanceof File && file.size > 0 ? file : null,
      ),
  })
  // =================================================================
  .refine(
    data => {
      if (
        (data.type === 'SUB-CATEGORY' || data.type === 'CONTAINER') &&
        data.parentId === null
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'En föräldrakategori måste väljas för denna typ.',
      path: ['parentId'],
    },
  );

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// valideringsschema för produkter
// valideringsschema för produkter
export const productSchema = createInsertSchema(productsTable, {
  // definierar/överstyr fält från databas-schemat
  price: z.coerce
    .number({required_error: 'Pris måste anges.'})
    .positive('Priset måste vara ett positivt tal.'),
  images: z.array(z.string()),
  sizes: z.array(z.string()).min(1, {message: 'Minst en storlek måste anges.'}),
  specs: z.array(z.string()).optional(),

  published_at: z.date().optional(),
})
  .omit({
    images: true,
    id: true,
    created_at: true,
    updated_at: true,
  })
  .extend({
    // lägger till/överstyr fält som INTE är i databasen,
    // eller förfinar validering för befintliga fält.
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

export type ProductFormData = z.infer<typeof productSchema>;
