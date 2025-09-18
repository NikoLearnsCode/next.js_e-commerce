'use server';

import {db} from '@/drizzle/index';
import {categories, productsTable} from '@/drizzle/db/schema';
import {asc, eq, and, isNull, or, sql, not} from 'drizzle-orm';
import {revalidatePath} from 'next/cache';
import path from 'path';
import fs from 'fs/promises';

import {buildCategoryTree} from '@/actions/lib/categoryTree-builder';
import {
  categoryFormSchema,
  insertCategorySchema,
  CategoryFormData,
} from '@/lib/validators/admin-validators';
import {ActionResult} from '@/lib/types/query';
import {isUploadedImage} from '@/utils/image-helpers';
import {uploadCategoryImages} from './admin.image-upload.actions';
import {Category} from '@/lib/types/category';

// =================================================================================
// PUBLIC API FUNCTIONS
// =================================================================================

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));
  return buildCategoryTree(flatCategories);
}

export async function createCategoryWithImages(
  formData: FormData
): Promise<ActionResult> {
  let uploadedImages: {desktop?: string; mobile?: string} = {};
  try {
    const rawData = Object.fromEntries(formData.entries());
    const formResult = categoryFormSchema.parse(rawData);
    const {desktopImageFile, mobileImageFile, ...categoryData} = formResult;

    await checkCategoryConflicts(categoryData);

    if (
      categoryData.type === 'MAIN-CATEGORY' &&
      (desktopImageFile || mobileImageFile)
    ) {
      const {desktopImageUrl, mobileImageUrl} = await uploadCategoryImages(
        desktopImageFile,
        mobileImageFile,
        categoryData.slug
      );
      if (desktopImageUrl) uploadedImages.desktop = desktopImageUrl;
      if (mobileImageUrl) uploadedImages.mobile = mobileImageUrl;
    }

    const finalPayload = {
      ...categoryData,
      desktopImage: uploadedImages.desktop || null,
      mobileImage: uploadedImages.mobile || null,
    };
    const dbData = insertCategorySchema.parse(finalPayload);

    const [newCategory] = await db
      .insert(categories)
      .values(dbData)
      .returning();

    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {success: true, data: newCategory};
  } catch (error: any) {
    console.error('Error creating category:', error);
    await cleanupUploadedImages(Object.values(uploadedImages));
    // Zod-error block is now removed
    if (error.message.startsWith('Conflict:')) {
      return {success: false, error: error.message.replace('Conflict: ', '')};
    }
    return {success: false, error: 'Ett oväntat serverfel uppstod.'};
  }
}

export async function updateCategoryWithImages(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  console.log('formData', formData);
  let uploadedImages: {desktop?: string; mobile?: string} = {};
  try {
    const [existingCategory] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!existingCategory) {
      return {success: false, error: 'Kategorin kunde inte hittas.'};
    }

    const editedData = Object.fromEntries(formData.entries());
    const formResult = categoryFormSchema.parse(editedData);

    console.log('formResult', formResult);
    const {desktopImageFile, mobileImageFile, ...categoryData} = formResult;

    await checkCategoryConflicts(categoryData, id);

    const imageUpdateResult = await handleImageUpdates(
      existingCategory,
      desktopImageFile,
      mobileImageFile,
      categoryData.slug,
      formData
    );
    uploadedImages = imageUpdateResult.newlyUploaded;

    console.log('imageUpdateResult', imageUpdateResult);

    const [updatedCategory] = await db
      .update(categories)
      .set({
        name: formResult.name,
        slug: formResult.slug,
        displayOrder: formResult.displayOrder,
        isActive: formResult.isActive,
        desktopImage: imageUpdateResult.finalImageUrls.desktop,
        mobileImage: imageUpdateResult.finalImageUrls.mobile,
        updated_at: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();

    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {success: true, data: updatedCategory};
  } catch (error: any) {
    console.error('Error updating category:', error);
    await cleanupUploadedImages(Object.values(uploadedImages));
    // Zod-error block is now removed
    if (error.message.startsWith('Conflict:')) {
      return {success: false, error: error.message.replace('Conflict: ', '')};
    }
    return {success: false, error: 'Ett oväntat serverfel uppstod.'};
  }
}

export async function deleteCategory(id: number): Promise<ActionResult> {
  try {
    const [categoryToDelete] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1);

    if (!categoryToDelete) {
      return {success: false, error: 'Kategorin kunde inte hittas.'};
    }
    if (categoryToDelete.type === 'COLLECTION') {
      return {success: false, error: 'Collection-kategorier kan inte raderas.'};
    }

    const linkedProducts = await db
      .select({count: sql<number>`count(*)`})
      .from(productsTable)
      .where(eq(productsTable.category, categoryToDelete.slug));
    if (linkedProducts[0].count > 0) {
      return {
        success: false,
        error: `Kan inte raderas, ${linkedProducts[0].count} produkter är kopplade.`,
      };
    }

    const childCategories = await db
      .select({count: sql<number>`count(*)`})
      .from(categories)
      .where(eq(categories.parentId, id));
    if (childCategories[0].count > 0) {
      return {
        success: false,
        error: `Kan inte raderas, ${childCategories[0].count} underkategorier finns.`,
      };
    }

    await cleanupUploadedImages([
      categoryToDelete.desktopImage,
      categoryToDelete.mobileImage,
    ]);
    await db.delete(categories).where(eq(categories.id, id));

    revalidatePath('/admin/categories');
    revalidatePath('/admin');

    return {success: true, data: {deletedId: id}};
  } catch (error) {
    console.error('Error deleting category:', error);
    return {success: false, error: 'Ett serverfel uppstod vid radering.'};
  }
}

// =================================================================================
// INTERNAL HELPER FUNCTIONS
// =================================================================================

async function checkCategoryConflicts(
  data: Pick<CategoryFormData, 'name' | 'slug' | 'parentId'>,
  excludeId?: number
) {
  const conditions = [
    or(
      eq(sql`lower(${categories.slug})`, data.slug.toLowerCase()),
      eq(sql`lower(${categories.name})`, data.name.toLowerCase())
    ),
    data.parentId
      ? eq(categories.parentId, data.parentId)
      : isNull(categories.parentId),
  ];

  if (excludeId) {
    conditions.push(not(eq(categories.id, excludeId)));
  }

  const existing = await db
    .select()
    .from(categories)
    .where(and(...conditions));

  if (existing.length > 0) {
    const isSlugConflict = existing.some(
      (c) => c.slug.toLowerCase() === data.slug.toLowerCase()
    );
    const isNameConflict = existing.some(
      (c) => c.name.toLowerCase() === data.name.toLowerCase()
    );
    let conflictField = '';
    if (isSlugConflict && isNameConflict) conflictField = 'namn och slug';
    else if (isSlugConflict) conflictField = 'slug';
    else if (isNameConflict) conflictField = 'namn';

    throw new Error(
      `Conflict: En kategori med detta ${conflictField} finns redan på samma nivå.`
    );
  }
}

async function handleImageUpdates(
  existingCategory: Pick<Category, 'desktopImage' | 'mobileImage'>,
  newDesktopFile: File | null,
  newMobileFile: File | null,
  slug: string,
  formData: FormData
) {
  let finalDesktopUrl = existingCategory.desktopImage;
  let finalMobileUrl = existingCategory.mobileImage;
  const newlyUploaded: {desktop?: string; mobile?: string} = {};

  if (formData.get('desktopImage') === '') finalDesktopUrl = null;
  if (formData.get('mobileImage') === '') finalMobileUrl = null;

  if (newDesktopFile || newMobileFile) {
    const {desktopImageUrl, mobileImageUrl} = await uploadCategoryImages(
      newDesktopFile,
      newMobileFile,
      slug
    );

    if (desktopImageUrl) {
      await cleanupUploadedImages([finalDesktopUrl]);
      finalDesktopUrl = desktopImageUrl;
      newlyUploaded.desktop = desktopImageUrl;
    }
    if (mobileImageUrl) {
      await cleanupUploadedImages([finalMobileUrl]);
      finalMobileUrl = mobileImageUrl;
      newlyUploaded.mobile = mobileImageUrl;
    }
  }

  return {
    finalImageUrls: {desktop: finalDesktopUrl, mobile: finalMobileUrl},
    newlyUploaded,
  };
}

export async function cleanupUploadedImages(
  imageUrls: (string | undefined | null)[]
) {
  for (const url of imageUrls) {
    if (url && isUploadedImage(url)) {
      try {
        await fs.unlink(path.join(process.cwd(), 'public', url));
      } catch (error) {
        console.warn(`Could not delete image file: ${url}`, error);
      }
    }
  }
}
