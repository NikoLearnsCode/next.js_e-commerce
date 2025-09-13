export function isUploadedImage(imageUrl: string): boolean {
  return imageUrl.startsWith('/uploads/');
}
