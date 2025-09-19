import {CategoryWithChildren} from '@/lib/types/category-types';

export interface DropdownOption {
  value: number;
  slug: string;
  label: string;
}

/**
 * @param nodes Den nästade listan med kategorier att söka i.
 * @param allowedTypes En array med strängar, t.ex. ['SUB-CATEGORY', 'COLLECTION'].
 * Endast kategorier vars typ finns i denna lista kommer att inkluderas.
 * @param parentName Namnet på föräldrakategorin. Används för att bygga
 * de beskrivande etiketterna.
 * @returns En platt array med `DropdownOption`-objekt.
 */
export function findCategoriesForDropdown(
  nodes: CategoryWithChildren[],
  allowedTypes: string[],
  parentName: string | null = null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  // Loopa igenom varje kategori (nod) på den nuvarande nivån i trädet.
  for (const node of nodes) {
    // Olika allowedTypes för products/categories
    if (allowedTypes.includes(node.type)) {
      options.push({
        value: node.id,
        slug: node.slug,
        // Om parentName finns (dvs.inte på toppnivån),
        // skapa en etikett som "Barnets Namn - Förälderns Namn".
        // Annars, använd bara kategorins eget namn.
        label: parentName ? `${node.name} - ${parentName}` : node.name,
      });
    }
    if (node.children && node.children.length > 0) {
      // fortsätter och gör samma sak för alla barn.
      options = options.concat(
        findCategoriesForDropdown(
          node.children,
          allowedTypes,
          node.name // skicka med den nuvarande nodens namn som parentName till nästa nivå.
        )
      );
    }
  }

  return options;
}

/**
 * Skapar en Map för snabb uppslagning av kategorier via deras ID.
 * Går rekursivt igenom hela trädstrukturen.
 * @param cats Den nästade listan med kategorier.
 * @returns En Map<number, CategoryWithChildren>
 */
export const createCategoryLookupMap = (
  cats: CategoryWithChildren[]
): Map<number, CategoryWithChildren> => {
  const map = new Map<number, CategoryWithChildren>();

  function buildMap(nodes: CategoryWithChildren[]) {
    for (const node of nodes) {
      map.set(node.id, node);
      if (node.children && node.children.length > 0) {
        buildMap(node.children);
      }
    }
  }

  buildMap(cats);
  return map;
};
