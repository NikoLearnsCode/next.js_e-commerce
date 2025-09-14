import {notFound} from 'next/navigation';
import {getProductSlugAndRelatedProducts} from '@/actions/product.actions';
import type {Metadata} from 'next';
import ProductPage from '@/components/products/product-detail/ProductDetailPage';

interface PageProps {
  params: Promise<{slug: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const {product} = await getProductSlugAndRelatedProducts(slug);

  if (!product) {
    notFound();
  }

  return {
    title: product.name,
    description: product.description,
  };
}

export default async function ProductDetailPage({params}: PageProps) {
  const {slug} = await params;
  const {product, categoryProducts, genderProducts} =
    await getProductSlugAndRelatedProducts(slug);

  if (!product) {
    notFound();
  }

  return (
    <ProductPage
      product={product}
      categoryProducts={categoryProducts}
      genderProducts={genderProducts}
    />
  );
}
