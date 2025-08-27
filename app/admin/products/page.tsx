'use server';

import {getAllProducts} from '@/actions/admin';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';
import ProductManager from '@/components/admin/products/ProductManager';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Produkter',
  };
}

export default async function ProductsPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const products = await getAllProducts();

  if (!products || products.length === 0) {
    return <NoResults message='Inga produkter hittades.' />;
  }

  return <ProductManager products={products} />;
}
