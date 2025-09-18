'use server';

import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {asc, eq, and} from 'drizzle-orm';
import {NavLink} from '@/lib/types/category';

import {
  buildCategoryTree,
  transformTreeToNavLinks,
} from '@/actions/lib/categoryTree-builder';

export async function getNavigationData(): Promise<NavLink[]> {
  try {
    const flatCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));

    const categoryTree = buildCategoryTree(flatCategories);

    const navLinks = transformTreeToNavLinks(categoryTree);

    return navLinks;
  } catch (error) {
    console.error('Fel vid hämtning av navigation:', error);
    return [];
  }
}

export async function getMainCategoriesForHomepage() {
  return await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.type, 'MAIN-CATEGORY'), eq(categories.isActive, true))
    )
    .orderBy(asc(categories.displayOrder));
}