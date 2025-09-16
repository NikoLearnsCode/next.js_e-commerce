'use server';

import {db} from '@/drizzle';
import {eq, desc, or, ilike, sql} from 'drizzle-orm';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {productsTable} from '@/drizzle/db/schema';
import {ActionResult} from '@/lib/types/query';
import path from 'path';
import fs from 'fs/promises';
import {revalidatePath} from 'next/cache';
import {isUploadedImage} from '@/utils/image-helpers';

export async function getAllProducts(searchTerm?: string) {
  if (!searchTerm?.trim()) {
    const products = await db
      .select()
      .from(productsTable)
      .orderBy(desc(productsTable.updated_at));
    return products;
  }

  const searchPattern = `%${searchTerm.trim()}%`;

  const products = await db
    .select()
    .from(productsTable)
    .where(
      or(
        // For UUID, use like instead of ilike and convert to text
        sql`${productsTable.id}::text ILIKE ${searchPattern}`,
        ilike(productsTable.name, searchPattern),
        ilike(productsTable.gender, searchPattern),
        ilike(productsTable.category, searchPattern)
      )
    )
    .orderBy(desc(productsTable.updated_at));

  return products;
}

export async function createProduct(
  data: ProductFormData & {images: string[]}
): Promise<ActionResult> {
  try {
    const validationResult = productFormSchema.safeParse(data);

    if (!validationResult.success) {
      console.error('Valideringsfel:', validationResult.error.flatten());
      return {
        success: false,
        error: 'Produktdata är ogiltig. Kontrollera alla fält.',
      };
    }

    if (data.images.length === 0) {
      return {success: false, error: 'Minst en bild måste laddas upp.'};
    }

    const existingProduct = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, data.slug))
      .limit(1);

    if (existingProduct.length > 0) {
      return {
        success: false,
        error: `Slug "${data.slug}" används redan av en annan produkt. Välj en unik slug.`,
      };
    }

    const now = new Date();
    const publishedAt = data.publishedAt || now;
    const [newProduct] = await db
      .insert(productsTable)
      .values({
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price.toString(),
        brand: data.brand,
        gender: data.gender,
        category: data.category,
        color: data.color,
        sizes: data.sizes,
        specs: data.specs,
        images: data.images,
        created_at: now,
        updated_at: now,
        published_at: publishedAt,
      })
      .returning();

    revalidatePath('/admin/products');

    return {success: true, data: newProduct};
  } catch (error) {
    console.error('Ett fel uppstod i createProduct:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint')
      ) {
        return {
          success: false,
          error: 'En produkt med denna slug eller information finns redan.',
        };
      }
    }

    return {
      success: false,
      error: 'Ett oväntat fel uppstod på servern. Produkten kunde inte sparas.',
    };
  }
}

export async function updateProduct(
  id: string,
  data: ProductFormData & {images?: string[]}
): Promise<ActionResult> {
  try {
    const validationResult = productFormSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Produktdata är ogiltig. Kontrollera alla fält.',
      };
    }

    const [currentProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!currentProduct) {
      return {
        success: false,
        error: 'Produkten kunde inte hittas.',
      };
    }

    const existingProductWithSlug = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, data.slug))
      .limit(1);

    if (
      existingProductWithSlug.length > 0 &&
      existingProductWithSlug[0].id !== id
    ) {
      return {
        success: false,
        error: `Slug "${data.slug}" används redan av en annan produkt. Välj en unik slug.`,
      };
    }

    const updateData: Partial<typeof productsTable.$inferInsert> = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price.toString(),
      brand: data.brand,
      gender: data.gender,
      category: data.category,
      color: data.color,
      sizes: data.sizes,
      specs: data.specs,
      updated_at: new Date(),
    };

    if (data.publishedAt !== undefined) {
      updateData.published_at = data.publishedAt;
    }

    if (data.images !== undefined) {
      if (data.images.length === 0) {
        return {
          success: false,
          error: 'Minst en bild måste finnas kvar.',
        };
      }

      const oldImages = currentProduct.images || [];
      const newImages = data.images;

      const imagesToDelete = oldImages.filter(
        (img) => !newImages.includes(img) && isUploadedImage(img)
      );

      for (const imageUrl of imagesToDelete) {
        try {
          const imagePath = path.join(process.cwd(), 'public', imageUrl);
          await fs.unlink(imagePath);
        } catch (error) {
          console.warn('Could not delete old image:', imageUrl, error);
        }
      }

      updateData.images = newImages;
    }

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    revalidatePath('/admin/products');

    return {success: true, data: updatedProduct};
  } catch (error) {
    console.error('Ett fel uppstod i updateProduct:', error);

    if (error instanceof Error) {
      if (
        error.message.includes('duplicate key') ||
        error.message.includes('unique constraint')
      ) {
        return {
          success: false,
          error: 'En produkt med denna slug eller information finns redan.',
        };
      }
    }

    return {
      success: false,
      error: 'Ett oväntat fel uppstod vid uppdatering av produkten.',
    };
  }
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  try {
    const [product] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id));

    if (!product) {
      return {
        success: false,
        error: 'Produkten kunde inte hittas.',
      };
    }

    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        // Only delete images from uploads directory (not testdata from public/images)
        if (isUploadedImage(imageUrl)) {
          try {
            const imagePath = path.join(process.cwd(), 'public', imageUrl);

            await fs.unlink(imagePath);
          } catch (error) {
            console.warn('Could not delete image:', imageUrl, error);
          }
        }
      }
    }

    await db.delete(productsTable).where(eq(productsTable.id, id));

    revalidatePath('/admin/products');

    return {success: true};
  } catch (error) {
    console.error('Ett fel uppstod i deleteProduct:', error);
    return {
      success: false,
      error: 'Ett oväntat fel uppstod vid borttagning av produkten.',
    };
  }
}
