import {getInfiniteProducts} from '@/actions/product.actions';
import Newsletter from '@/components/shared/Newsletter';
import ProductFilterWrapper from '@/components/products/product-grid/ProductFilterWrapper';
import {notFound} from 'next/navigation';
import {Metadata} from 'next';
import {parseSortParam} from '@/utils/filterSort';

interface GenderPageProps {
  params: Promise<{
    gender: string;
  }>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

async function getGenderProducts(
  gender: string,
  searchParams: {[key: string]: string | string[] | undefined}
) {
  // Parse filter parameters from URL
  const colorParam = searchParams.color;
  const sizeParam = searchParams.sizes;
  const sortParam = searchParams.sort;

  const color = colorParam
    ? typeof colorParam === 'string'
      ? colorParam.split(',').filter(Boolean)
      : colorParam
    : undefined;
  const sizes = sizeParam
    ? typeof sizeParam === 'string'
      ? sizeParam.split(',').filter(Boolean)
      : sizeParam
    : undefined;

  // Parse sort parameter
  const {sort, order} = parseSortParam(
    typeof sortParam === 'string' ? sortParam : undefined
  );

  const result = await getInfiniteProducts({
    limit: 8,
    lastId: null,
    category: null,
    gender,
    color,
    sizes,
    sort,
    order,
    metadata: true,
  });
  if (!result.products || result.products.length === 0) {
    notFound();
  }
  return result;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{gender: string}>;
}): Promise<Metadata> {
  const {gender} = await params;
  const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1);

  return {
    title: capitalizedGender,
    description: `Utforska senaste stilar och trender för ${gender}.`,
  };
}

export default async function GenderPage({
  params,
  searchParams,
}: GenderPageProps) {
  const {gender} = await params;
  const resolvedSearchParams = await searchParams;
  const result = await getGenderProducts(gender, resolvedSearchParams);

  return (
    <div className='mx-auto'>
      <ProductFilterWrapper
        initialProducts={result.products}
        initialHasMore={result.hasMore}
        metadata={result.metadata}
        totalCount={result.totalCount}
        gender={gender}
        genderCategoryTitle={`Allt inom ${gender}`}
      />

      <Newsletter />
    </div>
  );
}
