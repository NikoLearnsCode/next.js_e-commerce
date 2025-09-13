// Formatter för datum i admin-gränssnitt
export const adminDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  timeZone: 'Europe/Stockholm',
});

// Hjälpfunktion för att formatera datum
export function formatDateForAdmin(date: Date | null | undefined): string {
  if (!date) return '–';
  return adminDateFormatter.format(date);
}

// ------------------------------------------------------------

// Header-mappningar för alla admin-tabeller
export const adminHeaderMapping: Record<string, string> = {
  // Gemensamma fält
  name: 'Produktnamn',
  slug: 'slug',
  created_at: 'Skapad',
  updated_at: 'Uppdaterad',
  published_at: 'Publicerad',

  // Kategori-specifika
  isActive: 'Status',
  display_order: 'Ordning',

  // Produkt-specifika
  price: 'Pris',
  brand: 'Märke',
  gender: 'Gender',
  category: 'Kategori',
  sizes: 'Storlekar',
  color: 'Färg',
  specs: 'Specifikationer',
  images: 'Bilder',
  description: 'Beskrivning',

  // Order-specifika
  total_amount: 'Totalbelopp',
  payment_info: 'Betalning',
  status: 'Status',
  delivery_info: 'Leveransinfo',
  user_id: 'Användare',
  session_id: 'Session',

};

// Hjälpfunktion för att få rätt header-namn för admin-tabeller
export function getAdminHeader(key: string): string {
  return adminHeaderMapping[key] || key.replace('_', ' ');
}
