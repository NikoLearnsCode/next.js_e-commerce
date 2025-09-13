'use server';

import path from 'path';
import fs from 'fs/promises';
import {randomUUID} from 'crypto';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGES = 10;

interface ValidationError {
  fileName: string;
  error: string;
}

export async function uploadProductImages(
  images: File[],
  gender: string,
  category: string
): Promise<string[]> {

  if (images.length === 0) {
    throw new Error('Inga bilder att ladda upp');
  }

  if (images.length > MAX_IMAGES) {
    throw new Error(`Maximalt ${MAX_IMAGES} bilder tillåtna`);
  }


  const validationErrors: ValidationError[] = [];

  for (const image of images) {

    if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
      validationErrors.push({
        fileName: image.name,
        error: `Filtyp ${image.type} är inte tillåten. Endast JPEG, PNG och WebP tillåts.`,
      });
      continue;
    }


    if (image.size > MAX_FILE_SIZE) {
      validationErrors.push({
        fileName: image.name,
        error: `Filen är ${(image.size / 1024 / 1024).toFixed(1)}MB. Maximal storlek är ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
      });
      continue;
    }


    if (image.size === 0) {
      validationErrors.push({
        fileName: image.name,
        error: 'Filen är tom',
      });
    }
  }


  if (validationErrors.length > 0) {
    const errorMessage = validationErrors
      .map((err) => `${err.fileName}: ${err.error}`)
      .join('\n');
    throw new Error(`Bildvalidering misslyckades:\n${errorMessage}`);
  }

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    gender,
    category
  );

  // Skapa upload-mapp
  try {
    await fs.mkdir(uploadDir, {recursive: true});
  } catch (error) {
    throw new Error(`Kunde inte skapa upload-mapp: ${error}`);
  }

  const imageUrls: string[] = [];
  const uploadedFiles: string[] = [];

  try {
    // Ladda upp alla bilder
    for (const image of images) {
      const buffer = Buffer.from(await image.arrayBuffer());

      const sanitizedName = image.name
        .replace(/[^a-zA-Z0-9.-]/g, '_') // Ersätt alla icke-alfanumeriska tecken
        .replace(/_{2,}/g, '_') // Ersätt flera understreck med ett
        .toLowerCase();

      const fileExtension = path.extname(sanitizedName);
      const baseName = path.basename(sanitizedName, fileExtension);
      const finalFileName = `${baseName}_${randomUUID()}${fileExtension}`;

      const savePath = path.join(uploadDir, finalFileName);

      try {
        await fs.writeFile(savePath, buffer);
        uploadedFiles.push(savePath);

        const publicUrl = `/uploads/${gender}/${category}/${finalFileName}`;
        imageUrls.push(publicUrl);
      } catch (writeError) {
        throw new Error(`Kunde inte spara ${image.name}: ${writeError}`);
      }
    }

    return imageUrls;
  } catch (error) {
    for (const filePath of uploadedFiles) {
      try {
        await fs.unlink(filePath);
      } catch (cleanupError) {
        console.warn(
          `Kunde inte ta bort fil vid cleanup: ${filePath}`,
          cleanupError
        );
      }
    }

    throw error;
  }
}
