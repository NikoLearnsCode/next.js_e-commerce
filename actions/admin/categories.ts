'use server';

import {db} from '@/drizzle/index';
import {categories, productsTable} from '@/drizzle/db/schema';
import {asc, eq, and, isNull} from 'drizzle-orm';
import {buildCategoryTree} from '@/actions/admin/utils/category-builder';
import {categoryFormSchema, CategoryFormData} from '@/lib/form-validators';
import {revalidatePath} from 'next/cache';
import {ActionResult} from '@/lib/types/query';

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  const categoryTree = buildCategoryTree(flatCategories);

  return categoryTree;
}

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResult> {
  try {
    // Validera inkommande data
    const validatedData = categoryFormSchema.parse(data);

    // Kontrollera att slug är unikt inom samma parent
    const existingCategory = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.slug, validatedData.slug),
          validatedData.parentId
            ? eq(categories.parentId, validatedData.parentId)
            : isNull(categories.parentId)
        )
      )
      .limit(1);

    if (existingCategory.length > 0) {
      return {
        success: false,
        error: 'En kategori med denna slug finns redan på samma nivå.',
      };
    }

    // Skapa ny kategori
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        type: validatedData.type,
        displayOrder: validatedData.displayOrder,
        isActive: validatedData.isActive,
        parentId: validatedData.parentId,
      })
      .returning();

    // Revalidate relevanta paths
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {
      success: true,
      data: newCategory,
    };
  } catch (error) {
    console.error('Error creating category:', error);
    return {
      success: false,
      error: 'Ett fel uppstod vid skapandet av kategorin.',
    };
  }
}

export async function updateCategory(
  id: number,
  data: CategoryFormData
): Promise<ActionResult> {
  try {
    // Validera inkommande data
    const validatedData = categoryFormSchema.parse(data);

    // Kontrollera att kategorin existerar
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existingCategory) {
      return {
        success: false,
        error: 'Kategorin kunde inte hittas.',
      };
    }

    if (existingCategory.type === 'COLLECTION') {
      return {
        success: false,
        error: 'Collection kategorier kan inte uppdateras.',
      };
    }

    // Kontrollera att slug är unikt inom samma parent (exklusive nuvarande kategori)
    const hasConflict = await db
      .select()
      .from(categories)
      .where(
        and(
          eq(categories.slug, validatedData.slug),
          validatedData.parentId
            ? eq(categories.parentId, validatedData.parentId)
            : isNull(categories.parentId)
        )
      );

    const conflict = hasConflict.find((cat) => cat.id !== id);
    if (conflict) {
      return {
        success: false,
        error: 'En kategori med denna slug finns redan på samma nivå.',
      };
    }

    // Kontrollera att vi inte skapar cirkulära referenser
    if (validatedData.parentId) {
      // Hämta alla barn-kategorier rekursivt
      const getAllChildIds = async (categoryId: number): Promise<number[]> => {
        const children = await db
          .select()
          .from(categories)
          .where(eq(categories.parentId, categoryId));

        let allChildIds: number[] = children.map((child) => child.id);

        for (const child of children) {
          const grandChildren = await getAllChildIds(child.id);
          allChildIds = [...allChildIds, ...grandChildren];
        }

        return allChildIds;
      };

      const childIds = await getAllChildIds(id);
      if (childIds.includes(validatedData.parentId)) {
        return {
          success: false,
          error:
            'Du kan inte sätta en underkategori som förälder till sin egen överordnade kategori.',
        };
      }
    }

    // Uppdatera kategorin
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: validatedData.name,
        slug: validatedData.slug,
        type: validatedData.type,
        displayOrder: validatedData.displayOrder,
        isActive: validatedData.isActive,
        parentId: validatedData.parentId,
        updated_at: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    // Revalidate relevanta paths
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {
      success: true,
      data: updatedCategory,
    };
  } catch (error) {
    console.error('Error updating category:', error);
    return {
      success: false,
      error: 'Ett fel uppstod vid uppdateringen av kategorin.',
    };
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  try {
    // Kontrollera att kategorin existerar
    const [categoryToDelete] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!categoryToDelete) {
      return {
        success: false,
        error: 'Kategorin kunde inte hittas.',
      };
    }

    if (categoryToDelete.type === 'COLLECTION') {
      return {
        success: false,
        error: 'Collection kategorier kan inte raderas.',
      };
    }

    // Kontrollera att inga produkter är kopplade till kategorin (baserat på slug)
    const linkedProducts = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.category, categoryToDelete.slug))
      .limit(2);

    if (linkedProducts.length > 0) {
      return {
        success: false,
        error: `Kategorin kan inte raderas eftersom ${linkedProducts.length > 1 ? 'flera produkter är' : 'en produkt är'} kopplade till den. Ta bort produkterna först.`,
      };
    }

    // Kontrollera om kategorin har barn-kategorier
    const childCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.parentId, id));

    if (childCategories.length > 0) {
      return {
        success: false,
        error: `Kategorin kan inte raderas eftersom den har ${childCategories.length} underkategorier. Ta bort eller flytta underkategorierna först.`,
      };
    }

    // Ta bort kategorin
    await db.delete(categories).where(eq(categories.id, id));

    // Revalidate relevanta paths
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {
      success: true,
      data: {deletedId: id},
    };
  } catch (error) {
    console.error('Error deleting category:', error);
    return {
      success: false,
      error: 'Ett fel uppstod vid borttagningen av kategorin.',
    };
  }
}
