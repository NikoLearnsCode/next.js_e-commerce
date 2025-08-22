import {getInitialProducts} from '@/actions/product';
import Newsletter from '@/components/shared/Newsletter';
import ProductFilterWrapper from '@/components/products/product-grid/ProductFilterWrapper';
import {notFound} from 'next/navigation';
import {Metadata} from 'next';
import {parseSortParam} from '@/utils/filterSort';

interface CategoryPageProps {
  params: Promise<{
    gender: string;
    category: string;
  }>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

async function getCategoryProducts(
  category: string,
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

  const result = await getInitialProducts({
    limit: 8,
    lastId: null,
    category,
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
  params: Promise<{gender: string; category: string}>;
}): Promise<Metadata> {
  const {gender, category} = await params;
  const capitalizedGender = gender.charAt(0).toUpperCase() + gender.slice(1);
  const capitalizedCategory =
    category.charAt(0).toUpperCase() + category.slice(1);

  return {
    title: `${capitalizedGender} - ${capitalizedCategory} `,
    description: `Utforska senaste ${category} stilar och trender för ${gender}.`,
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const {gender, category} = await params;
  const resolvedSearchParams = await searchParams;
  const result = await getCategoryProducts(
    category,
    gender,
    resolvedSearchParams
  );

  return (
    <div className='mx-auto px-0 bg-white z-10'>
      <ProductFilterWrapper
        initialProducts={result.products}
        metadata={result.metadata}
        totalCount={result.totalCount}
        initialHasMore={result.hasMore}
        gender={gender}
        category={category}
        genderCategoryTitle={`${category}`}
      />
      <Newsletter />
    </div>
  );
}
