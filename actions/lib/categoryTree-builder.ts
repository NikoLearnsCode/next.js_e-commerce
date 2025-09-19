import {Category, CategoryWithChildren, NavLink} from '@/lib/types/category';

/**
 * Bygger en nästad trädstruktur från en platt lista av kategorier.
 * Denna funktion är rekursiv och anropar sig själv så länge det finns barn.
 *
 * @param items - En "platt" array med alla kategorier från databasen.
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
  return items
    .filter((item) => item.parentId === parentId)
    .map((item) => {
      const children = buildCategoryTree(items, item.id);

      return {
        ...item,
        ...(children.length > 0 && {children}),
      };
    });
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
  return categories.map((category) => {
    let currentPathSlugs: string[];
    const hasChildren = category.children && category.children.length > 0;

    // Container ingår inte i URL
    if (category.type === 'CONTAINER') {
      currentPathSlugs = parentSlugs;
    } else {
      currentPathSlugs = [...parentSlugs, category.slug];
    }

    const navLink: NavLink = {
      title: category.name,
      href:
        category.type === 'CONTAINER'
          ? null
          : `/c/${currentPathSlugs.join('/')}`,
      displayOrder: category.displayOrder,
      isFolder: hasChildren,
    };

    if (hasChildren) {
      navLink.children = transformTreeToNavLinks(
        category.children!,
        currentPathSlugs
      );
    }

    return navLink;
  });
}
