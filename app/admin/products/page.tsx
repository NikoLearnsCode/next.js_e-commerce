'use server';

import {getAllProducts} from '@/actions/admin/products';
// import {getServerSession} from 'next-auth';
// import {authOptions} from '@/lib/auth';
// import {redirect} from 'next/navigation';

import ProductManager from '@/components/admin/products/ProductManager';
import {Metadata} from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Produkter',
  };
}

interface ProductsPageProps {
  searchParams: {search?: string};
}

export default async function ProductsPage({searchParams}: ProductsPageProps) {
  // const session = await getServerSession(authOptions);

  // if (session?.user.role !== 1) {
  //   return redirect('/denied');
  // }

  const products = await getAllProducts(searchParams.search);



  return <ProductManager products={products} />;
}
