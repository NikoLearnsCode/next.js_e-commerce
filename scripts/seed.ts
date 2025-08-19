// Ladda miljövariabler
import 'dotenv/config';

import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from '../drizzle/src/db/schema';

const {productsTable} = schema;

// Skapa pool för PostgreSQL med samma inställningar som drizzle.config.ts
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'niklas',
  database: 'db',
  ssl: false,
});

// Skapa Drizzle-instans
const db = drizzle(pool, {schema});

const baseProducts = [
  // HERRKLÄDER
  // Byxor
  {
    name: 'Klassiska Chinos',
    description:
      'Stilrena chinos i stretchigt material för optimal komfort. Passar både till vardags och finare tillfällen.',
    price: 899,
    brand: 'Herjano',
    gender: 'herr',
    color: 'black',
    slug: 'klassiska-chinos',
    category: 'byxor',
    specs: [
      'Normal passform',
      'Material: 100% bomull',
      'Maskintvätt högst 30°C',
      'Tål strykning',
    ],
    images: [
      '/images/herr/byxor/byxor-herr1.webp',
      '/images/herr/byxor/byxor-herr2.webp',
      '/images/herr/byxor/byxor-herr3.webp',
      '/images/herr/byxor/byxor-herr1.webp',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  // Jackor
  {
    name: 'Elegant Rock',
    description:
      'Stilsäker rock i klassisk passform med lätt urtvättad look för en vintage känsla.',
    price: 2199,
    brand: 'Manjano',
    gender: 'herr',
    color: 'navy',
    slug: 'elegant-rock',
    category: 'jackor',
    specs: [
      'Normal passform',
      'Material: 80% bomull, 19% polyester, 1% elastan',
      'Maskintvätt högst 30°C',
      'Tål ej strykning',
    ],
    images: [
      '/images/herr/jackor/jacka-herr1.avif',
      '/images/herr/jackor/jacka-herr2.avif',
      '/images/herr/jackor/jacka-herr3.avif',
      '/images/herr/jackor/jacka-herr1.avif',
    ],
    sizes: ['44', '46', '48', '50', '52'],
  },
  // Overshirt
  {
    name: 'Linen Overshirt',
    description:
      'Mjuk och varm linenskjorta i robust kvalitet. Perfekt för varmare dagar.',
    price: 1799,
    brand: 'Trekano',
    gender: 'herr',
    color: 'brown',
    slug: 'linen-overshirt',
    category: 'overshirt',
    specs: [
      'Normal passform',
      'Material: 100% linne',
      'Maskintvätt högst 30°C',
      'Tål ej strykning',
    ],
    images: [
      '/images/herr/overshirt/overshirt1.jpg',
      '/images/herr/overshirt/overshirt2.avif',
      '/images/herr/overshirt/overshirt3.avif',
      '/images/herr/overshirt/overshirt1.jpg',
    ],
    sizes: ['44', '46', '48', '50', '52', '54'],
  },
  // T-shirt
  {
    name: 'Essential T-shirt',
    description:
      'Minimalistisk t-shirt i 100% ekologisk bomull. En garderobsbasic som passar till allt.',
    price: 599,
    brand: 'Waikiki',
    gender: 'herr',
    color: 'navy',
    slug: 'essential-tshirt',
    category: 't-shirts',
    specs: [
      'Normal passform',
      'Material: 100% ekologisk bomull',
      'Maskintvätt högst 40°C',
      'Använd ej blekmedel',
      'Tål strykning',
      'Tål ej kemtvätt',
    ],
    images: [
      '/images/herr/tshirt/tshirt-herr3.webp',
      '/images/herr/tshirt/tshirt-herr2.webp',
      '/images/herr/tshirt/tshirt-herr3.webp',
      '/images/herr/tshirt/tshirt-herr2.webp',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  },
  // DAMKLÄDER
  // Byxor
  {
    name: 'High Waist Pants',
    description:
      'Högmidjade byxor med perfekt passform och stretch för maximal komfort. Smickrande siluett för alla kroppstyper.',
    price: 1999,
    brand: 'Saiki',
    gender: 'dam',
    color: 'navy',
    slug: 'high-waist-pants',
    category: 'byxor',
    specs: [
      'Normal passform',
      'Rakt ben',
      'Hög midja',
      'Material: 64% polyester, 31% viskos, 5% elastan',
      'Maskintvätt högst 30°C',
      'Tål strykning',
    ],
    images: [
      '/images/dam/byxor/byxor-dam1.webp',
      '/images/dam/byxor/byxor-dam3.webp',
      '/images/dam/byxor/byxor-dam2.webp',
      '/images/dam/byxor/byxor-dam1.webp',
    ],
    sizes: ['32', '34', '36', '38', '40', '42', '44'],
  },
  // Jackor
  {
    name: 'Oversized Rock',
    description:
      'Trendig oversized rock i klassisk design. Perfekt för både kontoret och festligare tillfällen.',
    price: 2499,
    brand: 'Frano',
    gender: 'dam',
    color: 'navy',
    slug: 'oversized-rock',
    category: 'jackor',
    specs: [
      'Oversized passform',
      'Material: 100% polyester',
      'Tål ej maskintvätt',
      'Tål ej strykning',
      'Kemtvätt rekommenderas',
    ],
    images: [
      '/images/dam/jackor/jacka-dam1.webp',
      '/images/dam/jackor/jacka-dam2.webp',
      '/images/dam/jackor/jacka-dam3.webp',
      '/images/dam/jackor/jacka-dam1.webp',
    ],
    sizes: ['32', '34', '36', '38', '40', '42', '44'],
  },
  // Klänningar
  {
    name: 'Demin Playsuit',
    description:
      'Den här denim playsuiten är ett snyggt och bekvämt alternativ för alla tillfällen. Den har en klassisk krage, korta ärmar och en dragkedja framtill.',
    price: 1899,
    brand: 'Hermano',
    gender: 'dam',
    color: 'blue',
    slug: 'demin-playsuit',
    category: 'klanningar',
    specs: [
      'Normal passform',
      'Material: 80% bci, 20% återvunnen bomull',
      'Maskintvätt högst 40°C',
      'Tål strykning',
    ],
    images: [
      '/images/dam/klänningar/klänning-dam2.webp',
      '/images/dam/klänningar/klänning-dam1.webp',
      '/images/dam/klänningar/klänning-dam2.webp',
      '/images/dam/klänningar/klänning-dam1.webp',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
  // Toppar
  {
    name: 'Silkesblus',
    description:
      'Lyxig blus i silkesliknande material med elegant fall. Tidlös design som passar alla garderober.',
    price: 899,
    brand: 'Hermana',
    gender: 'dam',
    color: 'midnight blue',
    slug: 'silkesblus',
    category: 'Toppar',
    specs: [
      'Normal passform',
      'Material: 100% bomull',
      'Maskintvätt högst 30°C',
      'Tål strykning',
    ],
    images: [
      '/images/dam/toppar/topp1.webp',
      '/images/dam/toppar/topp2.webp',
      '/images/dam/toppar/topp1.webp',
      '/images/dam/toppar/topp2.webp',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
  },
];

// Funktion för att hämta befintliga produkter
async function getExistingProductsInfo() {
  try {
    // Hämta alla befintliga slug och name värden
    const data = await db
      .select({
        slug: productsTable.slug,
        name: productsTable.name,
      })
      .from(productsTable)
      .orderBy(productsTable.created_at);

    // Extrahera unika slugs och names
    const slugs = data.map((product) => product.slug);

    // Hitta högsta index från befintliga slug-mönster (slug-XX)
    let highestIndex = 0;
    slugs.forEach((slug) => {
      const match = slug.match(/-(\d+)$/);
      if (match && match[1]) {
        const index = parseInt(match[1]);
        if (index > highestIndex) {
          highestIndex = index;
        }
      }
    });

    return {slugs, highestIndex};
  } catch (error) {
    console.error('Fel vid hämtning av befintliga produkter:', error);
    return {slugs: [], highestIndex: 0};
  }
}

// Funktion som skapar en ny produkt baserat på originalet med unika värden
const createDuplicateWithUniqueIds = (
  product: any,
  index: number,
  existingSlugs: string[]
) => {
  const colorVariants = [
    'black',
    'white',
    'navy',
    'beige',
    'blue',
    'green',
    'red',
    'gray',
    'brown',
    'cream',
  ];

  // Välj en slumpmässig färg som är annorlunda från originalets
  let color = product.color;
  while (color === product.color) {
    color = colorVariants[Math.floor(Math.random() * colorVariants.length)];
  }

  // Skapa en unik slug
  let newSlug = `${product.slug}-${index}`;
  let suffix = index;

  // Se till att slug är unik
  while (existingSlugs.includes(newSlug)) {
    suffix++;
    newSlug = `${product.slug}-${suffix}`;
  }
  existingSlugs.push(newSlug); // Lägg till så vi inte får krock

  return {
    ...product,
    name: `${product.name} #${index}`,
    slug: newSlug,
    color: color, // Ändra färg för variation
    price: Math.round(product.price * (0.9 + Math.random() * 0.2)), // Liten variation i pris
  };
};

// Huvudfunktion för att generera och spara produkter
async function seedProducts(count: number = 50) {
  console.log(`Börjar seeda produkter...`);

  // Hämta information om befintliga produkter
  const {slugs: existingSlugs, highestIndex} = await getExistingProductsInfo();

  const startIndex = highestIndex + 1;
  console.log(
    `Hittade ${existingSlugs.length} befintliga produkter. Startar från index ${startIndex}`
  );

  // Filtrera bort basprodukter som redan finns baserat på slug
  const basesToAdd = baseProducts.filter(
    (baseProduct) => !existingSlugs.includes(baseProduct.slug)
  );

  console.log(
    `${basesToAdd.length} av ${baseProducts.length} basprodukter behöver läggas till`
  );

  const productRows = [];

  // Lägg till basprodukter som inte redan finns
  if (basesToAdd.length > 0) {
    productRows.push(...basesToAdd);
  }

  // Räkna ut hur många fler produkter vi ska skapa
  const remainingToCreate = count - basesToAdd.length;

  if (remainingToCreate > 0) {
    console.log(`Skapar ${remainingToCreate} ytterligare produktvarianter`);
    // Kopiera listan av slugs så vi kan uppdatera allteftersom
    const updatedSlugs = [...existingSlugs, ...basesToAdd.map((p) => p.slug)];

    // Generera ytterligare produkter baserat på originalen
    for (let i = 0; i < remainingToCreate; i++) {
      // Byt ut slumpen mot round-robin för jämnare fördelning:
      const baseProd = baseProducts[i % baseProducts.length];

      // Skapa ny variant med unika identifierare
      const duplicateProduct = createDuplicateWithUniqueIds(
        baseProd,
        startIndex + i,
        updatedSlugs
      );
      productRows.push(duplicateProduct);
    }
  }

  if (productRows.length === 0) {
    console.log('Inga nya produkter att lägga till.');
    return;
  }

  // Spara produkter i databasen
  try {
    const data = await db.insert(productsTable).values(productRows).returning();
    console.log(`Framgångsrikt lagt till ${data.length} produkter!`);
  } catch (error) {
    console.error('Fel vid insättning av produkter:', error);
    return;
  }
}

(async () => {
  try {
    const numberOfProducts = process.argv[2] ? parseInt(process.argv[2]) : 16;
    await seedProducts(numberOfProducts);
    console.log('✅ Seeding slutfört!');
  } catch (error) {
    console.error('❌ Fel vid seeding:', error);
  } finally {
    // Stäng databasanslutningen
    await pool.end();
    process.exit(0);
  }
})();
