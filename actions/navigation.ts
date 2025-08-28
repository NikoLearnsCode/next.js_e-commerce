'use server';

import {db} from '@/drizzle/index';
import {mainCategories} from '@/drizzle/db/schema';
import {asc} from 'drizzle-orm';
import {NavLink} from '@/components/header/NavLinks';

export async function getNavigationData() {
  const staticLinks: NavLink[] = [
    {
      title: 'Hem',
      href: '/',
      displayOrder: 3,
      subLinks: [
        {title: 'Kontakta oss', href: '/kontakt', displayOrder: 0},
        {title: 'Returer', href: '/retur', displayOrder: 2},
        {title: 'Frakt', href: '/frakt', displayOrder: 3},
      ],
    },
  ];

  let dynamicLinks: NavLink[] = [];

  try {
    const categoriesWithSubs = await db.query.mainCategories.findMany({
      orderBy: [asc(mainCategories.displayOrder)],
      with: {
        subCategories: {
          orderBy: (subCategories, {asc}) => [asc(subCategories.displayOrder)],
          with: {
            subSubCategories: {
              orderBy: (subSubCategories, {asc}) => [
                asc(subSubCategories.displayOrder),
              ],
            },
          },
        },
      },
    });

    dynamicLinks = categoriesWithSubs.map((mainCat) => {
      const subLinksForMain = mainCat.subCategories.map((subCat) => {
        const subSubLinksForSub = subCat.subSubCategories.map((subSubCat) => ({
          title: subSubCat.name,
          href: `/c/${mainCat.slug}/${subSubCat.slug}`,
          displayOrder: subSubCat.displayOrder,
        }));

        return {
          title: subCat.name,
          href: `/c/${mainCat.slug}/${subCat.slug}`,
          displayOrder: subCat.displayOrder,
          subSubLinks:
            subSubLinksForSub.length > 0 ? subSubLinksForSub : undefined,
        };
      });

      // console.log('SUBLINKS', subLinksForMain);
      return {
        title: mainCat.name,
        href: `/c/${mainCat.slug}`,
        displayOrder: mainCat.displayOrder,
        subLinks: subLinksForMain.length > 0 ? subLinksForMain : undefined,
      };
    });
  } catch (error) {
    console.error('Fel vid hämtning av navigation:', error);
  }

  const navLinks = [...dynamicLinks, ...staticLinks];

  // console.log('NAVLINKS', navLinks);
  console.log('SLUT', navLinks);
  return navLinks;
}
