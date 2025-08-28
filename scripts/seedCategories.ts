import {db} from '@/drizzle/index'; 
import {
  mainCategories,
  subCategories,
  subSubCategories,
} from '@/drizzle/db/schema'; 
import * as dotenv from 'dotenv';
import {InferInsertModel} from 'drizzle-orm';

dotenv.config({path: '.env'});

type InsertMainCategory = InferInsertModel<typeof mainCategories>;
type InsertSubCategory = InferInsertModel<typeof subCategories>;
type InsertSubSubCategory = InferInsertModel<typeof subSubCategories>;


const navLinks = [
  {
    title: 'Dam',
    href: '/c/dam',
    slug: 'dam',
    subLinks: [
      {
        title: 'Nyheter',
        slug: 'nyheter',
        subSubLinks: [],
      },
      {
        title: 'Plagg',
        slug: '',
        subSubLinks: [
          {title: 'Klänningar', slug: 'klanningar'},
          {title: 'Toppar', slug: 'toppar'},
          {title: 'Byxor', slug: 'byxor'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: '',
        subSubLinks: [{title: 'Jackor', slug: 'jackor'}],
      },
    ],
  },
  {
    title: 'Herr',
    href: '/c/herr',
    slug: 'herr',
    subLinks: [ 
      {
        title: 'Nyheter',
        slug: 'nyheter',
        subSubLinks: [],
      },
      {
        title: 'Plagg',
        slug: '',
        subSubLinks: [
          {title: 'T-shirts', slug: 't-shirts'},
          {title: 'Overshirt', slug: 'overshirt'},
          {title: 'Byxor', slug: 'byxor'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: '',
        subSubLinks: [{title: 'Jackor', slug: 'jackor'}],
      },
      
    ],
  },
];


const seed = async () => {
  console.log('🏁 Startar databas-seeding...');

  try {
    console.log('🗑️ Raderar befintliga kategorier...');
    await db.delete(subSubCategories); // Raderar först sub-sub-kategorier
    await db.delete(subCategories); // Raderar sedan sub-kategorier
    await db.delete(mainCategories); // Raderar huvudkategorier sist
    console.log('✅ Kategorier raderade.');

    const mainLinksToInsert: InsertMainCategory[] = navLinks.map(
      (link, index) => ({
        name: link.title,
        slug: link.slug,
        displayOrder: index,
        isActive: true,
      })
    );

    console.log(`📦 Infogar ${mainLinksToInsert.length} huvudkategorier...`);
    const insertedMainLinks = await db
      .insert(mainCategories)
      .values(mainLinksToInsert)
      .returning({
        id: mainCategories.id,
        name: mainCategories.name,
      });
    console.log('✅ Huvudkategorier infogade.');

    const mainLinkIds = new Map(
      insertedMainLinks.map((link) => [link.name, link.id])
    );

    const subLinksToInsert: InsertSubCategory[] = [];
    navLinks.forEach((link) => {
      const parentId = mainLinkIds.get(link.title);

      if (parentId) {
        link.subLinks.forEach((subLink, index) => {
          subLinksToInsert.push({
            name: subLink.title,
            slug: subLink.slug,
            mainCategoryId: parentId, // Använder den nya foreign key-kolumnen
            displayOrder: index,
            isActive: true,
          });
        });
      }
    });

    if (subLinksToInsert.length > 0) {
      console.log(`📦 Infogar ${subLinksToInsert.length} underkategorier...`);
      const insertedSubLinks = await db
        .insert(subCategories)
        .values(subLinksToInsert)
        .returning({
          id: subCategories.id,
          name: subCategories.name,
          slug: subCategories.slug,
          mainCategoryId: subCategories.mainCategoryId,
        });
      console.log('✅ Underkategorier infogade framgångsrikt.');

      // Skapa en map för att hitta subCategory ID:n
      // Använd mainCategoryId i nyckeln för att undvika kollisioner mellan Dam och Herr
      const subLinkIds = new Map(
        insertedSubLinks.map((link) => [
          `${link.name}-${link.slug}-${link.mainCategoryId}`,
          link.id,
        ])
      );

      // Förbered subSubCategories för infogning
      const subSubLinksToInsert: InsertSubSubCategory[] = [];

      // Skapa en map för att hitta mainCategoryId baserat på mainLink title
      const mainCategoryMap = new Map(
        insertedMainLinks.map((link) => [link.name, link.id])
      );

      navLinks.forEach((mainLink) => {
        const mainCategoryId = mainCategoryMap.get(mainLink.title);

        mainLink.subLinks.forEach((subLink) => {
          const parentId = subLinkIds.get(
            `${subLink.title}-${subLink.slug}-${mainCategoryId}`
          );

          if (parentId && subLink.subSubLinks) {
            subLink.subSubLinks.forEach((subSubLink, index) => {
              subSubLinksToInsert.push({
                name: subSubLink.title,
                slug: subSubLink.slug,
                subCategoryId: parentId,
                displayOrder: index,
                isActive: true,
              });
            });
          }
        });
      });

      if (subSubLinksToInsert.length > 0) {
        console.log(
          `📦 Infogar ${subSubLinksToInsert.length} under-underkategorier...`
        );
        await db.insert(subSubCategories).values(subSubLinksToInsert);
        console.log('✅ Under-underkategorier infogade framgångsrikt.');
      } else {
        console.log('ℹ️ Inga under-underkategorier att infoga.');
      }
    } else {
      console.log('ℹ️ Inga underkategorier att infoga.');
    }

    console.log('🚀 Seeding komplett!');
  } catch (error) {
    console.error('❌ Ett fel uppstod under seeding:', error);
    process.exit(1);
  } finally {
 
    console.log('✅ Databas-seeding avslutad.');
    process.exit(0);
  }
};

seed();
