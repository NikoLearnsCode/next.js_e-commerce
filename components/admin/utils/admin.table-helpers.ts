import {CategoryWithChildren} from '@/lib/types/category';

export type FlattenedCategory = CategoryWithChildren & {
  level: number;
  parentName?: string;
};

/**
 * @param cats Den nästade listan med kategorier som ska plattas ut.
 * @param expandedCategories En `Set` som innehåller ID:n för alla kategorier
 * som användaren har "öppnat" i gränssnittet. Detta är nyckeln som styr
 * vilka barn som ska inkluderas i den platta listan.
 * @param level Nuvarande djup i hierarkin. Ökas för varje rekursivt anrop.
 * @param parentName Namnet på föräldern till `cats`-listan.
 * @returns En platt array med `FlattenedCategory`-objekt.
 */
export const flattenCategoriesRecursive = (
  cats: CategoryWithChildren[],
  expandedCategories: Set<number>,
  level = 0,
  parentName?: string
): FlattenedCategory[] => {
  const flattened: FlattenedCategory[] = [];

  // Gå igenom varje kategori på den nuvarande nivån.
  cats.forEach((cat) => {
    // Steg 1: Lägg ALLTID till den nuvarande kategorin i listan.
    // Oavsett om den är expanderad eller ej, så ska den själv synas.
    // Vi lägger också till `level` och `parentName` som vi fick med oss.
    flattened.push({...cat, level, parentName});

    // Steg 2: Kontrollera om vi ska "dyka ner" och även lägga till barnen.
    if (
      // Villkor 1: Finns denna kategoris ID i listan över expanderade?
      expandedCategories.has(cat.id) &&
      // Villkor 2 & 3: Har kategorin faktiskt en `children`-lista som inte är tom?
      cat.children &&
      cat.children.length > 0
    ) {
      // Om alla villkor är sanna, anropa denna funktion igen för barnen.
      flattened.push(
        // Spridningsoperatorn (...) "packar upp" arrayen som returneras
        // från det rekursiva anropet och lägger till varje element
        // individuellt i vår `flattened`-lista.
        ...flattenCategoriesRecursive(
          cat.children, // Listan att bearbeta nu
          expandedCategories, // Skicka med samma lista över expanderade
          level + 1, // Öka djupet med 1 eftersom vi går ner en nivå
          cat.name // Skicka med nuvarande kategorins namn som `parentName`
        )
      );
    }
  });

  return flattened;
};

// Används för expandAll/collapseAll i CategoryTable.tsx
export const getAllCategoryIdsRecursive = (
  cats: CategoryWithChildren[]
): number[] => {
  let ids: number[] = [];
  for (const cat of cats) {
    ids.push(cat.id);
    if (cat.children && cat.children.length > 0) {
      ids = ids.concat(getAllCategoryIdsRecursive(cat.children));
    }
  }
  return ids;
};

// Används för att styla kategorier i CategoryTable.tsx
export const categoryConfig = {
  'MAIN-CATEGORY': {
    name: 'Huvudkategori',
    className: 'text-black ',
  },
  'SUB-CATEGORY': {
    name: 'Underkategori',
    className: 'text-black font-medium',
  },
  COLLECTION: {
    name: 'Collection',
    className: 'text-red-900 font-syne uppercase  ',
  },
  CONTAINER: {
    name: 'Container',
    className: 'text-emerald-900 font-syne uppercase  ',
  },
};
