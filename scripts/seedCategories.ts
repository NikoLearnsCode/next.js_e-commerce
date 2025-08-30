import {db} from '@/drizzle/index';
import {categories} from '@/drizzle/db/schema';
import * as dotenv from 'dotenv';
import {InferInsertModel} from 'drizzle-orm';

dotenv.config({path: '.env'});

type InsertCategory = InferInsertModel<typeof categories>;

const navLinks = [
  {
    title: 'Dam',
    href: '/c/dam',
    slug: 'dam',
    children: [
      {title: 'Nyheter', slug: 'nyheter', children: []},
      {
        title: 'Plagg',
        slug: 'plagg',
        children: [
          {title: 'Klänningar', slug: 'klanningar'},
          {title: 'Toppar', slug: 'toppar'},
          {title: 'Byxor', slug: 'byxor'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        children: [{title: 'Jackor', slug: 'jackor'}],
      },
    ],
  },
  {
    title: 'Herr',
    href: '/c/herr',
    slug: 'herr',
    children: [
      {title: 'Nyheter', slug: 'nyheter', children: []},
      {
        // 1. Första
        title: 'Plagg',
        slug: 'plagg',
        // 2. Andra
        children: [
          {title: 'T-shirts', slug: 't-shirts'},
          {title: 'Overshirt', slug: 'overshirt'},
          {
            title: 'Byxor',
            slug: 'byxor',
            /*     // 3. Tredje
            children: [
              {title: 'Jeans', slug: 'jeans'},
              {
                title: 'Chinos',
                slug: 'chinos',
                // 4. Fjärde
                children: [
                  {title: 'Jeans', slug: 'jeans'},
                  {
                    title: 'Chinos',
                    slug: 'chinos',
                    // 5. Femte
                    children: [
                      {title: 'Jeans', slug: 'jeans'},
                      {title: 'Chinos', slug: 'chinos'},
                    ],
                  },
                ],
              },
            ], */
          },
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        children: [{title: 'Jackor', slug: 'jackor'}],
      },
    ],
  },
];

const byggKategoriMedDessBarn = async (
  ritningForKategorin: any,
  parentId: number | null,
  displayOrder: number
) => {
  // 1. Förbered kategori för databasen
  const kategoriForDb: InsertCategory = {
    name: ritningForKategorin.title,
    slug: ritningForKategorin.slug,
    parentId: parentId,
    displayOrder: displayOrder,
    isActive: true,
  };

  console.log(`📦 Bygger: "${kategoriForDb.name}" med parentId: ${parentId}`);

  // 2. Spara i databasen och hämta det nya ID:t
  const [nyKategori] = await db
    .insert(categories)
    .values(kategoriForDb)
    .returning({id: categories.id});

  const nyKategoriId = nyKategori.id;

  console.log(
    `✅ Färdigbyggd: "${kategoriForDb.name}", fick ID: ${nyKategoriId}`
  );

  // 3. KONTROLLERA OM DET FINNS BARN (ALLTID MED NYCKELN 'children')
  const barnRitningar = ritningForKategorin.children;

  if (barnRitningar && barnRitningar.length > 0) {
    console.log(
      `  -> Hittade ${barnRitningar.length} barn till "${kategoriForDb.name}". Startar bygge för dem...`
    );

    // 4. Loopa igenom barnen och anropa SAMMA funktion för varje barn.
    // Detta är kärnan i rekursionen. Koden är nu mycket enklare.
    for (const [index, barnRitning] of barnRitningar.entries()) {
      await byggKategoriMedDessBarn(
        barnRitning,
        nyKategoriId, // Skicka med nuvarande kategoris ID som förälder
        index
      );
    }
  }

  console.log(`🏁 Körningen för "${kategoriForDb.name}" är klar.`);
};

const seed = async () => {
  console.log('🏁 Startar databas-seeding...');
  try {
    console.log('🗑️ Raderar befintliga kategorier...');
    await db.delete(categories);
    console.log('✅ Kategorier raderade.');

    console.log('🌳 Startar bygget av hela trädet...');
    for (const [index, huvudkategoriRitning] of navLinks.entries()) {
      await byggKategoriMedDessBarn(huvudkategoriRitning, null, index);
    }
    console.log('🚀 Hela bygget är komplett!');
  } catch (error) {
    console.error('❌ Ett fel uppstod under bygget:', error);
    process.exit(1);
  } finally {
    console.log('✅ Byggprocessen avslutad.');
    process.exit(0);
  }
};

seed();
