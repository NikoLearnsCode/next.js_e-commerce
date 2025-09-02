import {Category, CategoryWithChildren, NavLink} from '@/lib/types/category';

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
  parentSlugs: string[] = []
): NavLink[] {
  const sortedCategories = [...categories].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return sortedCategories.map((category) => {
    let currentPathSlugs: string[];
    const hasChildren = category.children && category.children.length > 0;


    if (category.type === 'CONTAINER') {
      // 'MAIN', 'SUB' och 'COLLECTION' hamnar INTE här. Perfekt.
      currentPathSlugs = parentSlugs;
    } else {
      // 'MAIN', 'SUB' och 'COLLECTION' hamnar här. Perfekt.
      currentPathSlugs = [...parentSlugs, category.slug];
    }

    const navLink: NavLink = {
      title: category.name,
      href: `/c/${currentPathSlugs.join('/')}`,
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
