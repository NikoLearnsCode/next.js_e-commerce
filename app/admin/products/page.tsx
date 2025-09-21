'use server';

import {getAllProducts} from '@/actions/admin/admin.products.actions';

import ProductManager from '@/components/admin/products/ProductManager';
import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Produkter',
  };
}

interface ProductsPageProps {
  searchParams: Promise<{search?: string}>;
}

export default async function ProductsPage({searchParams}: ProductsPageProps) {

  const {search} = await searchParams;
  const products = await getAllProducts(search);

  return <ProductManager products={products} />;
}
