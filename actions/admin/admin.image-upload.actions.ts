'use server';

import path from 'path';
import fs from 'fs/promises';
import {randomUUID} from 'crypto';

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_PRODUCT_IMAGES = 10;

interface ValidationError {
  fileName: string;
  error: string;
}

interface UploadOptions {
  destinationPath: string;
  fileNameGenerator: (file: File, index: number) => string;
}

interface UploadResult {
  publicUrl: string;
  savedPath: string;
}

// HJÄLPFUNKTIONER

// Validerar en enskild fil mot de globala reglerna.
function validateImage(image: File): ValidationError | null {
  if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
    return {
      fileName: image.name,
      error: `Filtyp ${image.type} är inte tillåten.`,
    };
  }
  if (image.size > MAX_FILE_SIZE) {
    return {
      fileName: image.name,
      error: `Filen är för stor (${(image.size / 1024 / 1024).toFixed(1)}MB). Max ${MAX_FILE_SIZE / 1024 / 1024}MB.`,
    };
  }
  if (image.size === 0) {
    return {
      fileName: image.name,
      error: 'Filen är tom.',
    };
  }
  return null;
}

/**
 * Genererar ett unikt och säkert filnamn för produktbilder.
 */
function generateProductFileName(file: File): string {
  const sanitizedName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();

  const fileExtension = path.extname(sanitizedName);
  const baseName = path.basename(sanitizedName, fileExtension);
  return `${baseName}_${randomUUID()}${fileExtension}`;
}

// HUVUDFUNKTIONER

// En generell funktion för att validera och ladda upp bilder.
async function handleImageUpload(
  files: File[],
  options: UploadOptions
): Promise<UploadResult[]> {
  if (files.length === 0) {
    throw new Error('Inga bilder att ladda upp.');
  }

  // Validera alla filer
  const validationErrors = files
    .map(validateImage)
    .filter(Boolean) as ValidationError[];
  if (validationErrors.length > 0) {
    const errorMessage = validationErrors
      .map((err) => `${err.fileName}: ${err.error}`)
      .join('\n');
    throw new Error(`Bildvalidering misslyckades:\n${errorMessage}`);
  }

  // Skapa målmapp
  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    options.destinationPath
  );
  try {
    await fs.mkdir(uploadDir, {recursive: true});
  } catch (error) {
    throw new Error(`Kunde inte skapa upload-mapp: ${error}`);
  }

  //  Ladda upp filerna
  const uploadedFiles: UploadResult[] = [];
  const results: UploadResult[] = [];

  try {
    for (const [index, file] of files.entries()) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const finalFileName = options.fileNameGenerator(file, index);
      const savePath = path.join(uploadDir, finalFileName);

      await fs.writeFile(savePath, buffer);

      const result = {
        publicUrl: `/uploads/${options.destinationPath}/${finalFileName}`,
        savedPath: savePath,
      };
      uploadedFiles.push(result);
      results.push(result);
    }
    return results;
  } catch (error) {
    // 4. Städa upp filer om något går fel
    for (const file of uploadedFiles) {
      try {
        await fs.unlink(file.savedPath);
      } catch (cleanupError) {
        console.warn(
          `Kunde inte ta bort fil vid cleanup: ${file.savedPath}`,
          cleanupError
        );
      }
    }

    throw error;
  }
}

// EXPORTERADE FUNKTIONER

export async function uploadCategoryImages(
  desktopImage: File | null,
  mobileImage: File | null,
  categorySlug: string
): Promise<{desktopImageUrl?: string; mobileImageUrl?: string}> {
  const imagesWithKeys = [
    {key: 'desktop', file: desktopImage},
    {key: 'mobile', file: mobileImage},
  ].filter((item) => item.file) as {key: 'desktop' | 'mobile'; file: File}[];

  const files = imagesWithKeys.map((item) => item.file);

  if (files.length === 0) {
    throw new Error('Minst en bild måste väljas');
  }

  const results = await handleImageUpload(files, {
    destinationPath: path.join('categories', categorySlug),
    fileNameGenerator: (file, index) => {
      const fileExtension = path.extname(file.name);
      // Använd nyckeln från `imagesWithKeys` för att bestämma namnet
      const key = imagesWithKeys[index].key;
      return `${key}${fileExtension}`;
    },
  });

  // Mappa tillbaka resultatet till det förväntade formatet
  const urls: {desktopImageUrl?: string; mobileImageUrl?: string} = {};
  results.forEach((result, index) => {
    const key = imagesWithKeys[index].key;
    if (key === 'desktop') urls.desktopImageUrl = result.publicUrl;
    if (key === 'mobile') urls.mobileImageUrl = result.publicUrl;
  });

  return urls;
}

export async function uploadProductImages(
  images: File[],
  gender: string,
  category: string
): Promise<string[]> {
  if (images.length > MAX_PRODUCT_IMAGES) {
    throw new Error(`Maximalt ${MAX_PRODUCT_IMAGES} bilder tillåtna.`);
  }

  const results = await handleImageUpload(images, {
    destinationPath: path.join(gender, category),
    fileNameGenerator: generateProductFileName,
  });

  return results.map((result) => result.publicUrl);
}
