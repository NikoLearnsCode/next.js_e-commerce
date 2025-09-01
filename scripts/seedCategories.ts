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

// STEG 1: Uppdatera din datastruktur till att inkludera `type`.
// Jag har döpt om den för tydlighetens skull.
const categoryTreeDefinition: CategoryBlueprint[] = [
  {
    title: 'Dam',
    slug: 'dam',
    type: 'STANDARD', // En klickbar huvudsida
    children: [
      {title: 'Nyheter', slug: 'nyheter', type: 'COLLECTION'},
      {
        title: 'Plagg',
        slug: 'plagg',
        type: 'CONTAINER', // En strukturell mapp, syns ej i URL
        children: [
          {title: 'Klänningar', slug: 'klanningar', type: 'STANDARD'},
          {title: 'Toppar', slug: 'toppar', type: 'STANDARD'},
          {title: 'Byxor', slug: 'byxor', type: 'STANDARD'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        type: 'STANDARD', // Klickbar kategori
        children: [{title: 'Jackor', slug: 'jackor', type: 'STANDARD'}],
      },
    ],
  },
  {
    title: 'Herr',
    slug: 'herr',
    type: 'STANDARD',
    children: [
      {title: 'Nyheter', slug: 'nyheter', type: 'COLLECTION'},
      {
        title: 'Plagg',
        slug: 'plagg',
        type: 'CONTAINER', // Osynlig i URL
        children: [
          {title: 'T-shirts', slug: 't-shirts', type: 'STANDARD'},
          {title: 'Overshirt', slug: 'overshirt', type: 'STANDARD'},
          {
            title: 'Byxor',
            slug: 'byxor',
            type: 'CONTAINER', // Klickbar mellannivå
            children: [
              {title: 'Jeans', slug: 'jeans', type: 'STANDARD'},
              {
                title: 'Chinos',
                slug: 'chinos',
                type: 'CONTAINER',
                children: [
                  {title: 'Slim Fit', slug: 'slim-fit', type: 'STANDARD'},
                  {title: 'Regular Fit', slug: 'regular-fit', type: 'STANDARD'},
                ],
              },
            ],
          },
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        type: 'STANDARD',
        children: [{title: 'Jackor', slug: 'jackor', type: 'STANDARD'}],
      },
    ],
  },
];

// Definiera typen för en kategori som ska infogas, baserat på ditt schema
type InsertCategory = InferInsertModel<typeof categories>;

// Funktionens logik är nästan identisk, vi lägger bara till 'type'
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
    // STEG 2: Lägg till `type` från vår ritning
    type: ritningForKategorin.type,
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

// Huvudfunktionen är densamma, den använder bara den nya datastrukturen
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
