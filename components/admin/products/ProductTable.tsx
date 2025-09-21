'use client';

import {Product} from '@/lib/types/db-types';
import AdminTable from '../shared/ReusableTable.tsx';
import {FiEdit, FiTrash} from 'react-icons/fi';
import {
  formatDateForAdmin,
  getAdminHeader,
} from '@/components/admin/utils/admin-helpers';
import {formatPrice} from '@/utils/formatPrice';
import {useAdmin} from '@/context/AdminProvider';

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
    'updated_at',
    'published_at',
  ];


  const columns = desiredKeys.map((header) => ({
    header: getAdminHeader(header),
    cell: (product: Product) => {
      const value = product[header as keyof Product];

      if (header === 'updated_at' || header === 'published_at') {
        return (
          <div
            className={`text-[13px] font-medium ${value && value > new Date() ? 'text-red-800' : 'text-gray-600'}`}
          >
            {formatDateForAdmin(value as Date)}
          </div>
        );
      }

      if (header === 'price') {
        return <div>{formatPrice(value as string | number)}</div>;
      }

      return <div>{String(value)}</div>;
    },
  }));

  const {openSidebar, setDeleteModalOpen, setItemToDelete, setTriggerElement} =
    useAdmin();

  // Skickas till adminProvider > uppdaterar state > formwrapper prenumererar på state
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
