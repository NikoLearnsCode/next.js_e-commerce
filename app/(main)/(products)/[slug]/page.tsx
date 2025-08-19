import {notFound} from 'next/navigation';
import {getProductDetailsBySlug} from '@/actions/product';
import type {Metadata} from 'next';
import ProductPage from '@/components/products/product-detail/Product';

interface PageProps {
  params: Promise<{slug: string}>;
  searchParams: Promise<{[key: string]: string | string[] | undefined}>;
}

export async function generateMetadata({params}: PageProps): Promise<Metadata> {
  const {slug} = await params;
  const {product} = await getProductDetailsBySlug(slug);

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
    await getProductDetailsBySlug(slug);

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
