'use client';

import {useState, useMemo} from 'react';
import {
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronRight,
  FiChevronUp,
  FiCornerLeftUp,
} from 'react-icons/fi';

import AdminTable from '../shared/ReusableTable.tsx';
import {CategoryWithChildren} from '@/lib/types/category';
import {
  formatDateForAdmin,
  getAdminHeader,
} from '@/components/admin/utils/admin-general-helpers';
import {useAdmin} from '@/context/AdminContextProvider';
import {
  flattenCategoriesRecursive,
  FlattenedCategory,
  categoryConfig,
  getAllCategoryIdsRecursive,
} from '../utils/category-table-helpers';

type CategoryManagerProps = {
  categories: CategoryWithChildren[];
};

export default function CategoryManager({categories}: CategoryManagerProps) {
  const {openSidebar, setDeleteModalOpen, setItemToDelete, setTriggerElement} =
    useAdmin();

  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    () => {
      if (!categories || categories.length === 0) {
        return new Set();
      }

      const initialIds = new Set<number>();

      const firstCategory = categories[1];
      initialIds.add(firstCategory.id);

      if (firstCategory.children && firstCategory.children.length > 0) {
        firstCategory.children.forEach((child) => {
          initialIds.add(child.id);
        });
      }

      return initialIds;
    }
  );

  const toggleCategory = (categoryId: number) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const flattenedCategories = useMemo(
    () => flattenCategoriesRecursive(categories, expandedCategories),
    [categories, expandedCategories]
  );

  const columns = useMemo(
    () => [
      {
        header: 'Kategorier',
        headerClassName: 'pl-11',
        cell: (category: FlattenedCategory) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasChildren = category.children && category.children.length > 0;

          // Huvudkategori (nivå 0)
          if (category.level === 0) {
            return (
              <div className='flex items-center group transition-all duration-100'>
                <div
                  className='flex items-center cursor-pointer text-gray-700 hover:text-black'
                  onClick={() => hasChildren && toggleCategory(category.id)}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FiChevronDown
                        size={20}
                        strokeWidth={1}
                        className='mr-2 text-black flex-shrink-0 group-hover:text-black'
                      />
                    ) : (
                      <FiChevronRight
                        size={20}
                        strokeWidth={1}
                        className='mr-2 text-gray-700 flex-shrink-0 group-hover:text-black'
                      />
                    )
                  ) : (
                    <div className='w-5 mr-2 flex-shrink-0' />
                  )}
                  <span className='font-semibold uppercase'>
                    {category.name}
                  </span>
                </div>
                {hasChildren && (
                  <span className='ml-2 text-xs text-gray-700'>
                    ({category.children?.length || 0})
                  </span>
                )}
              </div>
            );
          }

          // Underkategorier (nivå > 0)
          return (
            <div className='flex items-center relative'>
              <div
                style={{width: `${(category.level - 1) * 50 + 40}px`}}
                className='flex-shrink-0'
              />
              {!hasChildren && (
                <FiCornerLeftUp
                  size={16}
                  strokeWidth={1.5}
                  className='text-gray-400 flex-shrink-0 '
                />
              )}
              <div className='flex items-center text-gray-900'>
                <div
                  className={`flex  items-center ${hasChildren ? 'cursor-pointer hover:text-black' : ''}`}
                  onClick={() => hasChildren && toggleCategory(category.id)}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FiChevronUp
                        size={20}
                        strokeWidth={1}
                        className='mr-4 text-gray-500 flex-shrink-0'
                      />
                    ) : (
                      <FiChevronRight
                        size={20}
                        strokeWidth={1}
                        className='mr-4 text-gray-500 flex-shrink-0'
                      />
                    )
                  ) : (
                    <div className='w-5  flex-shrink-0' />
                  )}
                  <span className='normal-case'>{category.name}</span>
                  {hasChildren && (
                    <span className='ml-1.5 text-xs italic text-gray-500'>
                      ({category.children?.length || 0})
                    </span>
                  )}
                </div>
                {category.parentName && (
                  <div className='ml-1.5 flex items-center text-xs text-gray-500'>
                    <span className='italic'>({category.parentName})</span>
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        header: getAdminHeader('slug'),
        cell: (category: FlattenedCategory) => <div>{category.slug}</div>,
      },
      {
        header: 'Sortering',
        cell: (category: FlattenedCategory) => (
          <div>{category.displayOrder}</div>
        ),
      },

      {
        header: 'Typ',
        cell: (category: FlattenedCategory) => {
          const config =
            categoryConfig[category.type] || categoryConfig['MAIN-CATEGORY'];

          return <div className={` ${config.className}`}>{config.name}</div>;
        },
      },
      {
        header: getAdminHeader('isActive'),
        cell: (category: FlattenedCategory) => (
          <div
            className={` text-sm  ${category.isActive ? 'text-black' : 'text-red-900'}`}
          >
            {category.isActive ? 'Aktiv' : 'Inaktiv'}
          </div>
        ),
      },
      {
        header: getAdminHeader('created_at'),
        cell: (category: FlattenedCategory) => (
          <div>{formatDateForAdmin(category.created_at)}</div>
        ),
      },
      {
        header: getAdminHeader('updated_at'),
        cell: (category: FlattenedCategory) => (
          <div>{formatDateForAdmin(category.updated_at)}</div>
        ),
      },
    ],
    [expandedCategories]
  );

  const actions = [
    {
      label: <FiEdit size={16} className='text-gray-600 hover:text-gray-900' />,
      key: 'edit',
      isDisabled: (category: FlattenedCategory) =>
        category.type === 'COLLECTION',
      onClick: (category: FlattenedCategory) => {
        // Öppna sidebar i edit mode
        openSidebar('category', category);
      },
    },
    {
      label: (
        <FiTrash size={16} className='text-gray-600 hover:text-gray-900' />
      ),
      key: 'delete',
      isDisabled: (category: FlattenedCategory) =>
        category.type === 'COLLECTION',
      onClick: (category: FlattenedCategory, event?: React.MouseEvent) => {
        // Spara trigger-elementet för dialogruta
        if (event) {
          setTriggerElement(event.currentTarget as HTMLElement);
        }

        setItemToDelete({
          id: category.id.toString(),
          name: category.name,
          type: 'category',
        });

        setDeleteModalOpen(true);
      },
    },
  ];

  const getRowClassName = (category: FlattenedCategory) => {
    if (category.level === 0) {
      return `transition-colors ${
        expandedCategories.has(category.id)
          ? 'bg-gray-200 border-b border-gray-300'
          : 'bg-white hover:bg-gray-100 border-b border-gray-200'
      }`;
    }
    if (category.level === 1) {
      return `text-[13px] transition-colors ${
        expandedCategories.has(category.id)
          ? 'bg-gray-100 hover:bg-gray-200/70 border-b border-gray-300'
          : 'bg-white hover:bg-gray-100 border-b border-gray-100'
      }`;
    }
    return `bg-gray-50 text-[12px] border-b border-gray-200 hover:bg-gray-100`;
  };

  const expandAll = () =>
    setExpandedCategories(new Set(getAllCategoryIdsRecursive(categories)));
  const collapseAll = () => setExpandedCategories(new Set());

  return (
    <div>
      <div className='pb-1 flex items-center gap-2'>
        <button
          onClick={expandAll}
          className='p-2 text-sm cursor-pointer hover:underline text-gray-600 font-medium'
        >
          Expandera
        </button>
        <button
          onClick={collapseAll}
          className='p-2 text-sm cursor-pointer hover:underline text-gray-600 font-medium'
        >
          Kollapsa
        </button>
      </div>

      <AdminTable
        data={flattenedCategories}
        columns={columns}
        actions={actions}
        getRowClassName={getRowClassName}
      />
    </div>
  );
}
