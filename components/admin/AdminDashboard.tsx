import Link from "next/link";
import AdminHeader from './shared/AdminHeader';

export default function AdminDashboard() {
  return (
    <div className=''>
      <AdminHeader title='Admin Dashboard' />
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 '>
        <Link
          className='bg-white p-5 hover:border-gray-300 rounded-sm border border-gray-200'
          href='/admin/products'
        >
          <h2 className='text-base uppercase font-semibold  mb-1  '>Produkter</h2>
          <p className='text-gray-600 mb-4'>
            Hantera alla produkter i systemet
          </p>
        </Link>
        <Link
          className='bg-white p-5 rounded-sm border border-das hover:border-gray-300  border-gray-200'
          href='/admin/categories'
        >
          <h2 className='text-base uppercase font-semibold  mb-1  '>Kategorier</h2>
          <p className='text-gray-600 mb-4'>Hantera produktkategorier</p>
        </Link>
        <Link
          className='bg-white p-5 rounded-sm border hover:border-gray-300  border-gray-200'
          href='/admin/orders'
        >
          <h2 className='text-base uppercase font-semibold  mb-1  '>
            Beställningar
          </h2>
          <p className='text-gray-600 mb-4'>Hantera beställningar</p>
        </Link>
      </div>
    </div>
  );
}