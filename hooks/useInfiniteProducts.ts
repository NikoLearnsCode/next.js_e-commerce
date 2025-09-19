'use client';

import {ProductCard} from '@/lib/types/db-types';
import {getInfiniteProducts} from '@/actions/product.actions';
import {useInfiniteQuery} from '@tanstack/react-query';
import {parseSortParam} from '@/utils/filterSort';
import {parseCollectionSlug} from '@/actions/utils/virtualCategories';

export function useInfiniteProducts({
  query,
  initialProducts,
  initialHasMore,
  category,
  gender,
  color,
  sizes,
  sort,
}: {
  query?: string;
  initialProducts?: ProductCard[];
  initialHasMore?: boolean;
  category?: string;
  gender?: string;
  color?: string[];
  sizes?: string[];
  sort?: string;
}) {
  // Parse sort parameter using the common utility function
  const {sort: sortField, order} = parseSortParam(sort);

  const {actualCategory, isNewOnly} = parseCollectionSlug(category);

  return useInfiniteQuery({
    queryKey: ['products', {query, category, gender, color, sizes, sort}],
    queryFn: async ({
      pageParam,
    }: {
      pageParam?: {lastId: string; lastValue?: number | string};
    }) => {
      const result = await getInfiniteProducts({
        query,
        lastId: pageParam?.lastId || null,
        lastValue: pageParam?.lastValue || null,
        limit: 8,
        category: actualCategory,
        gender: gender || null,
        color: color || [],
        sizes: sizes || [],
        sort: sortField,
        order,
        isNewOnly,
      });
      console.log('lastId', pageParam?.lastId);
      console.log('lastValue', pageParam?.lastValue);
      return {
        products: result.products,
        hasMore: result.hasMore,
      };
    },

    getNextPageParam: (lastPage) => {
      if (!lastPage.hasMore || !lastPage.products.length) return undefined;

      const lastProduct = lastPage.products[lastPage.products.length - 1];
      let lastValue: number | string | undefined;

      // Get the last value based on sort field
      if (sortField === 'price') {
        lastValue = lastProduct.price;
      } else if (sortField === 'name') {
        lastValue = lastProduct.name;
      }

      return {
        lastId: lastProduct.id,
        lastValue,
      };
    },

    initialPageParam: undefined,
    // hydrate with SSR data
    initialData:
      initialProducts && initialProducts.length
        ? {
            pageParams: [undefined],
            pages: [
              {
                products: initialProducts,
                hasMore: initialHasMore || false,
              },
            ],
          }
        : undefined,
    // refetch on window focus
  });
}
