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
    subLinks: [
      {title: 'Nyheter', slug: 'nyheter', subSubLinks: []},
      {
        title: 'Plagg',
        slug: 'plagg',
        subSubLinks: [
          {title: 'Klänningar', slug: 'klanningar'},
          {title: 'Toppar', slug: 'toppar'},
          {title: 'Byxor', slug: 'byxor'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        subSubLinks: [{title: 'Jackor', slug: 'jackor'}],
      },
    ],
  },
  {
    title: 'Herr',
    href: '/c/herr',
    slug: 'herr',
    subLinks: [
      {title: 'Nyheter', slug: 'nyheter', subSubLinks: []},
      {
        title: 'Plagg',
        slug: 'plagg',
        subSubLinks: [
          {title: 'T-shirts', slug: 't-shirts'},
          {title: 'Overshirt', slug: 'overshirt'},
          {title: 'Byxor', slug: 'byxor'},
        ],
      },
      {
        title: 'Ytterplagg',
        slug: 'ytterplagg',
        subSubLinks: [{title: 'Jackor', slug: 'jackor'}],
      },
    ],
  },
];

const seed = async () => {
  console.log('🏁 Startar databas-seeding...');

  try {
    console.log('🗑️ Raderar befintliga kategorier...');
    await db.delete(categories);
    console.log('✅ Kategorier raderade.');

    // ===================================================================================
    // DEFINITION: Detta är vår mall, vår uppsättning instruktioner.
    // Denna kod körs inte än, vi bara definierar VAD som ska hända.
    // ===================================================================================
    const byggKategoriMedDessBarn = async (
      ritningForKategorinSomSkaByggasNu: any,
      idNummerForForaldraKategorin: number | null,
      platsIOrdningenBlandSyskonen: number
    ) => {
      // --- EN NY KÖRNING AV FUNKTIONEN STARTAR HÄR ---
      // (Antingen för att vi anropade den från huvudloopen, eller från en annan körning av sig själv)

      // 1. Förbereder bygget baserat på ritningen och förälder-ID:t vi fick.
      const fardigByggsatsForDatabasen: InsertCategory = {
        name: ritningForKategorinSomSkaByggasNu.title,
        slug: ritningForKategorinSomSkaByggasNu.slug,
        parentId: idNummerForForaldraKategorin,
        displayOrder: platsIOrdningenBlandSyskonen,
        isActive: true,
      };

      console.log(
        `📦 Bygger nu: "${fardigByggsatsForDatabasen.name}" med parentId: ${idNummerForForaldraKategorin}`
      );

      // 2. Skickar bygget till databasen och väntar...
      const [svarFranDatabasenMedDetNyaIdt] = await db
        .insert(categories)
        .values(fardigByggsatsForDatabasen)
        .returning({id: categories.id});

      // 3. Bygget är klart! Vi fick tillbaka ett kvitto med det nya ID:t.
      // VIKTIGT: Vi sparar detta ID i en minneslapp. Denna minneslapp kommer nu
      // att användas som FÖRÄLDER-ID för alla barn vi ska bygga härnäst.
      const idForKategorinViPrecisByggde = svarFranDatabasenMedDetNyaIdt.id;

      console.log(
        `✅ Färdigbyggd: "${fardigByggsatsForDatabasen.name}", fick ID: ${idForKategorinViPrecisByggde}`
      );

      // 4. Dags att kolla om kategorin vi just skapade har barn (`subLinks`).
      const ritningarForBarnen = ritningForKategorinSomSkaByggasNu.subLinks;
      if (ritningarForBarnen && ritningarForBarnen.length > 0) {
        // 5. Ja, den hade barn! Nu loopar vi igenom dem en efter en.
        for (const [index, ritningForEttBarn] of ritningarForBarnen.entries()) {
          console.log(
            `  -> Ska nu starta bygget för ett barn: "${ritningForEttBarn.title}"`
          );

          // 6. ANROPAR OSS SJÄLVA för att bygga barnet.
          // Vi skickar med barnets ritning och ID:t från vår minneslapp (`idForKategorinViPrecisByggde`).
          // Denna körning PAUSAR nu och väntar tålmodigt på att barn-körningen ska bli helt klar.
          await byggKategoriMedDessBarn(
            ritningForEttBarn,
            idForKategorinViPrecisByggde,
            index
          );
        }
      }

      // 7. Samma sak igen, kollar efter barnbarn (`subSubLinks`).
      const ritningarForBarnbarnen =
        ritningForKategorinSomSkaByggasNu.subSubLinks;
      if (ritningarForBarnbarnen && ritningarForBarnbarnen.length > 0) {
        for (const [
          index,
          ritningForEttBarnbarn,
        ] of ritningarForBarnbarnen.entries()) {
          console.log(
            `  -> Ska nu starta bygget för ett barnbarn: "${ritningForEttBarnbarn.title}"`
          );

          // 8. ANROPAR OSS SJÄLVA för att bygga barnbarnet.
          // Vi skickar med ID:t från vår minneslapp (`idForKategorinViPrecisByggde`) som förälder.
          // Denna körning PAUSAR IGEN och väntar på att barnbarns-körningen ska bli klar.
          await byggKategoriMedDessBarn(
            ritningForEttBarnbarn,
            idForKategorinViPrecisByggde,
            index
          );
        }
      }

      // 9. Alla barn och barnbarn för DENNA kategori är nu färdigbyggda.
      // Denna körning är klar och kommer att återvända till den som anropade den.
      console.log(
        `🏁 Körningen för "${fardigByggsatsForDatabasen.name}" är klar.`
      );
    }; // Slut på funktionsdefinitionen

    // ===================================================================================
    // HUVUDPROCESSEN STARTAR HÄR
    // ===================================================================================
    console.log('🌳 Startar bygget av hela trädet...');

    for (const [index, huvudkategoriRitning] of navLinks.entries()) {
      // ANROP #1: Vi startar den allra första körningen för en huvudkategori (t.ex. "Dam").
      // Vi skickar med 'null' eftersom en huvudkategori inte har någon förälder.
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
