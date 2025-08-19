import {clsx, type ClassValue} from 'clsx';
import {twMerge} from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type SortField = 'id' | 'price' | 'name';

export type SortOrder = 'asc' | 'desc';

export interface SortParams {
  sort: SortField;
  order: SortOrder;
}

// Gemensam funktion för att parsa sort-parametrar
export function parseSortParam(sortParam?: string | null): SortParams {
  if (!sortParam) return {sort: 'id', order: 'asc'};

  switch (sortParam) {
    case 'price_asc':
      return {sort: 'price', order: 'asc'};
    case 'price_desc':
      return {sort: 'price', order: 'desc'};
    case 'name_asc':
      return {sort: 'name', order: 'asc'};
    default:
      return {sort: 'id', order: 'asc'};
  }
}

const SIZE_ORDER: Record<string, number> = {
  XXS: 0,
  XS: 1,
  S: 2,
  M: 3,
  L: 4,
  XL: 5,
  XXL: 6,
  XXXL: 7,
};

export function sortSizes(sizes: string[]): string[] {
  const text: string[] = [];
  const numeric: string[] = [];

  for (const sz of sizes) {
    const upper = sz.toUpperCase();
    if (SIZE_ORDER[upper] !== undefined) {
      text.push(sz);
    } else {
      numeric.push(sz);
    }
  }

  // Textstorlekar i definierad ordning
  text.sort(
    (a, b) => SIZE_ORDER[a.toUpperCase()] - SIZE_ORDER[b.toUpperCase()]
  );

  // Numeriska (hanterar t.ex. '42.5', annars fallback till localeCompare)
  numeric.sort((a, b) => {
    const na = parseFloat(a);
    const nb = parseFloat(b);
    if (!Number.isNaN(na) && !Number.isNaN(nb)) return na - nb;
    return a.localeCompare(b, 'sv');
  });

  return [...text, ...numeric];
}

export function formatPrice(price: number) {
  return price.toLocaleString('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    minimumFractionDigits: 0,
  });
}
