'use client';

import {MainCategory} from '@/lib/validators';
import {FiEdit, FiTrash} from 'react-icons/fi';
import AdminTable from '../shared/AdminTable';
import {formatDateForAdmin, getAdminHeader} from '@/utils/helpers';

type CategoryManagerProps = {
  categories: MainCategory[];
};

export default function CategoryManager({categories}: CategoryManagerProps) {
  const desiredKeys = [
    'name',
    'slug',
    'isActive',
    'display_order',
    'created_at',
    'updated_at',
  ];

  const filteredKeys = Object.keys(categories[0]).filter((key) =>
    desiredKeys.includes(key)
  );

  const filteredKeysColumns = filteredKeys.map((key) => ({
    header: getAdminHeader(key),
    cell: (category: MainCategory) => {
      const value = category[key as keyof MainCategory];

      if (key === 'isActive') {
        return <div>{`${value ? 'Aktiv' : 'Inaktiv'}`}</div>;
      }

      // Formatera datum-fält
      if (key === 'created_at' || key === 'updated_at') {
        return (
          <div className='text-sm text-gray-900'>
            {formatDateForAdmin(value as Date)}
          </div>
        );
      }

      return <div className='text-sm text-gray-900'>{String(value)}</div>;
    },
  }));

  const columns = [...filteredKeysColumns];

  const actions = [
    {
      label: <FiEdit size={16} />,
      key: 'edit',
      onClick: (category: MainCategory) => {
        console.log('Redigera kategori:', category);
      },
    },
    {
      label: <FiTrash size={16} />,
      key: 'delete',
      onClick: (category: MainCategory) => {
        console.log('Ta bort kategori:', category);
      },
    },
  ];

  return <AdminTable data={categories} columns={columns} actions={actions} />;
}
