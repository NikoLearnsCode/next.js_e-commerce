'use server';

import {and, eq, count, sql, ne, getTableColumns} from 'drizzle-orm';
import {productsTable} from '@/drizzle/db/schema';
import type {Params, Result} from '@/lib/types/query';
import {NEW_PRODUCT_DAYS} from '@/lib/constants';
import {ProductDetail, CarouselCard} from '@/lib/types/db';
import {
  createTextSearchFilters,
  buildCategoryGenderFilters,
  buildSizeColorFilters,
  buildIsNewFilter,
  buildCursorPaginationWhereClause,
  createSortOrderClause,
  fetchAvailableFilterOptions,
} from '@/actions/lib/infiniteQuery-builder';
import {db} from '@/drizzle/index';

export async function getProductSlugAndRelatedProducts(slug: string): Promise<{
  product: ProductDetail | null;
  categoryProducts: CarouselCard[];
  genderProducts: CarouselCard[];
}> {
  const mainProduct = await db
    .select({
      ...getTableColumns(productsTable),
      isNew:
        sql<boolean>`${productsTable.published_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
          'isNew'
        ),
    })
    .from(productsTable)
    .where(
      and(
        eq(productsTable.slug, slug),
        sql`${productsTable.published_at} <= NOW()`
      )
    )
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
          sql<boolean>`${productsTable.published_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
            'isNew'
          ),
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.category, category),
          eq(productsTable.gender, gender),
          ne(productsTable.id, id),
          sql`${productsTable.published_at} <= NOW()`
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
          sql<boolean>`${productsTable.published_at} > NOW() - INTERVAL '${sql.raw(NEW_PRODUCT_DAYS.toString())} days'`.as(
            'isNew'
          ),
      })
      .from(productsTable)
      .where(
        and(
          eq(productsTable.gender, gender),
          ne(productsTable.id, id),
          ne(productsTable.category, category),
          sql`${productsTable.published_at} <= NOW()`
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
  includeCount = false,
}: Params): Promise<Result> {
  try {
    const searchConditions = createTextSearchFilters(query);
    const basicFilters = buildCategoryGenderFilters(category, gender);
    const arrayFilters = buildSizeColorFilters(sizes, color);
    const isNewFilters = buildIsNewFilter(isNewOnly);

    const baseWhereConditions = [
      ...searchConditions,
      ...basicFilters,
      ...arrayFilters,
      ...isNewFilters,
    ];
    const baseWhereClause =
      baseWhereConditions.length > 0 ? and(...baseWhereConditions) : undefined;

    const paginationConditions = buildCursorPaginationWhereClause(
      sort,
      order,
      lastId,
      lastValue
    );
    const productWhereConditions = [
      ...baseWhereConditions,
      ...paginationConditions,
    ];
    const productWhereClause =
      productWhereConditions.length > 0
        ? and(...productWhereConditions)
        : undefined;

    const orderByFields = createSortOrderClause(sort, order);

    const queriesToRun: [Promise<any>, ...Promise<any>[]] = [
      db
        .select({
          id: productsTable.id,
          name: productsTable.name,
          price: productsTable.price,
          brand: productsTable.brand,
          color: productsTable.color,
          sizes: productsTable.sizes,
          images: productsTable.images,
          slug: productsTable.slug,
          created_at: productsTable.created_at,
          isNew:
            sql<boolean>`${productsTable.created_at} > NOW() - INTERVAL '${sql.raw(
              NEW_PRODUCT_DAYS.toString()
            )} days'`.as('isNew'),
        })
        .from(productsTable)
        .where(productWhereClause)
        .orderBy(...orderByFields)
        .limit(limit + 1),
    ];

    if (includeCount) {
      queriesToRun.push(
        db.select({count: count()}).from(productsTable).where(baseWhereClause)
      );
    }

    const [productsResult, countResult] = await Promise.all(queriesToRun);

    const hasMore = productsResult.length > limit;
    const products = hasMore ? productsResult.slice(0, limit) : productsResult;

    const result: Result = {
      products,
      hasMore,
    };

    if (includeCount) {
      result.totalCount = countResult?.[0]?.count ?? 0;
    }

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
      totalCount: includeCount ? 0 : undefined,
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
