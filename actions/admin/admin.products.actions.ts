'use server';

import {db} from '@/drizzle';
import {eq, desc, or, ilike, sql, not, and} from 'drizzle-orm';
import {productSchema} from '@/lib/validators/admin-validators';
import {productsTable} from '@/drizzle/db/schema';
import {ActionResult} from '@/lib/types/query';
import path from 'path';
import fs from 'fs/promises';
import {revalidatePath} from 'next/cache';
import {isUploadedImage} from '@/utils/image-helpers';
import {uploadProductImages} from './admin.image-upload.actions';

// alla produkter + sök productsTable
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

// rensa bilder vid fel och delete
async function cleanupProductImages(imageUrls: string[]) {
  for (const url of imageUrls) {
    if (url && isUploadedImage(url)) {
      try {
        await fs.unlink(path.join(process.cwd(), 'public', url));
      } catch (error) {
        console.warn(`Could not delete image on error: ${url}`, error);
      }
    }
  }
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
      await cleanupProductImages(product.images);
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
  // destrukturera ut images som hanteras separat
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {images, ...rawData} = Object.fromEntries(formData.entries());

  const preparedData = {
    ...rawData,
    // konvertera price till number
    price: Number(rawData.price) || 0,
    // konvertera sizes till array
    sizes: rawData.sizes
      ? rawData.sizes
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    // konvertera specs till array
    specs: rawData.specs
      ? rawData.specs
          .toString()
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    // konvertera published_at till date
    published_at: rawData.published_at
      ? new Date(rawData.published_at.toString())
      : undefined,
  };

  // validerar data utan images
  const validationResult = productSchema.safeParse(preparedData);

  if (!validationResult.success) {
    return {
      success: false,
      error: 'Formulärdata är ogiltig.',
    };
  }
  const validatedData = validationResult.data;

  // kollar om slug finns redan
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
    // säkerhetskontroll som inte borde behövas
    if (imageFiles.length === 0) {
      return {success: false, error: 'Minst en bild måste laddas upp.'};
    }

    // laddar upp bilder
    uploadedImageUrls = await uploadProductImages(
      imageFiles,
      validatedData.gender,
      validatedData.category
    );

    // konstruera final data
    const dbInsertData = validatedData;
    const finalDbData = {
      ...dbInsertData,
      price: dbInsertData.price.toString(),
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
    await cleanupProductImages(uploadedImageUrls);
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

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    images,
    ...rawData
  } = Object.fromEntries(formData.entries());

  const preparedData = {
    ...rawData,
    price: rawData.price ? Number(rawData.price) : 0,
    sizes: rawData.sizes
      ? rawData.sizes
          .toString()
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    specs: rawData.specs
      ? rawData.specs
          .toString()
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    // konvertera published_at till date
    published_at: rawData.published_at
      ? new Date(rawData.published_at.toString())
      : undefined,
  };

  const validationResult = productSchema.safeParse(preparedData);

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

    if (existingImages.length + newImageFiles.length === 0) {
      return {success: false, error: 'Minst en bild måste finnas kvar.'};
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
    await cleanupProductImages(imagesToDelete);

    const dbUpdateData = validatedData;
    const finalUpdateData = {
      ...dbUpdateData,
      price: dbUpdateData.price.toString(),
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
    await cleanupProductImages(newlyUploadedImageUrls);
    return {success: false, error: 'Ett serverfel uppstod vid uppdatering.'};
  }
}
