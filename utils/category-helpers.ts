import {
  Category,
  CategoryWithChildren,
  NavLink,
} from '@/lib/types/category-types';

/**
 * Tar en platt lista av kategorier och bygger en rekursiv trädstruktur.
 * Detta är den primära funktionen för att skapa det kompletta trädet för t.ex. admin.
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
        // Lägg bara till children-arrayen om den inte är tom
        ...(children.length > 0 && {children}),
      };
    });
}

export function transformTreeToNavLinks(
  categories: CategoryWithChildren[],
  mainCategorySlug: string | null = null
): NavLink[] {
  return categories.map((category) => {
    const currentMainSlug = mainCategorySlug || category.slug;
    const hasChildren = category.children && category.children.length > 0;
    let href: string;

    if (mainCategorySlug === null) {
      href = `/c/${category.slug}`;
    } else {
      if (hasChildren) {
        href = '#';
      } else {
        href = `/c/${mainCategorySlug}/${category.slug}`;
      }
    }

    const navLink: NavLink = {
      title: category.name,
      href: href,
      displayOrder: category.displayOrder,
      isFolder: hasChildren, // <-- DEN ENDA NYA RADEN
    };

    if (hasChildren) {
      navLink.children = transformTreeToNavLinks(
        category.children!,
        currentMainSlug
      );
    }

    return navLink;
  });
}
