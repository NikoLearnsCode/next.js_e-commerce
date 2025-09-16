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
import {uploadCategoryImages} from './admin.image-upload.actions';

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

// FORMDATA-BASED ATOMIC ACTIONS

/**
 * Parses CategoryFormData from FormData object
 */
function parseCategoryFormData(formData: FormData): CategoryFormData {
  const parentIdStr = formData.get('parentId') as string;

  return {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    type: formData.get('type') as
      | 'MAIN-CATEGORY'
      | 'SUB-CATEGORY'
      | 'CONTAINER',
    displayOrder: parseInt(formData.get('displayOrder') as string) || 0,
    isActive: formData.get('isActive') === 'true',
    parentId:
      parentIdStr && parentIdStr !== 'null' ? parseInt(parentIdStr) : null,
    desktopImage: (formData.get('desktopImage') as string) || '',
    mobileImage: (formData.get('mobileImage') as string) || '',
  };
}

/**
 * Extracts image files from FormData for categories
 */
function extractCategoryImageFiles(formData: FormData): {
  desktopImage: File | null;
  mobileImage: File | null;
} {
  const desktopFile = formData.get('desktopImageFile') as File | null;
  const mobileFile = formData.get('mobileImageFile') as File | null;

  return {
    desktopImage: desktopFile && desktopFile.size > 0 ? desktopFile : null,
    mobileImage: mobileFile && mobileFile.size > 0 ? mobileFile : null,
  };
}

/**
 * Atomic server action for creating a category with images
 */
export async function createCategoryWithImages(
  formData: FormData
): Promise<ActionResult> {
  let uploadedDesktopImage: string | undefined;
  let uploadedMobileImage: string | undefined;

  try {
    // Parse form data
    const categoryData = parseCategoryFormData(formData);
    const {desktopImage, mobileImage} = extractCategoryImageFiles(formData);

    // Validate form data
    const validatedData = categoryFormSchema.parse(categoryData);

    // Check for existing categories with same slug/name within parent
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

    // Upload images if provided and type is MAIN-CATEGORY
    let finalData = {...validatedData};
    if (
      validatedData.type === 'MAIN-CATEGORY' &&
      (desktopImage || mobileImage)
    ) {
      try {
        const imageUrls = await uploadCategoryImages(
          desktopImage,
          mobileImage,
          validatedData.slug
        );

        uploadedDesktopImage = imageUrls.desktopImageUrl;
        uploadedMobileImage = imageUrls.mobileImageUrl;
        finalData.desktopImage = uploadedDesktopImage || '';
        finalData.mobileImage = uploadedMobileImage || '';
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return {
          success: false,
          error: `Bilduppladdning misslyckades: ${uploadError}`,
        };
      }
    }

    // Create new category
    const now = new Date();
    const [newCategory] = await db
      .insert(categories)
      .values({
        name: finalData.name,
        slug: finalData.slug,
        type: finalData.type,
        displayOrder: finalData.displayOrder,
        isActive: finalData.isActive,
        parentId: finalData.parentId,
        desktopImage: finalData.desktopImage || null,
        mobileImage: finalData.mobileImage || null,
        created_at: now,
        updated_at: now,
      })
      .returning();

    // Revalidate relevant paths
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {
      success: true,
      data: newCategory,
    };
  } catch (error) {
    console.error('Error creating category with images:', error);

    // Clean up uploaded images if database operation failed
    if (uploadedDesktopImage && isUploadedImage(uploadedDesktopImage)) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          uploadedDesktopImage
        );
        await fs.unlink(imagePath);
        console.log('Cleaned up uploaded desktop image:', uploadedDesktopImage);
      } catch (cleanupError) {
        console.warn(
          'Could not clean up uploaded desktop image:',
          uploadedDesktopImage,
          cleanupError
        );
      }
    }

    if (uploadedMobileImage && isUploadedImage(uploadedMobileImage)) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          uploadedMobileImage
        );
        await fs.unlink(imagePath);
        console.log('Cleaned up uploaded mobile image:', uploadedMobileImage);
      } catch (cleanupError) {
        console.warn(
          'Could not clean up uploaded mobile image:',
          uploadedMobileImage,
          cleanupError
        );
      }
    }

    return {
      success: false,
      error: 'Ett fel uppstod vid skapandet av kategorin.',
    };
  }
}

/**
 * Atomic server action for updating a category with images
 */
export async function updateCategoryWithImages(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  let newlyUploadedDesktopImage: string | undefined;
  let newlyUploadedMobileImage: string | undefined;

  try {
    // Parse form data
    const categoryData = parseCategoryFormData(formData);
    const {desktopImage: newDesktopFile, mobileImage: newMobileFile} =
      extractCategoryImageFiles(formData);

    // Validate form data
    const validatedData = categoryFormSchema.parse(categoryData);

    // Check if category exists
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

    // Check for conflicts (excluding current category)
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

    // Check for circular references
    if (validatedData.parentId) {
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

    // Handle image uploads for MAIN-CATEGORY
    let finalData = {...validatedData};

    if (
      validatedData.type === 'MAIN-CATEGORY' &&
      (newDesktopFile || newMobileFile)
    ) {
      try {
        const imageUrls = await uploadCategoryImages(
          newDesktopFile,
          newMobileFile,
          validatedData.slug
        );

        newlyUploadedDesktopImage = imageUrls.desktopImageUrl;
        newlyUploadedMobileImage = imageUrls.mobileImageUrl;

        // Delete old images if new ones were uploaded
        const oldDesktopImage = existingCategory.desktopImage;
        const oldMobileImage = existingCategory.mobileImage;

        if (
          newDesktopFile &&
          oldDesktopImage &&
          isUploadedImage(oldDesktopImage)
        ) {
          try {
            const imagePath = path.join(
              process.cwd(),
              'public',
              oldDesktopImage
            );
            await fs.unlink(imagePath);
          } catch (error) {
            console.warn(
              'Could not delete old desktop image:',
              oldDesktopImage,
              error
            );
          }
        }

        if (
          newMobileFile &&
          oldMobileImage &&
          isUploadedImage(oldMobileImage)
        ) {
          try {
            const imagePath = path.join(
              process.cwd(),
              'public',
              oldMobileImage
            );
            await fs.unlink(imagePath);
          } catch (error) {
            console.warn(
              'Could not delete old mobile image:',
              oldMobileImage,
              error
            );
          }
        }

        finalData.desktopImage =
          newlyUploadedDesktopImage || existingCategory.desktopImage || '';
        finalData.mobileImage =
          newlyUploadedMobileImage || existingCategory.mobileImage || '';
      } catch (uploadError) {
        console.error('Image upload error:', uploadError);
        return {
          success: false,
          error: `Bilduppladdning misslyckades: ${uploadError}`,
        };
      }
    } else {
      // Keep existing images if no new files uploaded
      finalData.desktopImage = existingCategory.desktopImage || '';
      finalData.mobileImage = existingCategory.mobileImage || '';
    }

    // Update category
    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: finalData.name,
        slug: finalData.slug,
        type: finalData.type,
        displayOrder: finalData.displayOrder,
        isActive: finalData.isActive,
        parentId: finalData.parentId,
        desktopImage: finalData.desktopImage || null,
        mobileImage: finalData.mobileImage || null,
        updated_at: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    // Revalidate relevant paths
    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {
      success: true,
      data: updatedCategory,
    };
  } catch (error) {
    console.error('Error updating category with images:', error);

    // Clean up newly uploaded images if database operation failed
    if (
      newlyUploadedDesktopImage &&
      isUploadedImage(newlyUploadedDesktopImage)
    ) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          newlyUploadedDesktopImage
        );
        await fs.unlink(imagePath);
        console.log(
          'Cleaned up newly uploaded desktop image:',
          newlyUploadedDesktopImage
        );
      } catch (cleanupError) {
        console.warn(
          'Could not clean up newly uploaded desktop image:',
          newlyUploadedDesktopImage,
          cleanupError
        );
      }
    }

    if (newlyUploadedMobileImage && isUploadedImage(newlyUploadedMobileImage)) {
      try {
        const imagePath = path.join(
          process.cwd(),
          'public',
          newlyUploadedMobileImage
        );
        await fs.unlink(imagePath);
        console.log(
          'Cleaned up newly uploaded mobile image:',
          newlyUploadedMobileImage
        );
      } catch (cleanupError) {
        console.warn(
          'Could not clean up newly uploaded mobile image:',
          newlyUploadedMobileImage,
          cleanupError
        );
      }
    }

    return {
      success: false,
      error: 'Ett fel uppstod vid uppdateringen av kategorin.',
    };
  }
}
