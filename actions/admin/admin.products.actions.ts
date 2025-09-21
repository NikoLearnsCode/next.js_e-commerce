'use server';

import {db} from '@/drizzle/index';
import {eq, desc, or, ilike, sql, not, and} from 'drizzle-orm';

import {productApiSchema} from '@/lib/validators/admin.product-validation';
import {productsTable} from '@/drizzle/db/schema';
import {ActionResult} from '@/lib/types/query-types';
import {revalidatePath} from 'next/cache';
import {uploadProductImages} from './admin.image-upload.actions';

import {cleanupUploadedImages} from './admin.categories.actions';

export async function getAllProducts(searchTerm?: string) {
  if (!searchTerm?.trim()) {
    return db
      .select()
      .from(productsTable)
      .orderBy(desc(productsTable.updated_at));
  }
  const searchPattern = `%${searchTerm.trim()}%`;
  return db
    .select()
    .from(productsTable)
    .where(
      or(
        sql`${productsTable.id}::text ILIKE ${searchPattern}`,
        ilike(productsTable.name, searchPattern),
        ilike(productsTable.gender, searchPattern),
        ilike(productsTable.category, searchPattern)
      )
    )
    .orderBy(desc(productsTable.updated_at));
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));
    if (!product) {
      return {success: false, error: 'Produkten kunde inte hittas.'};
    }
    if (product.images && product.images.length > 0) {
      await cleanupUploadedImages(product.images);
    }
    await db.delete(productsTable).where(eq(productsTable.id, id));
    revalidatePath('/admin/products');
    return {success: true};
  } catch (error) {
    console.error('Fel i deleteProduct:', error);
    return {success: false, error: 'Ett oväntat fel uppstod vid borttagning.'};
  }
}

export async function createProductWithImages(
  formData: FormData
): Promise<ActionResult> {
  let uploadedImageUrls: string[] = [];

  const imageFiles = formData
    .getAll('images')
    .filter((file): file is File => file instanceof File && file.size > 0);

  if (imageFiles.length === 0) {
    return {success: false, error: 'Minst en bild måste laddas upp.'};
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {images, ...rawData} = Object.fromEntries(formData.entries());
  const validationResult = productApiSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Formulärdata är ogiltig. Vänligen korrigera felen.',
      // errors: validationResult.error.flatten().fieldErrors,
    };
  }

  const validatedData = validationResult.data;

  try {
    const existingProduct = await db
      .select({id: productsTable.id})
      .from(productsTable)
      .where(eq(productsTable.slug, validatedData.slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return {
        success: false,
        error: `Slug "${validatedData.slug}" används redan.`,
        errors: {slug: [`Slug "${validatedData.slug}" används redan.`]},
      };
    }

    uploadedImageUrls = await uploadProductImages(
      imageFiles,
      validatedData.gender,
      validatedData.category
    );

    const finalDbData = {
      ...validatedData,
      images: uploadedImageUrls,
    };

    const [newProduct] = await db
      .insert(productsTable)
      .values(finalDbData)
      .returning();

    revalidatePath('/admin/products');
    return {success: true, data: newProduct};
  } catch (error) {
    console.error('Fel i createProductWithImages:', error);
    await cleanupUploadedImages(uploadedImageUrls);
    return {success: false, error: 'Ett serverfel uppstod.'};
  }
}

export async function updateProductWithImages(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  let newlyUploadedImageUrls: string[] = [];

  const newImageFiles = formData
    .getAll('images')
    .filter((file): file is File => file instanceof File && file.size > 0);

  const existingImages = formData
    .getAll('existingImages')
    .filter((img): img is string => typeof img === 'string' && img.length > 0);

  if (newImageFiles.length === 0 && existingImages.length === 0) {
    return {success: false, error: 'Minst en bild måste finnas kvar.'};
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {images, ...rawData} = Object.fromEntries(formData.entries());

  const validationResult = productApiSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Formulärdata är ogiltig.',
    };
  }
  const validatedData = validationResult.data;

  try {
    const [currentProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);
    if (!currentProduct) {
      return {success: false, error: 'Produkten kunde inte hittas.'};
    }

    const existingProductWithSlug = await db
      .select({id: productsTable.id})
      .from(productsTable)
      .where(
        and(
          eq(productsTable.slug, validatedData.slug),
          not(eq(productsTable.id, id))
        )
      )
      .limit(1);
    if (existingProductWithSlug.length > 0) {
      return {
        success: false,
        error: `Slug "${validatedData.slug}" används redan.`,
        errors: {slug: [`Slug "${validatedData.slug}" används redan.`]},
      };
    }

    if (newImageFiles.length > 0) {
      newlyUploadedImageUrls = await uploadProductImages(
        newImageFiles,
        validatedData.gender,
        validatedData.category
      );
    }
    const finalImages = [...existingImages, ...newlyUploadedImageUrls];

    const imagesToDelete = (currentProduct.images || []).filter(
      (img) => !finalImages.includes(img)
    );
    await cleanupUploadedImages(imagesToDelete);

    const finalUpdateData = {
      ...validatedData,
      images: finalImages,
      updated_at: new Date(),
    };

    const [updatedProduct] = await db
      .update(productsTable)
      .set(finalUpdateData)
      .where(eq(productsTable.id, id))
      .returning();

    revalidatePath('/admin/products');
    return {success: true, data: updatedProduct};
  } catch (error) {
    console.error('Fel i updateProductWithImages:', error);
    await cleanupUploadedImages(newlyUploadedImageUrls);
    return {success: false, error: 'Ett serverfel uppstod vid uppdatering.'};
  }
}
