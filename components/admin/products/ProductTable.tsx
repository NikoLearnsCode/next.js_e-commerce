'use client';

import {Product} from '@/lib/validators';
import AdminTable from '../shared/AdminTable';
import {FiEdit, FiTrash} from 'react-icons/fi';
import {formatDateForAdmin, formatPrice, getAdminHeader} from '@/utils/helpers';

type ProductManagerProps = {
  products: Product[];
};

export default function ProductManager({products}: ProductManagerProps) {
  const desiredKeys = [
    'name',
    'price',
    'brand',
    'gender',
    'category',
    'sizes',
    'created_at',
    'updated_at',
  ];

  const filteredKeys = Object.keys(products[0]).filter((key) =>
    desiredKeys.includes(key)
  );

  const columns = filteredKeys.map((header) => ({
    header: getAdminHeader(header),
    cell: (product: Product) => {
      const value = product[header as keyof Product];

      // Formatera datum-fält
      if (header === 'created_at' || header === 'updated_at') {
        return <div>{formatDateForAdmin(value as Date)}</div>;
      }

      if (header === 'price') {
        return <div>{formatPrice(value as string | number)}</div>;
      }

      return <div>{String(value)}</div>;
    },
  }));

  const actions = [
    {
      label: <FiEdit size={16} />,
      key: 'edit',
      onClick: (product: Product) => {
        console.log('Redigera produkt:', product);
      },
    },
    {
      label: <FiTrash size={16} />,
      key: 'delete',
      onClick: (product: Product) => {
        console.log('Ta bort produkt:', product);
      },
    },
  ];

  return <AdminTable data={products} columns={columns} actions={actions} />;
}
