import {z} from 'zod';
import {categoryTypeEnum} from '@/drizzle/db/schema';


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


// ------------------ INITIALT KATEGORI-KAOS ------------------
// ------------------ SKRIV OM SNARAST ---------------------

// DRY: Extrahera giltiga kategorityper från database schema
// COLLECTION exkluderas eftersom den ska genereras automatiskt
export const CREATABLE_CATEGORY_TYPES = [
  'MAIN-CATEGORY',
  'SUB-CATEGORY',
  'CONTAINER',
] as const;

// DRY: Endast dessa typer kan vara föräldrar till andra kategorier
export const VALID_PARENT_TYPES = ['MAIN-CATEGORY', 'CONTAINER'] as const;

// Extrahera typer från Drizzle schema för typ-säkerhet
export type CategoryType = (typeof categoryTypeEnum.enumValues)[number];
export type CreatableCategoryType = (typeof CREATABLE_CATEGORY_TYPES)[number];
export type ValidParentType = (typeof VALID_PARENT_TYPES)[number];

// Typ-guard för att kontrollera om en CategoryType är skapbar
export const isCreatableCategoryType = (
  type: CategoryType
): type is CreatableCategoryType => {
  return (CREATABLE_CATEGORY_TYPES as readonly string[]).includes(type);
};



export const categoryFormSchema = z
  .object({
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
    type: z.enum(CREATABLE_CATEGORY_TYPES, {
      required_error: 'Du måste välja en kategori-typ.',
    }),
    displayOrder: z.coerce
      .number()
      .int('Sorteringsordning måste vara ett heltal.')
      .min(0, 'Sorteringsordning får inte vara negativ.'),
    isActive: z.boolean(),
    parentId: z.number().int().positive().nullable(),
  })
  .refine(
    (data) => {
      // MAIN-CATEGORY kan vara null (toppnivå)
      if (data.type === 'MAIN-CATEGORY') {
        return true; // parentId kan vara vad som helst för MAIN-CATEGORY
      }

      // SUB-CATEGORY och CONTAINER MÅSTE ha en förälder
      if (data.type === 'SUB-CATEGORY' || data.type === 'CONTAINER') {
        return data.parentId !== null && data.parentId > 0;
      }

      return true;
    },
    {
      message: 'Underkategorier och containers måste ha en föräldrakategori.',
      path: ['parentId'],
    }
  );

export type CategoryFormData = z.infer<typeof categoryFormSchema>;

// DRY: Helper för kategori-hierarki validering med korrekta TypeScript-typer
export const validateCategoryHierarchy = {
  // Kontrollera om en kategori-typ kan ha förälder
  canHaveParent: (type: CategoryType): boolean => {
    // MAIN-CATEGORY ska normalt vara på toppnivå, men kan ha förälder i vissa fall
    // SUB-CATEGORY kan ha MAIN-CATEGORY eller CONTAINER som förälder
    // CONTAINER kan ha MAIN-CATEGORY som förälder
    // COLLECTION genereras automatiskt och hanteras separat
    return ['MAIN-CATEGORY', 'SUB-CATEGORY', 'CONTAINER'].includes(type);
  },

  // Kontrollera om en kategori-typ kan vara förälder
  canBeParent: (type: CategoryType): boolean => {
    return (VALID_PARENT_TYPES as readonly string[]).includes(type);
  },

  // Validera förälder-barn relation
  isValidParentChildRelation: (
    parentType: CategoryType | null,
    childType: CategoryType
  ): boolean => {
    if (!parentType) return true; // Ingen förälder är alltid OK

    return (VALID_PARENT_TYPES as readonly string[]).includes(parentType);
  },
};
