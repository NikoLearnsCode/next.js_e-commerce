import {Category, CategoryWithChildren, NavLink} from '@/lib/types/category';

/**
 * Bygger en nästad trädstruktur från en platt lista av kategorier.
 * Denna funktion är rekursiv, vilket betyder att den anropar sig själv.
 *
 * @param items - En "platt" array med alla kategorier, precis som från en databas.
 * @param parentId - ID:t för den förälder vars barn vi just nu letar efter.
 * När funktionen anropas första gången är detta `null`, vilket
 * betyder att vi letar efter toppnivå-kategorierna (de utan förälder).
 * @returns En array med kategorier för den aktuella nivån, där varje kategori
 * kan innehålla en `children`-array med sina egna barn.
 */
export function buildCategoryTree(
  items: Category[],
  parentId: number | null = null
): CategoryWithChildren[] {
  return (
    items
      // Steg 1: Hitta alla direkta barn till det angivna `parentId`.
      // Första gången (parentId = null) hittar detta 'Dam', 'Herr', etc.
      // I ett senare anrop (parentId = 1) hittar det barnen till 'Dam'.
      .filter((item) => item.parentId === parentId)

      // Steg 2: För varje barn som hittades, skapa ett nytt objekt.
      .map((item) => {
        // Steg 3: "PAUS OCH DYK NER".
        // Här anropar funktionen sig själv för att hitta ALLA barnbarn,
        // barnbarnsbarn, etc., till den *nuvarande* kategorin (`item`).
        // Datorn pausar körningen av denna .map() och fokuserar helt på att
        // bygga upp hela trädet för `item.id`. Först när hela den grenen
        // är klar, återvänder den hit och fortsätter.
        const children = buildCategoryTree(items, item.id);

        // Steg 4: Skapa och returnera det färdiga objektet för denna kategori.
        return {
          // ...item: Kopiera alla egenskaper från originalkategorin (id, name, slug, etc.).
          ...item,
          // Detta är ett trick: Lägg ENDAST till `children`-egenskapen om listan
          // med barn faktiskt innehåller något. Annars skippas den.
          ...(children.length > 0 && {children}),
        };
      })
  );
}

/**
 * Omvandlar det färdiga kategoriträdet till en lista av navigeringslänkar (`NavLink`).
 * Denna funktion är också rekursiv. Den bygger URL-sökvägar steg för steg.
 *
 * @param categories - En nästad array av kategorier (resultatet från `buildCategoryTree`).
 * @param parentSlugs - En array med URL-delar (`slugs`) från föräldrarna.
 * Används för att bygga korrekta, fullständiga URL:er.
 * Börjar som en tom array `[]`.
 * @returns En array med `NavLink`-objekt, redo att användas i en meny.
 */
export function transformTreeToNavLinks(
  categories: CategoryWithChildren[],
  parentSlugs: string[] = []
): NavLink[] {
  // Först, sortera kategorierna på den aktuella nivån enligt `displayOrder`.
  // Detta säkerställer att menyn visas i den avsedda ordningen.
  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  // Gå igenom varje kategori på den sorterade nivån.
  return sortedCategories.map((category) => {
    let currentPathSlugs: string[];
    const hasChildren = category.children && category.children.length > 0;

    // Här är den speciella logiken för hur URL:er ska byggas.
    if (category.type === 'CONTAINER') {
      // OM kategorin är en 'CONTAINER', är den bara en visuell gruppering.
      // Dess egen slug ska INTE läggas till i URL:en.
      // Vi behåller helt enkelt den sökväg vi fick från föräldern.
      // Exempel: /dam/ (container: 'plagg') /klanningar -> /dam/klanningar
      currentPathSlugs = parentSlugs;
    } else {
      // FÖR ALLA ANDRA typer (`MAIN`, `SUB`, `COLLECTION`), lägg till
      // den nuvarande kategorins slug till sökvägen.
      // Exempel: parentSlugs var ['dam'], nu blir det ['dam', 'nyheter'].
      currentPathSlugs = [...parentSlugs, category.slug];
    }

    // Skapa det grundläggande NavLink-objektet.
    const navLink: NavLink = {
      title: category.name,
      // Sätt ihop alla delar i sökvägen till en komplett URL.
      // ['dam', 'klanningar'] blir "/c/dam/klanningar".
      href: `/c/${currentPathSlugs.join('/')}`,
      displayOrder: category.displayOrder,
      // `isFolder` kan användas i gränssnittet för att t.ex. visa en pil.
      isFolder: hasChildren,
    };

    // Om denna kategori har barn, måste vi omvandla dem också.
    if (hasChildren) {
      // "PAUS OCH DYK NER" igen.
      // Anropa denna funktion för barnlistan. Det VIKTIGA är att vi skickar
      // med `currentPathSlugs`, så att barnen vet hur deras egna URL:er ska börja.
      navLink.children = transformTreeToNavLinks(
        category.children!, // `!` säger till TypeScript att vi vet att `children` finns här.
        currentPathSlugs
      );
    }

    // Returnera det kompletta NavLink-objektet, som nu kan innehålla
    // en egen nästad `children`-lista med färdiga länkar.
    return navLink;
  });
}
