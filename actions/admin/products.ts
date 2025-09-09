'use server';

import {db} from '@/drizzle';
import {eq, desc} from 'drizzle-orm';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {productsTable} from '@/drizzle/db/schema';
import {ActionResult} from '@/lib/types/query';
import path from 'path';
import fs from 'fs/promises';
import {revalidatePath} from 'next/cache';

export async function getAllProducts() {
  const products = await db
    .select()
    .from(productsTable)
    .orderBy(desc(productsTable.created_at));
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

    // Transform strings to arrays for database
    const sizesArray = data.sizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    const specsArray = data.specs
      ? data.specs
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

    // Insert into database
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
        sizes: sizesArray,
        specs: specsArray,
        images: data.images,
      })
      .returning();

    revalidatePath('/admin/products');
    // revalidatePath(`/c/${newProduct.gender}/${newProduct.category}`);

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
  data: ProductFormData & {images?: string[]} // images optional for updates
): Promise<ActionResult> {
  try {
    const validationResult = productFormSchema.safeParse(data);

    if (!validationResult.success) {
      return {
        success: false,
        error: 'Produktdata är ogiltig. Kontrollera alla fält.',
      };
    }

    const existingProduct = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, data.slug))
      .limit(1);

    if (existingProduct.length > 0 && existingProduct[0].id !== id) {
      return {
        success: false,
        error: `Slug "${data.slug}" används redan av en annan produkt. Välj en unik slug.`,
      };
    }

    const sizesArray = data.sizes
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    const specsArray = data.specs
      ? data.specs
          .split('\n')
          .map((s) => s.trim())
          .filter((s) => s)
      : [];

    const updateData: Partial<typeof productsTable.$inferInsert> = {
      name: data.name,
      slug: data.slug,
      description: data.description,
      price: data.price.toString(),
      brand: data.brand,
      gender: data.gender,
      category: data.category,
      color: data.color,
      sizes: sizesArray,
      specs: specsArray,
    };

    if (data.images && data.images.length > 0) {
      updateData.images = data.images;
    }

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    revalidatePath('/admin/products');
    // revalidatePath(`/c/${updatedProduct.gender}/${updatedProduct.category}`);

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

// --------------------------------------------------------

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

    // Delete images from filesystem
    if (product.images && product.images.length > 0) {
      for (const imageUrl of product.images) {
        try {
          const imagePath = path.join(process.cwd(), 'uploads', imageUrl);
          await fs.unlink(imagePath);
        } catch (error) {
          console.warn('Could not delete image:', imageUrl, error);
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
