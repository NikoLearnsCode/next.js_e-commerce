import {db} from '@/drizzle/index';
import {categories, categoryTypeEnum} from '@/drizzle/db/schema';
import * as dotenv from 'dotenv';
import {InferInsertModel} from 'drizzle-orm';

dotenv.config({path: '.env'});

type CategoryBlueprint = {
  title: string;
  slug: string;
  type: (typeof categoryTypeEnum.enumValues)[number];
  desktopImage?: string;
  mobileImage?: string;
  children?: CategoryBlueprint[];
};

const categoryTreeDefinition: CategoryBlueprint[] = [
  {
    title: 'Dam',
    slug: 'dam',
    type: 'MAIN-CATEGORY',
    desktopImage: '/images/dam.desktop.avif',
    mobileImage: '/images/dam.mobile.avif',
    children: [
      {title: 'Nyheter', slug: 'nyheter', type: 'COLLECTION'},
      {
        title: 'Kläder',
        slug: 'klader',
        type: 'CONTAINER',
        children: [
          {title: 'Klänningar', slug: 'klanningar', type: 'SUB-CATEGORY'},
          {title: 'Toppar', slug: 'toppar', type: 'SUB-CATEGORY'},
          {title: 'Byxor', slug: 'byxor', type: 'SUB-CATEGORY'},
        ],
      },
      {
        title: 'Ytterkläder',
        slug: 'ytterklader',
        type: 'CONTAINER',
        children: [{title: 'Jackor', slug: 'jackor', type: 'SUB-CATEGORY'}],
      },
    ],
  },
  {
    title: 'Herr',
    slug: 'herr',
    type: 'MAIN-CATEGORY',
    desktopImage: '/images/herr.desktop.avif',
    mobileImage: '/images/herr.mobile.avif',
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
          /*      // Nivå 3
          {
            title: 'Byxorr',
            slug: 'byxorr',
            type: 'CONTAINER',
            children: [
              {title: 'Jeans', slug: 'jeans', type: 'SUB-CATEGORY'},
              // Nivå 4
              {
                title: 'Chinos',
                slug: 'chinos',
                type: 'CONTAINER',
                children: [
                  {title: 'Slim', slug: 'slim', type: 'SUB-CATEGORY'},
                  // Nivå 5
                  {
                    title: 'Regular',
                    slug: 'regular',
                    type: 'SUB-CATEGORY',
                  },
                ],
              },
            ],
          }, */
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
    title: 'Home',
    slug: 'home',
    type: 'MAIN-CATEGORY',
    desktopImage: '/images/hem.desktop.avif',
    mobileImage: '/images/hem.mobile.webp',
    children: [
      {title: 'Heminredning', slug: 'himinredning', type: 'SUB-CATEGORY'},
      {title: 'Bestick', slug: 'bestick', type: 'SUB-CATEGORY'},
      {title: 'Tavlor', slug: 'tavlor', type: 'SUB-CATEGORY'},
    ],
  },
  /* {
    title: 'Random',
    slug: 'random',
    type: 'MAIN-CATEGORY',
    desktopImage: '/images/dam.desktop.avif',
    mobileImage: '/images/dam.mobile.avif',
    children: [
      {title: 'Random1', slug: 'random1', type: 'COLLECTION'},
      {
        title: 'Random2',
        slug: 'random2',
        type: 'CONTAINER',
        children: [
          {title: 'Random3', slug: 'random3', type: 'SUB-CATEGORY'},
          {title: 'Random4', slug: 'random4', type: 'SUB-CATEGORY'},
          {title: 'Random5', slug: 'random5', type: 'SUB-CATEGORY'},
          // Nivå 3
          {
            title: 'Random6',
            slug: 'random6',
            type: 'CONTAINER',
            children: [
              {title: 'Random7', slug: 'random7', type: 'SUB-CATEGORY'},
              // Nivå 4
              {
                title: 'Random8',
                slug: 'random8',
                type: 'CONTAINER',
                children: [
                  {title: 'Random9', slug: 'random9', type: 'SUB-CATEGORY'},
                  // Nivå 5
                  {
                    title: 'Random10',
                    slug: 'random10',
                    type: 'SUB-CATEGORY',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Random11',
        slug: 'random11',
        type: 'CONTAINER',
        children: [{title: 'Random12', slug: 'random12', type: 'SUB-CATEGORY'}],
      },
    ],
  }, */
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
    type: ritningForKategorin.type,
    desktopImage: ritningForKategorin.desktopImage || null,
    mobileImage: ritningForKategorin.mobileImage || null,
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
