'use server';

import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import {asc, eq} from 'drizzle-orm';
import {NavLink} from '@/lib/types/category';

import {
  buildCategoryTree,
  transformTreeToNavLinks,
} from '@/actions/admin/utils/category.builder';

export async function getNavigationData(): Promise<NavLink[]> {
  const staticLinks: NavLink[] = [
    {
      title: 'Hem',
      href: '/',
      displayOrder: 99,
      children: [
        {title: 'Kontakta oss', href: '/kontakt', displayOrder: 0},
        {title: 'Returer', href: '/retur', displayOrder: 2},
        {title: 'Frakt', href: '/frakt', displayOrder: 3},
      ],
    },
  ];

  let dynamicLinks: NavLink[] = [];

  try {
    // Steg 1: Hämta den platta listan med aktiva kategorier
    const flatCategories = await db
      .select()
      .from(categories)
      .where(eq(categories.isActive, true))
      .orderBy(asc(categories.displayOrder));

    // Steg 2: Bygg det fullständiga kategoriträdet
    const categoryTree = buildCategoryTree(flatCategories);

    // Steg 3: Transformera det fullständiga trädet till det slimmade NavLink-formatet
    dynamicLinks = transformTreeToNavLinks(categoryTree);
  } catch (error) {
    console.error('Fel vid hämtning av navigation:', error);
    // Returnera bara statiska länkar om något går fel
    return staticLinks;
  }

  const navLinks = [...dynamicLinks, ...staticLinks];
  navLinks.sort((a, b) => a.displayOrder - b.displayOrder);

  return navLinks;
}
