import {z} from 'zod';
import {createInsertSchema} from 'drizzle-zod';
import {categories, categoryTypeEnum} from '@/drizzle/db/schema';
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
      (value) =>
        value === 'null' || value === '' || value === undefined ? null : value,
      z.coerce.number().int().positive().nullable()
    ),
  })
  .omit({
    desktopImage: true,
    mobileImage: true,
    id: true,
    created_at: true,
    updated_at: true,
  })

  .extend({
    desktopImageFile: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, {
        message: 'Ogiltig filtyp för desktop-bild.',
      })
      .transform((file) =>
        file instanceof File && file.size > 0 ? file : null
      ),

    mobileImageFile: z
      .any()
      .optional()
      .refine((file) => !file || file instanceof File, {
        message: 'Ogiltig filtyp för mobil-bild.',
      })
      .transform((file) =>
        file instanceof File && file.size > 0 ? file : null
      ),
  })

  .refine(
    (data) => {
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
    }
  );

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
