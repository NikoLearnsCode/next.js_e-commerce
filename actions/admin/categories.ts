import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {asc} from 'drizzle-orm';
import {buildCategoryTree} from '@/actions/admin/utils/category-builder';

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  const categoryTree = buildCategoryTree(flatCategories);

  return categoryTree;
}

// Definiera en typ för returvärdet för bättre typsäkerhet
type ActionResult = {
  success: boolean;
  data?: any;
  error?: string;
};

// TODO: Implementera createCategory server action
export async function createCategory(data: any): Promise<ActionResult> {
  // TODO: Validera inkommande data med category schema
  // TODO: Skapa ny kategori i databas
  // TODO: Revalidate relevanta paths

  console.log('createCategory called with:', data);

  return {
    success: false,
    error: 'createCategory inte implementerad ännu',
  };
}

// TODO: Implementera updateCategory server action
export async function updateCategory(
  id: number,
  data: any
): Promise<ActionResult> {
  // TODO: Validera inkommande data
  // TODO: Uppdatera kategori i databas
  // TODO: Hantera parent/child relationer
  // TODO: Revalidate relevanta paths

  console.log('updateCategory called with:', id, data);

  return {
    success: false,
    error: 'updateCategory inte implementerad ännu',
  };
}

// TODO: Implementera deleteCategory server action
export async function deleteCategory(id: number): Promise<ActionResult> {
  // TODO: Kontrollera att inga produkter är kopplade till kategorin
  // TODO: Ta bort alla child-kategorier eller flytta dem
  // TODO: Ta bort kategori från databas
  // TODO: Revalidate relevanta paths

  console.log('deleteCategory called with:', id);

  return {
    success: false,
    error: 'deleteCategory inte implementerad ännu',
  };
}
