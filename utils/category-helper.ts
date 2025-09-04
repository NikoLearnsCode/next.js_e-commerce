import {CategoryWithChildren} from '@/lib/types/category';
import {
  VALID_PARENT_TYPES,
  type ValidParentType,
  type CategoryType,
} from '@/lib/form-validators';

// Typ-guard för att kontrollera om en kategori-typ kan vara förälder
const isValidParentType = (type: CategoryType): type is ValidParentType => {
  return (VALID_PARENT_TYPES as readonly string[]).includes(type);
};

// Samma typ som du redan använder, den passar perfekt.
export type DropdownOption = {
  value: number; // Kategori-ID
  slug: string; // Kategorins slug
  label: string; // Visningstext, t.ex. "Kläder - Dam"
};

/**
 * Hittar alla kategorier som kan agera som en FÖRÄLDER till en annan kategori.
 * Enligt reglerna kan endast 'MAIN-CATEGORY' och 'CONTAINER' vara föräldrar.
 * Funktionen bygger en lista med alternativ för en dropdown-meny i admin-gränssnittet.
 *
 * @param nodes - En array av kategorier, troligtvis hela kategoriträdet.
 * @param parentName - Används för rekursion för att bygga en tydlig label (t.ex. "Accessoarer - Herr").
 * @returns En array av DropdownOption som kan användas i en <select>-lista.
 */
export function findAllPossibleParentCategories(
  nodes: CategoryWithChildren[],
  parentName: string | null = null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  for (const node of nodes) {
    // VIKTIGT: Här är den nya logiken.
    // En kategori kan bara ha en MAIN-CATEGORY eller en CONTAINER som förälder.
    // Vi plockar ut dessa för att lista dem som valbara alternativ.
    if (isValidParentType(node.type)) {
      options.push({
        value: node.id,
        slug: node.slug,
        // Skapa en tydlig label, precis som i din befintliga funktion.
        label: parentName ? `${node.name} - ${parentName}` : `1. ${node.name}`,
      });
    }

    // Fortsätt leta rekursivt i barnen.
    // En SUB-CATEGORY kan inte vara förälder, men den kan innehålla en CONTAINER som kan vara det
    // (även om er nuvarande struktur inte verkar ha det, gör detta koden mer robust).
    // I praktiken kommer den främst leta i barnen till MAIN-CATEGORY.
    if (node.children && node.children.length > 0) {
      options = options.concat(
        findAllPossibleParentCategories(node.children, node.name)
      );
    }
  }

  return options;
}
