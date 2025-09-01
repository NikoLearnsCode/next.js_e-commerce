import {CategoryWithChildren} from '@/lib/types/category';

// Definiera typer för tydlighetens skull
export type DropdownOption = {
  value: number; // Kategori-ID
  label: string; // "Byxor - Plagg"
};

export type GroupedDropdownOption = {
  label: string; // "HERR"
  options: DropdownOption[];
};

/**
 * En inre, rekursiv funktion som hittar alla "giltiga" kategorier
 * (de av typen STANDARD) och bygger deras namn.
 */
function findAssignableCategories(
  nodes: CategoryWithChildren[],
  parentName: string | null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  for (const node of nodes) {
    // Endast kategorier av typen 'STANDARD' ska kunna väljas.
    if (node.type === 'STANDARD') {
      options.push({
        value: node.id,
        // Skapa etiketten "Barn - Förälder" om det finns en förälder
        label: parentName ? `${node.name} - ${parentName}` : node.name,
      });
    }

    // Fortsätt leta efter barn, oavsett typen på nuvarande nod.
    // Skicka med nuvarande nods namn som nästa nivås föräldranamn.
    if (node.children && node.children.length > 0) {
      options = options.concat(
        findAssignableCategories(node.children, node.name)
      );
    }
  }

  return options;
}

/**
 * Huvudfunktion som tar emot hela kategoriträdet och skapar en
 * grupperad lista för en <select>-dropdown.
 */
export function createCategoryDropdownOptions(
  categoryTree: CategoryWithChildren[]
): GroupedDropdownOption[] {
  // Gå igenom huvudkategorierna (Dam, Herr, etc.)
  return categoryTree.map((mainCategory) => {
    // Använd vår rekursiva hjälpfunktion för att hitta alla
    // valbara underkategorier för denna huvudkategori.
    const options = findAssignableCategories([mainCategory], null);

    return {
      label: mainCategory.name.toUpperCase(), // "HERR", "DAM"
      options: options,
    };
  });
}
