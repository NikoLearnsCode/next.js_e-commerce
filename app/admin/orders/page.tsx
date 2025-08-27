// app/admin/orders/page.tsx
import {getAllOrders} from '@/actions/admin';
import AdminTable from '@/components/admin/shared/AdminTable';
import {getServerSession} from 'next-auth';
import {authOptions} from '@/lib/auth';
import {redirect} from 'next/navigation';
import NoResults from '@/components/admin/shared/NoResults';

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (session?.user.role !== 1) {
    return redirect('/denied');
  }

  const orders = await getAllOrders();

  if (!orders || orders.length === 0) {
    return <NoResults message='Inga ordrar hittades.' />;
  }


  const simpleKeys = [
    'payment_info',
    'status',
    'total_amount',
    'created_at',
    'updated_at',
  ];

  const simpleColumns = simpleKeys.map((key) => ({
    header: key.replace('_', ' '),
    cell: (order: any) => <div>{String(order[key])}</div>,
  }));

  const deliveryColumns = [
    {
      header: 'Customer',
      cell: (order: any) => (
        <div>{`${order.delivery_info.firstName} ${order.delivery_info.lastName}`}</div>
      ),
    },
    {
      header: 'Contact',
      cell: (order: any) => (
        <div>
          <p>{order.delivery_info.email}</p>
          <p className='text-xs text-gray-500'>{order.delivery_info.phone}</p>
        </div>
      ),
    },
    {
      header: 'Adress',
      cell: (order: any) => (
        <div>{`${order.delivery_info.address}, ${order.delivery_info.postalCode} ${order.delivery_info.city}`}</div>
      ),
    },
  ];

  const columns = [...deliveryColumns, ...simpleColumns];

  return <AdminTable data={orders} columns={columns} />;
}
