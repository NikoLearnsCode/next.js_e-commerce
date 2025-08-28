import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ------------------------------------------------------------
export function formatPrice(price: string | number | undefined | null): string {
  if (price === undefined || price === null) {
    return '–';
  }

  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice)) {
    return '–';
  }
  const options: Intl.NumberFormatOptions = {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: numPrice % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  };

  if (numPrice % 1 === 0) {
    options.minimumFractionDigits = 0;
  } else {
    options.minimumFractionDigits = 2;
  }

  return new Intl.NumberFormat('sv-SE', options).format(numPrice);
}

// ------------------------------------------------------------

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
  slug: 'URL',
  created_at: 'Skapad',
  updated_at: 'Uppdaterad',

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
