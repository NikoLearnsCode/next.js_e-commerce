'use server';

import {and, eq, count, sql, ne, getTableColumns} from 'drizzle-orm';
import {productsTable} from '@/drizzle/db/schema';
import type {Params, Result} from '@/lib/types/query';
import type {Product} from '@/lib/types/db';
import {
  createTextSearchFilters,
  buildCategoryGenderFilters,
  buildSizeColorFilters,
  buildIsNewFilter,
  buildCursorPaginationWhereClause,
  createSortOrderClause,
  fetchAvailableFilterOptions,
} from '@/actions/utils/products.query-builder';
import {db} from '@/drizzle/index';
import {NEW_PRODUCT_DAYS} from '@/lib/constants';

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
        id: productsTable.id,
        name: productsTable.name,
        price: productsTable.price,
        images: productsTable.images,
        slug: productsTable.slug,
        created_at: productsTable.created_at,
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
        id: productsTable.id,
        name: productsTable.name,
        price: productsTable.price,
        images: productsTable.images,
        slug: productsTable.slug,
        created_at: productsTable.created_at,
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
    categoryProducts: sameCategoryProducts as Product[],
    genderProducts: sameGenderProducts as Product[],
  };
}

export async function getInfiniteProducts({
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

    const [countResult, productsData] = await Promise.all([
      db.select({count: count()}).from(productsTable).where(whereClause),
      db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          price: productsTable.price,
          images: productsTable.images,
          slug: productsTable.slug,
          created_at: productsTable.created_at,
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

    if (metadata) {
      result.metadata = await fetchAvailableFilterOptions(
        gender,
        category,
        isNewOnly
      );
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
