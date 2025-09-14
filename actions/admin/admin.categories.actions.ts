'use server';

import {db} from '@/drizzle/index';
import {categories, productsTable} from '@/drizzle/db/schema';
import {asc, eq, and, isNull, or, sql} from 'drizzle-orm';
import {buildCategoryTree} from '@/actions/lib/categoryTree-builder';
import {categoryFormSchema, CategoryFormData} from '@/lib/form-validators';
import {revalidatePath} from 'next/cache';
import {ActionResult} from '@/lib/types/query';
import path from 'path';
import fs from 'fs/promises';
import {isUploadedImage} from '@/utils/image-helpers';

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  const categoryTree = buildCategoryTree(flatCategories);

  return categoryTree;
}

export async function getMainCategoriesForHomepage() {
  const mainCategories = await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.type, 'MAIN-CATEGORY'), eq(categories.isActive, true))
    )
    .orderBy(asc(categories.displayOrder));

  return mainCategories;
}

export async function createCategory(
  data: CategoryFormData
): Promise<ActionResult> {
  try {
    // Validera inkommande data
    const validatedData = categoryFormSchema.parse(data);

    // Kontrollera att slug och name är unikt inom samma parent
    const existingCategories = await db
      .select()
      .from(categories)
      .where(
        and(
          or(
            eq(
              sql`lower(${categories.slug})`,
              validatedData.slug.toLowerCase()
            ),
            eq(sql`lower(${categories.name})`, validatedData.name.toLowerCase())
          ),
          validatedData.parentId
            ? eq(categories.parentId, validatedData.parentId)
            : isNull(categories.parentId)
        )
      );

    if (existingCategories.length > 0) {
      const slugConflict = existingCategories.some(
        (c) => c.slug.toLowerCase() === validatedData.slug.toLowerCase()
      );
      const nameConflict = existingCategories.some(
        (c) => c.name.toLowerCase() === validatedData.name.toLowerCase()
      );

      const conflictParts = [];
      if (slugConflict) conflictParts.push('slug');
      if (nameConflict) conflictParts.push('name');

      return {
        success: false,
        error: `En kategori med detta ${conflictParts.join(
          ' och '
        )} finns redan på samma nivå.`,
      };
    }

    // Skapa ny kategori
    const now = new Date();
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: validatedData.name,
        slug: validatedData.slug,
        type: validatedData.type,
        displayOrder: validatedData.displayOrder,
        isActive: validatedData.isActive,
        parentId: validatedData.parentId,
        desktopImage: validatedData.desktopImage || null,
        mobileImage: validatedData.mobileImage || null,
        created_at: now,
        updated_at: now,
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

    // Kontrollera att slug och name är unikt inom samma parent (exklusive nuvarande kategori)
    const potentialConflicts = await db
      .select()
      .from(categories)
      .where(
        and(
          or(
            eq(
              sql`lower(${categories.slug})`,
              validatedData.slug.toLowerCase()
            ),
            eq(sql`lower(${categories.name})`, validatedData.name.toLowerCase())
          ),
          validatedData.parentId
            ? eq(categories.parentId, validatedData.parentId)
            : isNull(categories.parentId)
        )
      );

    const conflicts = potentialConflicts.filter((cat) => cat.id !== id);

    if (conflicts.length > 0) {
      const slugConflict = conflicts.some(
        (c) => c.slug.toLowerCase() === validatedData.slug.toLowerCase()
      );
      const nameConflict = conflicts.some(
        (c) => c.name.toLowerCase() === validatedData.name.toLowerCase()
      );

      const conflictParts = [];
      if (slugConflict) conflictParts.push('slug');
      if (nameConflict) conflictParts.push('name');

      return {
        success: false,
        error: `En kategori med detta ${conflictParts.join(
          ' och '
        )} finns redan på samma nivå.`,
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

    // Hantera bilduppdateringar - radera gamla bilder om nya har laddats upp
    if (validatedData.desktopImage || validatedData.mobileImage) {
      const oldDesktopImage = existingCategory.desktopImage;
      const oldMobileImage = existingCategory.mobileImage;
      const newDesktopImage = validatedData.desktopImage;
      const newMobileImage = validatedData.mobileImage;

      // Radera gamla desktop-bild om en ny har laddats upp
      if (
        oldDesktopImage &&
        newDesktopImage &&
        oldDesktopImage !== newDesktopImage &&
        isUploadedImage(oldDesktopImage)
      ) {
        try {
          const imagePath = path.join(process.cwd(), 'public', oldDesktopImage);
          await fs.unlink(imagePath);
        } catch (error) {
          console.warn(
            'Could not delete old desktop image:',
            oldDesktopImage,
            error
          );
        }
      }

      // Radera gamla mobile-bild om en ny har laddats upp
      if (
        oldMobileImage &&
        newMobileImage &&
        oldMobileImage !== newMobileImage &&
        isUploadedImage(oldMobileImage)
      ) {
        try {
          const imagePath = path.join(process.cwd(), 'public', oldMobileImage);
          await fs.unlink(imagePath);
        } catch (error) {
          console.warn(
            'Could not delete old mobile image:',
            oldMobileImage,
            error
          );
        }
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
        desktopImage: validatedData.desktopImage || null,
        mobileImage: validatedData.mobileImage || null,
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

    // Radera associerade bilder från filsystemet
    if (
      categoryToDelete.desktopImage &&
      isUploadedImage(categoryToDelete.desktopImage)
    ) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          categoryToDelete.desktopImage
        );
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn(
          'Could not delete desktop image:',
          categoryToDelete.desktopImage,
          error
        );
      }
    }

    if (
      categoryToDelete.mobileImage &&
      isUploadedImage(categoryToDelete.mobileImage)
    ) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          categoryToDelete.mobileImage
        );
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn(
          'Could not delete mobile image:',
          categoryToDelete.mobileImage,
          error
        );
      }
    }

    // Ta bort hela upload-mappen för kategorin om den finns
    if (categoryToDelete.type === 'MAIN-CATEGORY') {
      try {
        const uploadDir = path.join(
          process.cwd(),
          'public',
          'uploads',
          'categories',
          categoryToDelete.slug
        );
        await fs.rmdir(uploadDir);
      } catch (error) {
        console.warn(
          'Could not delete category upload directory:',
          categoryToDelete.slug,
          error
        );
      }
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
