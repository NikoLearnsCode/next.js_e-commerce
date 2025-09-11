'use server';

import path from 'path';
import fs from 'fs/promises';

export async function uploadProductImages(
  images: File[],
  gender: string,
  category: string
): Promise<string[]> {
  const imageUrls: string[] = [];

  const uploadDir = path.join(
    process.cwd(),
    'public',
    'uploads',
    gender,
    category
  );

  await fs.mkdir(uploadDir, {recursive: true});

  for (const image of images) {
    const buffer = Buffer.from(await image.arrayBuffer());

    // MINIMAL ÄNDRING FÖR ATT FIXA FELET
    const originalName = image.name;

    const sanitizedName = originalName
      .replace(/\s/g, '_')
      .replace(/å/g, 'a')
      .replace(/ä/g, 'a')
      .replace(/ö/g, 'o')
      .replace(/Å/g, 'A')
      .replace(/Ä/g, 'A')
      .replace(/Ö/g, 'O');

    // Vi behåller `Date.now()` för att undvika att filer skriver över varandra.
    const finalFileName = `${Date.now()}-${sanitizedName}`;

    // Resten av koden är densamma
    const savePath = path.join(uploadDir, finalFileName);
    await fs.writeFile(savePath, buffer);
    const publicUrl = `/uploads/${gender}/${category}/${finalFileName}`;
    imageUrls.push(publicUrl);
  }

  return imageUrls;
}
