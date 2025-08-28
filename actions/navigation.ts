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
      subLinks: [
        {title: 'Kontakta oss', href: '/kontakt'},
        {title: 'Returer', href: '/retur'},
        {title: 'Frakt', href: '/frakt'},
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
      const subLinksForMain = mainCat.subCategories.map((subCat) => ({
        title: subCat.name,
        href: `/c/${mainCat.slug}/${subCat.slug}`,
      }));

      const subSubLinksForMain = mainCat.subCategories.flatMap((subCat) =>
        subCat.subSubCategories.map((subSubCat) => ({
          title: subSubCat.name,
          href: `/c/${mainCat.slug}/${subSubCat.slug}`,
        }))
      );

           console.log('SUBSUBLINKS', subSubLinksForMain);
      console.log('SUBLINKS', subLinksForMain);
      return {
        title: mainCat.name,
        href: `/c/${mainCat.slug}`,
        subLinks: subLinksForMain.length > 0 ? subLinksForMain : undefined,
        subSubLinks:
          subSubLinksForMain.length > 0 ? subSubLinksForMain : undefined,
      };
    });
  } catch (error) {
    console.error('Fel vid hämtning av navigation:', error);
  }

  const navLinks = [...dynamicLinks, ...staticLinks];

  // console.log('SLUT', navLinks);
  return navLinks;
}
