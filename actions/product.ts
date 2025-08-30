'use server';

import {
  and,
  or,
  eq,
  ilike,
  gt,
  lt,
  desc,
  asc,
  count,
  sql,
  ne,
  getTableColumns,
} from 'drizzle-orm';
import {productsTable} from '@/drizzle/db/schema';
import type {Params, Result} from '@/lib/types/query';
import type {Product} from '@/lib/types/db';
import {sortSizes} from '@/utils/filterSort';
import {db} from '@/drizzle/index';
import {NEW_PRODUCT_DAYS} from '@/lib/constants';

/* ---------------------------------------------------- */
export async function getProductSlugAndRelatedProducts(slug: string): Promise<{
  product: Product | null;
  categoryProducts: Product[];
  genderProducts: Product[];
}> {
  const mainProduct = await db
    .select({
      ...getTableColumns(productsTable),
      isNew:
        sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
          'isNew'
        ),
    })
    .from(productsTable)
    .where(eq(productsTable.slug, slug))
    .limit(1);

  if (mainProduct.length === 0) {
    return {
      product: null,
      categoryProducts: [],
      genderProducts: [],
    };
  }

  const product = mainProduct[0];
  const {id, category, gender} = product;

  const [sameCategoryProducts, sameGenderProducts] = await Promise.all([
    // Same category + gender
    db
      .select({
        ...getTableColumns(productsTable),
        isNew:
          sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
            'isNew'
          ),
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.category, category),
          eq(productsTable.gender, gender),
          ne(productsTable.id, id)
        )
      )
      .limit(8),
    // Same gender, different category
    db
      .select({
        ...getTableColumns(productsTable),
        isNew:
          sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
            'isNew'
          ),
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.gender, gender),
          ne(productsTable.id, id),
          ne(productsTable.category, category)
        )
      )
      .limit(8),
  ]);

  return {
    product: product,
    categoryProducts: sameCategoryProducts,
    genderProducts: sameGenderProducts,
  };
}

/* ----------------------------------------------------------------
   Get products SSR and client-side - SEARCH + GENDER/CATEGORY 
----------------------------------------------------------------  */

// Creates WHERE conditions for text search across product fields
function createTextSearchFilters(query: string | undefined) {
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

// Creates WHERE conditions for category and gender filtering
function buildCategoryGenderFilters(
  category: string | null,
  gender: string | null
) {
  const conditions = [];
  if (category) conditions.push(eq(productsTable.category, category));
  if (gender) conditions.push(eq(productsTable.gender, gender));
  return conditions;
}

// Creates WHERE conditions for size and color array filtering
function buildSizeColorFilters(sizes: string[], color: string[]) {
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

// Creates WHERE condition for filtering only new products
function buildIsNewFilter(isNewOnly: boolean) {
  if (!isNewOnly) return [];

  return [
    sql`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`,
  ];
}

// Converts lastValue to the appropriate type for the sort field
function convertLastValueToFieldType(
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

// Creates simple ID-based pagination conditions
function buildSimpleIdPagination(order: 'asc' | 'desc', lastId: string) {
  const idComparator = order === 'asc' ? gt : lt;
  return [idComparator(productsTable.id, lastId)];
}

/**
 * Creates cursor-based pagination with sort field and ID tie-breaking
 * Uses pattern: (sortField > lastValue) OR (sortField = lastValue AND id > lastId)
 * This ensures consistent pagination even when sort values are identical
 */
function buildCursorFieldPagination(
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

// Creates WHERE conditions for cursor-based pagination
function buildCursorPaginationWhereClause(
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

// Creates ORDER BY clause with primary sort field and ID tie-breaking
function createSortOrderClause(sort: string, order: 'asc' | 'desc') {
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

// Fetches available filter options (colors, sizes, categories) for the current scope
async function fetchAvailableFilterOptions(
  gender: string | null,
  category: string | null
) {
  const metadataConditions = [];
  if (gender) metadataConditions.push(eq(productsTable.gender, gender));
  if (category) metadataConditions.push(eq(productsTable.category, category));

  const facetQuery =
    metadataConditions.length > 0
      ? db
          .select({
            color: productsTable.color,
            sizes: productsTable.sizes,
            category: productsTable.category,
          })
          .from(productsTable)
          .where(and(...metadataConditions))
      : db
          .select({
            color: productsTable.color,
            sizes: productsTable.sizes,
            category: productsTable.category,
          })
          .from(productsTable);

  const rows = await facetQuery;

  const availableColors = Array.from(
    new Set(rows?.map((r) => r.color).filter(Boolean))
  ).sort();

  const availableCategories = Array.from(
    new Set(rows?.map((r) => r.category).filter(Boolean))
  );

  const sizeSets: string[][] = (rows ?? [])
    .map((r) => (r.sizes as string[] | null) ?? [])
    .filter((arr) => arr.length);

  const availableSizes = sortSizes(Array.from(new Set(sizeSets.flat())));

  return {
    availableColors,
    availableSizes,
    availableCategories,
  };
}

export async function getInitialProducts({
  limit = 0,
  query,
  order = 'asc',
  sort = 'id',
  lastId = null,
  lastValue = null,
  category = null,
  gender = null,
  color = [],
  sizes = [],
  metadata = false,
  isNewOnly = false,
}: Params): Promise<Result> {
  try {
    // Build all WHERE conditions
    const searchConditions = createTextSearchFilters(query);
    const basicFilters = buildCategoryGenderFilters(category, gender);
    const arrayFilters = buildSizeColorFilters(sizes, color);
    const isNewFilters = buildIsNewFilter(isNewOnly);
    const paginationConditions = buildCursorPaginationWhereClause(
      sort,
      order,
      lastId,
      lastValue
    );

    const allConditions = [
      ...searchConditions,
      ...basicFilters,
      ...arrayFilters,
      ...isNewFilters,
      ...paginationConditions,
    ];

    const whereClause =
      allConditions.length > 0 ? and(...allConditions) : undefined;
    const orderByFields = createSortOrderClause(sort, order);

    // Debug logging
    console.log('Query params:', {
      sort,
      order,
      category,
      gender,
      hasQuery: !!query,
      colorCount: color.length,
      sizeCount: sizes.length,
      metadata,
    });

    // Execute queries in parallel
    const [countResult, productsData] = await Promise.all([
      db.select({count: count()}).from(productsTable).where(whereClause),
      db
        .select({
          ...getTableColumns(productsTable),
          isNew:
            sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
              'isNew'
            ),
        })
        .from(productsTable)
        .where(whereClause)
        .orderBy(...orderByFields)
        .limit(limit + 1),
    ]);

    const totalCount = countResult[0]?.count ?? 0;
    const hasMore = productsData.length > limit;
    const products = hasMore ? productsData.slice(0, limit) : productsData;

    const result: Result = {
      products: products as Product[],
      hasMore,
      totalCount,
    };

    // Add metadata if requested
    if (metadata) {
      result.metadata = await fetchAvailableFilterOptions(gender, category);
    }

    return result;
  } catch (error) {
    console.error('Error fetching products:', error);
    return {
      products: [],
      hasMore: false,
      totalCount: 0,
      metadata: metadata
        ? {
            availableColors: [],
            availableSizes: [],
            availableCategories: [],
          }
        : undefined,
    };
  }
}
