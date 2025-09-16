import {CategoryWithChildren} from '@/lib/types/category';

// Du behöver fortfarande din DropdownOption-typ
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
  // Starta med en tom lista som vi kommer att fylla på under resans gång.
  let options: DropdownOption[] = [];

  // Loopa igenom varje kategori (nod) på den nuvarande nivån i trädet.
  for (const node of nodes) {
    // Steg 1: Kontrollera om den nuvarande nodens typ är tillåten.
    // Detta fungerar som ett filter eller en "gatekeeper".
    // Bara om `node.type` finns i `allowedTypes` fortsätter vi.
    if (allowedTypes.includes(node.type)) {
      // Om typen är godkänd, skapa ett nytt `DropdownOption`-objekt...
      options.push({
        value: node.id, // Värdet som skickas, t.ex. till en databas.
        slug: node.slug, // URL-sluggen, kan vara användbar.
        // Steg 2: Skapa en användarvänlig etikett.
        // Om `parentName` finns (dvs. vi är inte på toppnivån),
        // skapa en etikett som "Barnets Namn - Förälderns Namn".
        // Annars, använd bara kategorins eget namn.
        // Detta är superbra för att skilja på t.ex. 'Byxor - Dam' och 'Byxor - Herr'.
        label: parentName ? `${node.name} - ${parentName}` : node.name,
      });
    }

    // Steg 3: "Dyk ner" och gör samma sak för alla barn.
    // Om den nuvarande noden har en `children`-array som inte är tom...
    if (node.children && node.children.length > 0) {
      // ...anropa då denna funktion igen för barnen (rekursion).
      // Resultatet från det anropet (en platt lista med barnens alternativ)
      // slås ihop med vår nuvarande `options`-lista.
      options = options.concat(
        findCategoriesForDropdown(
          node.children,
          allowedTypes,
          node.name // VIKTIGT: skicka med den *nuvarande* nodens namn som `parentName` till nästa nivå.
        )
      );
    }
  }

  // När loopen har gått igenom alla noder (och deras barn via rekursion)
  // på denna nivå, returnera den kompletta, platta listan med alternativ.
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
    //  if (cat.children) {
    //   // Om kategorin har barn, anropa samma funktion för barnen.
    //   const found = findCategoryById(cat.children, id);
    //   if (found) return found;
    // }
  }
  return null;
};
