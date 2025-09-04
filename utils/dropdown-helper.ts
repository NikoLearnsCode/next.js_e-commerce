import {CategoryWithChildren} from '@/lib/types/category';

// Typen för alternativen i våra dropdowns.
// Vi behöver ID för React's 'key', slug för <option>'s 'value', och label för texten.
export type DropdownOption = {
  value: number; // Kategori-ID, bra för unika keys i React
  slug: string; // Kategorins slug, detta blir värdet som skickas med formuläret
  label: string; // Texten som visas, t.ex. "Byxor - Plagg"
};

/**
 * En rekursiv funktion som hittar ALLA valbara underkategorier
 * (av typen 'MAIN' eller 'SUB') inuti ett givet träd eller en gren.
 * Bygger en lista med alternativ för en dropdown.
 */
export function findAllAssignableSubCategories(
  nodes: CategoryWithChildren[],
  parentName: string | null = null
): DropdownOption[] {
  let options: DropdownOption[] = [];

  for (const node of nodes) {
    // Produkter kan tilldelas både MAIN (t.ex. "Dam") och SUB (t.ex. "Byxor")
    if (node.type === 'MAIN-CATEGORY' || node.type === 'SUB-CATEGORY') {
      options.push({
        value: node.id,
        slug: node.slug, // Vi inkluderar slugen
        // Skapa etiketten "Barn - Förälder" om det finns en förälder
        label: parentName ? `${node.name} - ${parentName}` : node.name,
      });
    }

    // Fortsätt leta rekursivt efter barn
    if (node.children && node.children.length > 0) {
      options = options.concat(
        findAllAssignableSubCategories(node.children, node.name)
      );
    }
  }

  return options;
}



