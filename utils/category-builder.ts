import {
  Category,
  CategoryWithChildren,
  NavLink,
} from '@/lib/types/category-types';


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
      isFolder: hasChildren,
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
