import {CategoryWithChildren} from '@/lib/types/category';

// Du behöver fortfarande din DropdownOption-typ
export interface DropdownOption {
  value: number;
  slug: string;
  label: string;
}

/**
 * Hittar och formaterar kategorier från ett träd för att användas i en dropdown.
 * Funktionen filtrerar resultatet baserat på en lista av tillåtna kategorityper.
 *
 * @param nodes - En array av hela kategoriträdet.
 * @param allowedTypes - En array av kategorityper som ska inkluderas (t.ex. ['MAIN-CATEGORY', 'CONTAINER']).
 * @param parentName - Används internt för att bygga hierarkiska etiketter.
 * @returns En array av DropdownOption.
 */
export function findCategoriesForDropdown(
  nodes: CategoryWithChildren[],
  allowedTypes: string[],
  parentName: string | null = null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  for (const node of nodes) {
    // Steg 1: Kontrollera om nodens typ är tillåten.
    if (allowedTypes.includes(node.type)) {
      options.push({
        value: node.id,
        slug: node.slug,
        // Steg 2: Använd en standardiserad etikett.
        // Skapar "Kategori" eller "Kategori - Förälder"
        label: parentName ? `${node.name} - ${parentName}` : node.name,
      });
    }

    // Rekursivt anrop för att gå igenom alla barn.
    if (node.children && node.children.length > 0) {
      options = options.concat(
        findCategoriesForDropdown(node.children, allowedTypes, node.name)
      );
    }
  }

  return options;
}

/**
 * En hjälpfunktion för att hitta en specifik kategori i den nästlade `categories`-trädstrukturen.
 *
 * @param cats - En array av kategorier i kategoriträdet.
 * @param id - Kategoris ID.
 * @returns En array av DropdownOption som kan användas i en <select>-lista.
 */
export const findCategoryById = (
  cats: CategoryWithChildren[],
  id: number
): CategoryWithChildren | null => {
  for (const cat of cats) {
    if (cat.id === id) return cat;
    /*  if (cat.children) {
      // Om kategorin har barn, anropa samma funktion för barnen.
      const found = findCategoryById(cat.children, id);
      if (found) return found; 
    } */
  }
  return null;
};
