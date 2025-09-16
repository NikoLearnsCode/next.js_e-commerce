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
import {uploadProductImages} from './admin.image-upload.actions';

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

// FORMDATA-BASED ATOMIC ACTIONS

function parseProductFormData(formData: FormData): ProductFormData {
  const sizes = formData.get('sizes') as string;
  const specs = formData.get('specs') as string;
  const publishedAtStr = formData.get('publishedAt') as string;

  const priceStr = formData.get('price') as string;
  const price = priceStr ? parseInt(priceStr, 10) : 0;

  return {
    name: formData.get('name') as string,
    slug: formData.get('slug') as string,
    description: formData.get('description') as string,
    price: isNaN(price) ? 0 : price,
    brand: formData.get('brand') as string,
    gender: formData.get('gender') as string,
    category: formData.get('category') as string,
    color: formData.get('color') as string,
    sizes: sizes
      ? sizes
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    specs: specs
      ? specs
          .split('\n')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    publishedAt: publishedAtStr ? new Date(publishedAtStr) : undefined,
  };
}

function extractImageFiles(formData: FormData): File[] {
  return formData
    .getAll('images')
    .filter((file): file is File => file instanceof File && file.size > 0);
}

export async function createProductWithImages(
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  let uploadedImageUrls: string[] = [];
  try {
    const productData = parseProductFormData(formData);
    const imageFiles = extractImageFiles(formData);

    const validationResult = productFormSchema.safeParse(productData);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Formulärdata är ogiltig. Kontrollera fälten.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const existingProduct = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, productData.slug))
      .limit(1);
    if (existingProduct.length > 0) {
      return {
        success: false,
        error: `Slug "${productData.slug}" används redan.`,
      };
    }

    if (imageFiles.length === 0) {
      return {success: false, error: 'Minst en bild måste laddas upp.'};
    }

    uploadedImageUrls = await uploadProductImages(
      imageFiles,
      productData.gender,
      productData.category
    );

    const now = new Date();
    const publishedAt = productData.publishedAt || now;
    const [newProduct] = await db
      .insert(productsTable)
      .values({
        ...productData,
        price: productData.price.toString(),
        images: uploadedImageUrls,
        created_at: now,
        updated_at: now,
        published_at: publishedAt,
      })
      .returning();

    revalidatePath('/admin/products');
    return {success: true, data: newProduct};
  } catch (error) {
    console.error('Fel i createProductWithImages:', error);
    // Din städlogik för bilder...
    return {success: false, error: 'Ett serverfel uppstod.'};
  }
}

export async function updateProductWithImages(
  id: string,
  prevState: any,
  formData: FormData
): Promise<ActionResult> {
  let newlyUploadedImageUrls: string[] = [];
  try {
    const productData = parseProductFormData(formData);
    const newImageFiles = extractImageFiles(formData);
    const existingImages = formData
      .getAll('existingImages')
      .filter(
        (img): img is string => typeof img === 'string' && img.length > 0
      );

    const validationResult = productFormSchema.safeParse(productData);
    if (!validationResult.success) {
      return {
        success: false,
        error: 'Formulärdata är ogiltig. Kontrollera fälten.',
        errors: validationResult.error.flatten().fieldErrors,
      };
    }

    const [currentProduct] = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.id, id))
      .limit(1);
    if (!currentProduct) {
      return {success: false, error: 'Produkten kunde inte hittas.'};
    }

    const existingProductWithSlug = await db
      .select()
      .from(productsTable)
      .where(eq(productsTable.slug, productData.slug))
      .limit(1);
    if (
      existingProductWithSlug.length > 0 &&
      existingProductWithSlug[0].id !== id
    ) {
      return {
        success: false,
        error: `Slug "${productData.slug}" används redan av en annan produkt.`,
      };
    }

    if (existingImages.length + newImageFiles.length === 0) {
      return {success: false, error: 'Minst en bild måste finnas kvar.'};
    }

    if (newImageFiles.length > 0) {
      newlyUploadedImageUrls = await uploadProductImages(
        newImageFiles,
        productData.gender,
        productData.category
      );
    }

    const finalImages = [...existingImages, ...newlyUploadedImageUrls];

    const oldImages = currentProduct.images || [];
    const imagesToDelete = oldImages.filter(
      (img) => !finalImages.includes(img) && isUploadedImage(img)
    );

    for (const imageUrl of imagesToDelete) {
      try {
        const imagePath = path.join(process.cwd(), 'public', imageUrl);
        await fs.unlink(imagePath);
      } catch (error) {
        console.warn('Could not delete old image:', imageUrl, error);
      }
    }

    const updateData: Partial<typeof productsTable.$inferInsert> = {
      ...productData,
      price: productData.price.toString(),
      images: finalImages,
      updated_at: new Date(),
      published_at: productData.publishedAt,
    };

    const [updatedProduct] = await db
      .update(productsTable)
      .set(updateData)
      .where(eq(productsTable.id, id))
      .returning();

    revalidatePath('/admin/products');
    return {success: true, data: updatedProduct};
  } catch (error) {
    console.error('Fel i updateProductWithImages:', error);
    // Din städlogik för nyligen uppladdade bilder...
    return {success: false, error: 'Ett serverfel uppstod vid uppdatering.'};
  }
}
