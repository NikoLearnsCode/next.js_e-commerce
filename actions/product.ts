'use server';

import {Product} from '@/lib/validators';
import {createClient} from '@/utils/supabase/server';
import {sortSizes, SortField} from '@/lib/helpers';

// ----------------------------------------------------------
// Get all product details (slug, gender, category) via RPC
// ----------------------------------------------------------

export async function getProductDetailsBySlug(slug: string): Promise<{
  product: Product | null;
  categoryProducts: Product[];
  genderProducts: Product[];
}> {
  const supabase = await createClient();

  const {data, error} = await supabase.rpc('get_product_details', {
    product_slug: slug, // Argument in SQL function
  });

  if (error) {
    console.error(
      `Error calling RPC get_product_details for slug ${slug}:`,
      error
    );
    return {product: null, categoryProducts: [], genderProducts: []};
  }

  const result = data as {
    product: Product | null;
    categoryProducts: Product[];
    genderProducts: Product[];
  };
  return {
    product: result.product || null,
    categoryProducts: result.categoryProducts || [],
    genderProducts: result.genderProducts || [],
  };
}

// ----------------------------------------------------------------
// General fetch for SSR and client-side - SEARCH + GENDER/CATEGORY
// ----------------------------------------------------------------

type Params = {
  limit?: number;
  query?: string;
  order?: 'asc' | 'desc';
  sort?: SortField;
  lastId?: string | null;
  lastValue?: number | string | null; // price or name depending on sort
  category?: string | null;
  gender?: string | null;
  color?: string[];
  sizes?: string[];
  metadata?: boolean;
};

type Result = {
  products: Product[];
  hasMore: boolean;
  totalCount: number;
  metadata?: {
    availableColors: string[];
    availableSizes: string[];
    availableCategories: string[];
  };
};

export async function getInitialProducts({
  limit = 8,
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
}: Params): Promise<Result> {
  const supabase = await createClient();

  const sanitizedQuery = query
    ? query.replace(/[^a-zA-Z0-9\såäöÅÄÖ]/g, ' ')
    : '';

  // Helper that takes a builder object and returns the same with filters applied.
  const applyFilters = (b: any) => {
    if (sanitizedQuery.trim()) {
      b = b.or(
        `name.ilike.%${sanitizedQuery.trim()}%,category.ilike.%${sanitizedQuery.trim()}%,gender.ilike.%${sanitizedQuery.trim()}%,brand.ilike.%${sanitizedQuery.trim()}%`
      );
    }
    if (category) b = b.eq('category', category);
    if (gender) b = b.eq('gender', gender);

    // JSONB array filter for sizes - PostgREST syntax for array containment
    if (sizes.length) {
      const sizeConditions = sizes.map((size) => `sizes.cs.["${size}"]`);
      b = b.or(sizeConditions.join(','));
    }

    if (color.length) b = b.in('color', color);

    return b;
  };

  // Base builder: select all + always count totalCount
  const base = supabase.from('products').select('*', {count: 'exact'});

  // Apply filters
  let builder = applyFilters(base);

  builder = builder
    .order(sort, {ascending: order === 'asc'})
    .order('id', {ascending: order === 'asc'});

  console.log('sort', sort);
  console.log('order', order);

  if (lastId !== null) {
    if (sort === 'id') {
      builder =
        order === 'asc' ? builder.gt('id', lastId) : builder.lt('id', lastId);
    } else {
      // Cursor based sort (sort-value, id): (S > v) OR (S = v AND id > i) — resp. < for desc
      if (lastValue == null) {
        builder =
          order === 'asc' ? builder.gt('id', lastId) : builder.lt('id', lastId);
      } else {
        const col = sort; // 'price' or 'name'
        const op = order === 'asc' ? 'gt' : 'lt'; // > or <
        const idOp = order === 'asc' ? 'gt' : 'lt';
        builder = builder.or(
          `${col}.${op}.${lastValue},and(${col}.eq.${lastValue},id.${idOp}.${lastId})`
        );
      }
    }
  }

  // limit + 1: get one extra row to know if there are more pages
  const {data, count, error} = await builder.limit(limit + 1);
  if (error) throw error;

  // hasMore = if we got more than limit
  const hasMore = (data?.length ?? 0) > limit;

  // remove the extra row so we only send limit number of products
  const products = (
    hasMore ? data!.slice(0, limit) : (data ?? [])
  ) as Product[];

  const result: Result = {
    products,
    hasMore,
    totalCount: count ?? 0,
  };

  if (metadata) {
    let facetBuilder = supabase.from('products').select('color,sizes,category');
    if (gender) facetBuilder = facetBuilder.eq('gender', gender);
    if (category) facetBuilder = facetBuilder.eq('category', category);

    const {data: rows, error: facetErr} = await facetBuilder;
    if (facetErr) throw facetErr;

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

    result.metadata = {
      availableColors,
      availableSizes,
      availableCategories,
    };
  }

  // return: products, hasMore, totalCount and metadata if requested
  return result;
}
