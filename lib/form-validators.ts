import {createInsertSchema} from 'drizzle-zod';
import {productsTable, categories} from '@/drizzle/db/schema';
import {z} from 'zod';
// PRODUCT FORM SCHEMA - Återanvänd exakt Drizzle schema
export const productFormSchema = createInsertSchema(productsTable);

// CATEGORY FORM SCHEMA - Återanvänd exakt Drizzle schema
export const categoryFormSchema = createInsertSchema(categories);

// Återanvänd befintliga types från db.ts
/* export type ProductFormData = typeof productsTable.$inferInsert;
export type CategoryFormData = typeof categories.$inferInsert; */

export type ProductFormData = z.infer<typeof productFormSchema>;
export type CategoryFormData = z.infer<typeof categoryFormSchema>;
