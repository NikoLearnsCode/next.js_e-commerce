import {CategoryWithChildren} from '@/lib/types/category';

export type DropdownOption = {
  value: number;
  slug: string;
  label: string;
};

/**
 * Hittar alla kategorier som kan agera som en FÖRÄLDER till en annan kategori.
 * Enligt reglerna kan endast 'MAIN-CATEGORY' och 'CONTAINER' vara föräldrar.
 * Funktionen bygger en lista med alternativ för en dropdown-meny i admin-gränssnittet.
 *
 * @param nodes - En array av hela kategoriträdet.
 * @param parentName - Används för rekursion för att bygga en tydlig label (t.ex. "Accessoarer - Herr").
 * @returns En array av DropdownOption som kan användas i en <select>-lista.
 */
export function findAllPossibleParentCategories(
  nodes: CategoryWithChildren[],
  parentName: string | null = null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  for (const node of nodes) {
    if (node.type === 'MAIN-CATEGORY' || node.type === 'CONTAINER') {
      options.push({
        value: node.id,
        slug: node.slug,
        label: parentName
          ? `${node.name} - (${parentName.toLowerCase()} - ${node.type.toLowerCase()})`
          : `1. ${node.name.toUpperCase()}`,
      });
    }

    if (node.children && node.children.length > 0) {
      options = options.concat(
        findAllPossibleParentCategories(node.children, node.name)
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
