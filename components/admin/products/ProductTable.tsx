'use client';

import {Product} from '@/lib/types/db';
import AdminTable from '../shared/ReusableTable.tsx';
import {FiEdit, FiTrash} from 'react-icons/fi';
import {
  formatDateForAdmin,
  getAdminHeader,
} from '@/components/admin/utils/admin-helpers';
import {formatPrice} from '@/utils/format';
import {useAdmin} from '@/context/AdminContextProvider';

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

      if (header === 'created_at') {
        return <div>{formatDateForAdmin(product.created_at)}</div>;
      }

      if (header === 'updated_at') {
        return <div>{formatDateForAdmin(product.updated_at)}</div>;
      }

      if (header === 'price') {
        return <div>{formatPrice(value as string | number)}</div>;
      }

      return <div>{String(value)}</div>;
    },
  }));

  const {openSidebar, setDeleteModalOpen, setItemToDelete, setTriggerElement} =
    useAdmin();

  const actions = [
    {
      label: <FiEdit size={16} className='text-gray-600 hover:text-gray-900' />,
      key: 'edit',
      onClick: (product: Product) => {
        openSidebar('product', product);
      },
    },
    {
      label: (
        <FiTrash size={16} className='text-gray-600 hover:text-gray-900' />
      ),
      key: 'delete',
      onClick: (product: Product, event?: React.MouseEvent) => {
        // Spara trigger-elementet för dialogruta
        if (event) {
          setTriggerElement(event.currentTarget as HTMLElement);
        }

        setItemToDelete({
          id: product.id,
          name: product.name,
          type: 'product',
        });
        setDeleteModalOpen(true);
      },
    },
  ];

  return <AdminTable data={products} columns={columns} actions={actions} />;
}
