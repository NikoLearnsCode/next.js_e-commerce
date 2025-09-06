import {CategoryWithChildren} from '@/lib/types/category';

export type FlattenedCategory = CategoryWithChildren & {
  level: number;
  parentName?: string;
};

export const flattenCategoriesRecursive = (
  cats: CategoryWithChildren[],
  expandedCategories: Set<number>,
  level = 0,
  parentName?: string
): FlattenedCategory[] => {
  const flattened: FlattenedCategory[] = [];
  cats.forEach((cat) => {
    flattened.push({...cat, level, parentName});
    if (
      expandedCategories.has(cat.id) &&
      cat.children &&
      cat.children.length > 0
    ) {
      flattened.push(
        ...flattenCategoriesRecursive(
          cat.children,
          expandedCategories,
          level + 1,
          cat.name
        )
      );
    }
  });
  return flattened;
};

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
