import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {asc} from 'drizzle-orm';
import {buildCategoryTree} from '@/actions/admin/utils/category-builder';
import {createCategoryDropdownOptions} from '@/actions/admin/utils/category-formatter';

export async function getCategoriesWithChildren() {
  const flatCategories = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.displayOrder));

  const categoryTree = buildCategoryTree(flatCategories);

  return categoryTree;
}

export async function getDataForProductForm() {
  const categoryTree = await getCategoriesWithChildren();
  const dropdownOptions = createCategoryDropdownOptions(categoryTree);

  return dropdownOptions;
}
