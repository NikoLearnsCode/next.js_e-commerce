import {Metadata} from 'next';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
};

export default async function Admin() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  return (
    <div className='py-6 px-10'>
      <h1 className='text-xl uppercase font-semibold mb-8'>Admin Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 '>
        <Link
          className='bg-white p-5 hover:border-gray-300 rounded-sm border border-gray-200'
          href='/admin/products'
        >
          <h2 className='text-base uppercase font-semibold mb-2'>Produkter</h2>
          <p className='text-gray-600 mb-4'>
            Hantera alla produkter i systemet
          </p>
        </Link>
        <Link
          className='bg-white p-5 rounded-sm border hover:border-gray-300  border-gray-200'
          href='/admin/categories'
        >
          <h2 className='text-base uppercase font-semibold mb-2'>Kategorier</h2>
          <p className='text-gray-600 mb-4'>Hantera produktkategorier</p>
        </Link>
        <Link
          className='bg-white p-5 rounded-sm border hover:border-gray-300  border-gray-200'
          href='/admin/orders'
        >
          <h2 className='text-base uppercase font-semibold mb-2'>Beställningar</h2>
          <p className='text-gray-600 mb-4'>Hantera beställningar</p>
        </Link>
      </div>
    </div>
  );
}
