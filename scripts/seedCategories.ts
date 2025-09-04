import {db} from '@/drizzle/index';
import {categories, categoryTypeEnum} from '@/drizzle/db/schema';
import * as dotenv from 'dotenv';
import {InferInsertModel} from 'drizzle-orm';

dotenv.config({path: '.env'});

type CategoryBlueprint = {
  title: string;
  slug: string;
  type: (typeof categoryTypeEnum.enumValues)[number];
  children?: CategoryBlueprint[];
};

const categoryTreeDefinition: CategoryBlueprint[] = [
  {
    title: 'Dam',
    slug: 'dam',
    type: 'MAIN-CATEGORY',
    children: [
      {title: 'Nyheter', slug: 'nyheter', type: 'COLLECTION'},
      {
        title: 'Plagg',
        slug: 'plagg',
        type: 'CONTAINER',
        children: [
          {title: 'Klänningar', slug: 'klanningar', type: 'SUB-CATEGORY'},
          {title: 'Toppar', slug: 'toppar', type: 'SUB-CATEGORY'},
          {title: 'Byxor', slug: 'byxor', type: 'SUB-CATEGORY'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        type: 'CONTAINER',
        children: [{title: 'Jackor', slug: 'jackor', type: 'SUB-CATEGORY'}],
      },
    ],
  },
  {
    title: 'Herr',
    slug: 'herr',
    type: 'MAIN-CATEGORY',
    children: [
      {title: 'Nyheter', slug: 'nyheter', type: 'COLLECTION'},
      {
        title: 'Plagg',
        slug: 'plagg',
        type: 'CONTAINER',
        children: [
          {title: 'T-shirts', slug: 't-shirts', type: 'SUB-CATEGORY'},
          {title: 'Overshirt', slug: 'overshirt', type: 'SUB-CATEGORY'},
          {title: 'Byxor', slug: 'byxor', type: 'SUB-CATEGORY'},
          // Nivå 3
          // {
          //   title: 'Byxor',
          //   slug: 'byxor',
          //   type: 'CONTAINER',
          //   children: [
          //     {title: 'Jeans', slug: 'jeans', type: 'SUB-CATEGORY'},
          //     // Nivå 4
          //     {
          //       title: 'Chinos',
          //       slug: 'chinos',
          //       type: 'CONTAINER',
          //       children: [
          //         {title: 'Slim Fit', slug: 'slim-fit', type: 'SUB-CATEGORY'},
          //         // Nivå 5
          //         {
          //           title: 'Regular Fit',
          //           slug: 'regular-fit',
          //           type: 'SUB-CATEGORY',
          //         },
          //       ],
          //     },
          //   ],
          // },
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        type: 'CONTAINER',
        children: [{title: 'Jackor', slug: 'jackor', type: 'SUB-CATEGORY'}],
      },
    ],
  },
];

type InsertCategory = InferInsertModel<typeof categories>;

const byggKategoriMedDessBarn = async (
  ritningForKategorin: CategoryBlueprint,
  parentId: number | null,
  displayOrder: number
) => {
  const kategoriForDb: InsertCategory = {
    name: ritningForKategorin.title,
    slug: ritningForKategorin.slug,
    parentId: parentId,
    displayOrder: displayOrder,
    isActive: true,
    type: ritningForKategorin.type, // Läser den nya typen ('MAIN', 'SUB', etc)
  };

  console.log(
    `📦 Bygger: "${kategoriForDb.name}" (Typ: ${kategoriForDb.type}) med parentId: ${parentId}`
  );

  const [nyKategori] = await db
    .insert(categories)
    .values(kategoriForDb)
    .returning({id: categories.id});

  const nyKategoriId = nyKategori.id;

  console.log(
    `✅ Färdigbyggd: "${kategoriForDb.name}", fick ID: ${nyKategoriId}`
  );

  const barnRitningar = ritningForKategorin.children;
  if (barnRitningar && barnRitningar.length > 0) {
    console.log(
      `  -> Hittade ${barnRitningar.length} barn till "${kategoriForDb.name}". Startar bygge...`
    );
    for (const [index, barnRitning] of barnRitningar.entries()) {
      await byggKategoriMedDessBarn(barnRitning, nyKategoriId, index);
    }
  }
};

const seed = async () => {
  console.log('🏁 Startar databas-seeding...');
  try {
    console.log('🗑️ Raderar befintliga kategorier...');
    await db.delete(categories);
    console.log('✅ Kategorier raderade.');

    console.log('🌳 Startar bygget av hela trädet...');
    for (const [
      index,
      huvudkategoriRitning,
    ] of categoryTreeDefinition.entries()) {
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
