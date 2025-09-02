'use server';

import {db} from '@/drizzle';

import {z} from 'zod';
import {productFormSchema} from '@/lib/form-validators';

import {productsTable} from '@/drizzle/db/schema';

// Importera Node.js-moduler för att hantera filsystemet
import path from 'path';
import fs from 'fs/promises';
import {revalidatePath} from 'next/cache';

// Definiera en typ för returvärdet för bättre typsäkerhet
type ActionResult = {
  success: boolean;
  data?: any; // Byt ut 'any' mot din produkttyp om du vill
  error?: string;
};

export async function addProductWithImages(
  formData: FormData
): Promise<ActionResult> {
  const rawData = Object.fromEntries(formData.entries());

  // Manually parse JSON string fields back into arrays before validation
  if (typeof rawData.sizes === 'string') {
    try {
      rawData.sizes = JSON.parse(rawData.sizes);
    } catch (e) {
      return {success: false, error: 'Ogiltigt format för storlekar.'};
    }
  }
  if (typeof rawData.specs === 'string') {
    try {
      rawData.specs = JSON.parse(rawData.specs);
    } catch (e) {
      return {success: false, error: 'Ogiltigt format för specifikationer.'};
    }
  }

  // Create a new schema on the server to validate the transformed data
  const serverSchema = productFormSchema.extend({
    sizes: z.array(z.string()),
    specs: z.array(z.string()),
  });

  const validationResult = serverSchema.safeParse(rawData);

  if (!validationResult.success) {
    console.error('Valideringsfel:', validationResult.error.flatten());
    // Skicka tillbaka ett mer användarvänligt felmeddelande
    return {
      success: false,
      error: 'Formulärdatan är ogiltig. Kontrollera alla fält.',
    };
  }
  const validatedData = validationResult.data;

  const images = formData
    .getAll('images')
    .filter((f) => f instanceof File && f.size > 0) as File[];

  if (images.length === 0) {
    return {success: false, error: 'Minst en bild måste laddas upp.'};
  }

  try {
    const imageUrls: string[] = [];

    const uploadDir = path.join(
      process.cwd(),
      'public',
      'images',
      validatedData.gender,
      validatedData.category
    );

    await fs.mkdir(uploadDir, {recursive: true});

    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const filename = `${Date.now()}-${image.name.replace(/\s/g, '_')}`;
      const savePath = path.join(uploadDir, filename);

      await fs.writeFile(savePath, buffer);

      const publicUrl = `/images/${validatedData.gender}/${validatedData.category}/${filename}`;
      imageUrls.push(publicUrl);
    }
    const [newProduct] = await db
      .insert(productsTable)
      .values({
        ...validatedData,
        price: validatedData.price.toString(),
        // sizes and specs are now correctly typed as string[]
        images: imageUrls,
      })
      .returning();

    revalidatePath('/products');
    revalidatePath(`/products/${newProduct.slug}`);

    return {success: true, data: newProduct};
  } catch (error) {
    console.error('Ett fel uppstod i Server Action:', error);

    return {
      success: false,
      error: 'Ett oväntat fel uppstod på servern. Produkten kunde inte sparas.',
    };
  }
}

export async function getAllProducts() {
  const products = await db.select().from(productsTable);
  return products;
}

// TODO: Implementera updateProduct server action
export async function updateProduct(
  id: number,
  formData: FormData
): Promise<ActionResult> {
  // TODO: Validera inkommande data
  // TODO: Hantera bilduppdateringar (ta bort gamla, lägg till nya)
  // TODO: Uppdatera product i databas
  // TODO: Revalidate relevanta paths

  console.log('updateProduct called with:', id, formData);

  return {
    success: false,
    error: 'updateProduct inte implementerad ännu',
  };
}

// TODO: Implementera deleteProduct server action
export async function deleteProduct(id: number): Promise<ActionResult> {
  // TODO: Hitta produkt i databas
  // TODO: Ta bort alla associerade bilder från filesystem
  // TODO: Ta bort product från databas
  // TODO: Revalidate relevanta paths

  console.log('deleteProduct called with:', id);

  return {
    success: false,
    error: 'deleteProduct inte implementerad ännu',
  };
}
