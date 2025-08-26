import {db} from '@/drizzle/index'; // Se till att sökvägen till din db-klient är korrekt
import {mainCategories, subCategories} from '@/drizzle/db/schema'; // Importera de nya tabellerna
import * as dotenv from 'dotenv';
import {InferInsertModel} from 'drizzle-orm';

dotenv.config({path: '.env'});

type InsertMainCategory = InferInsertModel<typeof mainCategories>;
type InsertSubCategory = InferInsertModel<typeof subCategories>;

const navLinks = [
  {
    title: 'Dam',
    href: '/c/dam',
    slug: 'dam',
    subLinks: [
      {title: 'KLÄNNINGAR', slug: 'klanningar'},
      {title: 'BYXOR', slug: 'byxor'},
      {title: 'JACKOR', slug: 'jackor'},
      {title: 'TOPPAR', slug: 'toppar'},
      {title: 'ERBJUDANDEN', slug: 'erbjudanden-dam'},
    ],
  },
  {
    title: 'Herr',
    href: '/c/herr',
    slug: 'herr',
    subLinks: [
      {title: 'OVERSHIRT', slug: 'overshirt'},
      {title: 'BYXOR', slug: 'byxor'},
      {title: 'JACKOR', slug: 'jackor'},
      {title: 'T-SHIRTS', slug: 't-shirts'},
      {title: 'ERBJUDANDEN', slug: 'erbjudanden-herr'},
    ],
  },
];

const seed = async () => {
  console.log('🏁 Startar databas-seeding...');

  try {
    console.log('🗑️ Raderar befintliga kategorier...');
    await db.delete(mainCategories); // Raderar huvudkategorier, underkategorier raderas automatiskt via onDelete: 'cascade'
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
      await db.insert(subCategories).values(subLinksToInsert); // Infogar i subCategories-tabellen
      console.log('✅ Underkategorier infogade framgångsrikt.');
    } else {
      console.log('ℹ️ Inga underkategorier att infoga.');
    }

    console.log('🚀 Seeding komplett!');
  } catch (error) {
    console.error('❌ Ett fel uppstod under seeding:', error);
    process.exit(1);
  } finally {
    await db.$client.end();
    console.log('🚀 Databasanslutning stängd.');
    process.exit(0);
  }
};

seed();
