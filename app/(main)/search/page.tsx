import type {Metadata} from 'next';
import {getInfiniteProducts} from '@/actions/product.actions';
import SearchInfiniteScroll from '@/components/products/product-grid/SearchInfinitePagination';

type Props = {
  searchParams: Promise<{q?: string}>;
};

export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const {q = ''} = await searchParams;

  return {
    title: q ? `Sökresultat för "${q}" | NC` : 'Sök produkter | NC',
    description: q
      ? `Se våra produkter som matchar "${q}"`
      : 'Sök bland vårt sortiment av produkter',
  };
}

export default async function SearchPage({searchParams}: Props) {
  const {q = ''} = await searchParams;

  const result = q
    ? await getInfiniteProducts({
        query: q,
        limit: 8,
      })
    : {products: [], hasMore: false, totalCount: 0};

  // console.log('FROM SSR', result);

  if (!result.products || result.products.length === 0) {
    return (
      <div className='flex items-center justify-center min-h-[calc(100vh-400px)]'>
        <div className='text-center max-w-full '>
          <p className='px-6 text-base md:text-lg  break-words '>
            Inga produkter hittades för söktermen{' '}
            <span className=' italic font-medium'>"{q}"</span>.
            <br />
            Prova med andra sökord.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className='w-full flex justify-center py-4'>
      <div className='w-full'>
        <SearchInfiniteScroll
          query={q}
          initialHasMore={result.hasMore}
          initialProducts={result.products}
          totalCount={result.totalCount}
        />
      </div>
    </div>
  );
}
