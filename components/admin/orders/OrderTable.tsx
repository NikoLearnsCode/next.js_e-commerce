'use client';

import {Order} from '@/lib/validators';
import AdminTable from '../shared/AdminTable';
import {formatDateForAdmin, formatPrice, getAdminHeader} from '@/utils/helpers';

type OrderTableProps = {
  orders: Order[];
};

export default function OrderTable({orders}: OrderTableProps) {
  const deliveryColumns = [
    {
      header: 'Kund',
      cell: (order: Order) => (
        <div>{`${order.delivery_info.firstName} ${order.delivery_info.lastName}`}</div>
      ),
    },
    {
      header: 'Kontakt',
      cell: (order: Order) => (
        <div>
          <p>{order.delivery_info.email}</p>
          <p className='text-xs text-gray-500'>{order.delivery_info.phone}</p>
        </div>
      ),
    },
    {
      header: 'Adress',
      cell: (order: Order) => (
        <div>{`${order.delivery_info.address}, ${order.delivery_info.postalCode} ${order.delivery_info.city}`}</div>
      ),
    },
  ];

  const simpleKeys = [
    'payment_info',
    'status',
    'total_amount',
    'created_at',
    'updated_at',
  ];

  const simpleColumns = simpleKeys.map((key) => ({
    header: getAdminHeader(key),
    cell: (order: Order) => {
      const value = order[key as keyof Order];

      // Formatera datum-fält
      if (key === 'created_at' || key === 'updated_at') {
        return <div>{formatDateForAdmin(value as Date)}</div>;
      }

      // Formatera pris-fält
      if (key === 'total_amount') {
        return <div>{formatPrice(value as string | number)}</div>;
      }

      return <div>{String(value)}</div>;
    },
  }));

  const columns = [...deliveryColumns, ...simpleColumns];

  return <AdminTable data={orders} columns={columns} />;
}
