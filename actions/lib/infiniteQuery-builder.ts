import {and, or, eq, ilike, gt, lt, desc, asc, sql} from 'drizzle-orm';
import {productsTable} from '@/drizzle/db/schema';

import {sortSizes} from '@/utils/filterSort';
import {db} from '@/drizzle/index';
import {NEW_PRODUCT_DAYS} from '@/lib/constants';

/**
 * Skapar WHERE-villkor för textsökning över produktfält
 * @param query Söksträngen från användaren
 * @returns Array med Drizzle OR-villkor för sökning i namn, kategori, kön och varumärke
 */
export function createTextSearchFilters(query: string | undefined) {
  const sanitizedQuery = query
    ? query.replace(/[^a-zA-Z0-9\såäöÅÄÖ]/g, ' ')
    : '';

  if (!sanitizedQuery.trim()) return [];

  const searchTerm = `%${sanitizedQuery.trim()}%`;
  return [
    or(
      ilike(productsTable.name, searchTerm),
      ilike(productsTable.category, searchTerm),
      ilike(productsTable.gender, searchTerm),
      ilike(productsTable.brand, searchTerm)
    ),
  ];
}

/**
 * Skapar WHERE-villkor för kategori- och könsfiltrering
 * @param category Kategorin att filtrera på (t.ex. "jackor", "byxor") eller null
 * @param gender Könet att filtrera på (t.ex. "dam", "herr") eller null
 * @returns Array med Drizzle eq-villkor för kategori och kön
 */
export function buildCategoryGenderFilters(
  category: string | null,
  gender: string | null
) {
  const conditions = [];
  if (gender) conditions.push(eq(productsTable.gender, gender));
  if (category) conditions.push(eq(productsTable.category, category));

  // Filtrera bort produkter med framtida datum
  conditions.push(sql`${productsTable.published_at} <= NOW()`);

  return conditions;
}

/**
 * Skapar WHERE-villkor för att filtrera endast nya produkter i Nyheter, vanliga categories ovan sätts till false
 * @param isNewOnly Om true, filtrerar för produkter skapade inom NEW_PRODUCT_DAYS
 * @returns Array med SQL-villkor för att hitta nyligen skapade produkter
 */
export function buildIsNewFilter(isNewOnly: boolean) {
  if (!isNewOnly) return [];

  return [
    sql`${productsTable.published_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`,
  ];
}

/**
 * Skapar WHERE-villkor för storlek- och färgfiltrering
 * @param sizes Array med storlekar att filtrera på (t.ex. ["S", "M", "L"])
 * @param color Array med färger att filtrera på (t.ex. ["svart", "vit"])
 * @returns Array med Drizzle OR-villkor för storlekar (JSONB-containment) och färger
 */
export function buildSizeColorFilters(sizes: string[], color: string[]) {
  const conditions = [];

  // Size filters using JSONB array containment
  if (sizes.length) {
    const sizeConditions = sizes.map(
      (size) => sql`${productsTable.sizes} @> ${JSON.stringify([size])}`
    );
    conditions.push(or(...sizeConditions));
  }

  // Color filters
  if (color.length) {
    const colorConditions = color.map((c) => eq(productsTable.color, c));
    conditions.push(or(...colorConditions));
  }

  return conditions;
}

/**
 * Konverterar lastValue till rätt datatyp för sorteringsfältet
 * @param sort Sorteringsfältet ("price", "name", "id")
 * @param lastValue Det sista värdet från föregående sida (för cursor pagination)
 * @returns Konverterat värde som string för Drizzle-jämförelser
 */
export function convertLastValueToFieldType(
  sort: string,
  lastValue: number | string | null
): string {
  if (lastValue === null) return '';

  return sort === 'price'
    ? typeof lastValue === 'string'
      ? lastValue
      : String(lastValue)
    : String(lastValue);
}

/**
 * Skapar enkel ID-baserad paginering
 * @param order Sorteringsordning ("asc" för stigande, "desc" för fallande)
 * @param lastId Det sista ID:t från föregående sida
 * @returns Array med Drizzle-villkor för ID-jämförelse
 */
export function buildSimpleIdPagination(order: 'asc' | 'desc', lastId: string) {
  const idComparator = order === 'asc' ? gt : lt;
  return [idComparator(productsTable.id, lastId)];
}

/**
 * Skapar cursor-baserad paginering med sorteringsfält och ID som tie-breaker
 * Använder mönster: (sortField > lastValue) OR (sortField = lastValue AND id > lastId)
 * Detta säkerställer konsistent paginering även när sorteringsvärden är identiska
 * @param sort Sorteringsfältet ("price", "name")
 * @param order Sorteringsordning ("asc" eller "desc")
 * @param lastId Det sista ID:t från föregående sida
 * @param lastValue Det sista värdet för sorteringsfältet från föregående sida
 * @returns Array med Drizzle OR-villkor för avancerad cursor pagination
 */
export function buildCursorFieldPagination(
  sort: string,
  order: 'asc' | 'desc',
  lastId: string,
  lastValue: number | string | null
) {
  const sortField = sort === 'price' ? productsTable.price : productsTable.name;
  const sortFieldComparator = order === 'asc' ? gt : lt;
  const tieBreakingComparator = order === 'asc' ? gt : lt;

  const convertedValue = convertLastValueToFieldType(sort, lastValue);

  return [
    or(
      // Primary condition: sort field is greater/less than last value
      sortFieldComparator(sortField, convertedValue),
      // Tie-breaking condition: same sort value but higher/lower ID
      and(
        eq(sortField, convertedValue),
        tieBreakingComparator(productsTable.id, lastId)
      )
    ),
  ];
}

/**
 * Huvudfunktion för att skapa WHERE-villkor för cursor-baserad paginering
 * Väljer automatiskt rätt pagineringsmetod baserat på tillgängliga parametrar
 * @param sort Sorteringsfältet ("id", "price", "name")
 * @param order Sorteringsordning ("asc" eller "desc")
 * @param lastId Det sista ID:t från föregående sida, null för första sidan
 * @param lastValue Det sista värdet för sorteringsfältet, null om inte tillgängligt
 * @returns Array med Drizzle-villkor för cursor pagination eller tom array för första sidan
 */
export function buildCursorPaginationWhereClause(
  sort: string,
  order: 'asc' | 'desc',
  lastId: string | null,
  lastValue: number | string | null
) {
  // No pagination needed
  if (lastId === null) return [];

  // Simple ID-based pagination
  if (sort === 'id') {
    return buildSimpleIdPagination(order, lastId);
  }

  // Fallback to simple ID pagination if no sort value
  if (lastValue === null) {
    return buildSimpleIdPagination(order, lastId);
  }

  // Full cursor pagination with sort field
  return buildCursorFieldPagination(sort, order, lastId, lastValue);
}

/**
 * Skapar ORDER BY-klausul med primärt sorteringsfält och ID som tie-breaker
 * @param sort Sorteringsfältet ("price", "name", "id")
 * @param order Sorteringsordning ("asc" för stigande, "desc" för fallande)
 * @returns Array med Drizzle orderBy-fält för konsistent sortering och paginering
 */
export function createSortOrderClause(sort: string, order: 'asc' | 'desc') {
  const orderByFields = [];

  switch (sort) {
    case 'price':
      orderByFields.push(
        order === 'asc' ? asc(productsTable.price) : desc(productsTable.price)
      );
      break;
    case 'name':
      orderByFields.push(
        order === 'asc' ? asc(productsTable.name) : desc(productsTable.name)
      );
      break;
    default: // 'id'
      orderByFields.push(
        order === 'asc' ? asc(productsTable.id) : desc(productsTable.id)
      );
  }

  // Always add ID as secondary sort for consistent pagination
  orderByFields.push(
    order === 'asc' ? asc(productsTable.id) : desc(productsTable.id)
  );

  return orderByFields;
}

/**
 * Hämtar tillgängliga filteralternativ (färger, storlekar, kategorier) för aktuell scope
 * Analyserar produktdata för att ge dynamiska filteralternativ baserat på kontext
 * @param gender Kön att begränsa scope till ("dam", "herr") eller null för alla
 * @param category Kategori att begränsa scope till eller null för alla
 * @param isNewOnly Om true, begränsar till endast nya produkter
 * @returns Objekt med sorterade arrays av tillgängliga färger, storlekar och kategorier
 */
export async function fetchAvailableFilterOptions(
  gender: string | null,
  category: string | null,
  isNewOnly: boolean = false
) {
  const metadataConditions = [];
  if (gender) metadataConditions.push(eq(productsTable.gender, gender));
  if (category) metadataConditions.push(eq(productsTable.category, category));
  metadataConditions.push(sql`${productsTable.published_at} <= NOW()`);
  if (isNewOnly) {
    metadataConditions.push(
      sql`${productsTable.published_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`
    );
  }

  const whereClause =
    metadataConditions.length > 0 ? and(...metadataConditions) : undefined;

  const colorsQuery = db
    .selectDistinct({color: productsTable.color})
    .from(productsTable)
    .where(whereClause)
    .orderBy(asc(productsTable.color));

  const categoriesQuery = db
    .selectDistinct({category: productsTable.category})
    .from(productsTable)
    .where(whereClause);

  const sizesQuery = db
    .select({
      size: sql<string>`jsonb_array_elements_text(${productsTable.sizes})`.as(
        'size'
      ),
    })
    .from(productsTable)
    .where(
      whereClause
        ? and(whereClause, sql`jsonb_typeof(${productsTable.sizes}) = 'array'`)
        : sql`jsonb_typeof(${productsTable.sizes}) = 'array'`
    )
    .groupBy(sql`size`);

  const [colorRows, categoryRows, sizeRows] = await Promise.all([
    colorsQuery,
    categoriesQuery,
    sizesQuery,
  ]);

  const availableColors = colorRows.map((r) => r.color).filter(Boolean);
  const availableCategories = categoryRows
    .map((r) => r.category)
    .filter(Boolean);
  const availableSizes = sortSizes(sizeRows.map((r) => r.size));

  return {
    availableColors,
    availableSizes,
    availableCategories,
  };
}
