'use client';

import {useState, useMemo} from 'react';

import {
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronRight,
  FiArrowRight,
} from 'react-icons/fi';

import AdminTable from '../shared/AdminTable';
import {MainCategoryWithSub} from '@/lib/validators';
import {formatDateForAdmin, getAdminHeader} from '@/utils/helpers';


type CategoryManagerProps = {
  categories: MainCategoryWithSub[];
};


type FlattenedCategory = MainCategoryWithSub & {
  level: number;
  parentName?: string;
};



const flattenCategoriesRecursively = (
  cats: MainCategoryWithSub[],
  level: number,
  expandedCategories: Set<string>,
  parentName: string | null
): FlattenedCategory[] => {

  const flattened: FlattenedCategory[] = [];

  cats.forEach((cat) => {
    flattened.push({...cat, level, parentName: parentName || undefined});

    if (expandedCategories.has(cat.id) && cat.subCategories?.length) {
      flattened.push(
        ...flattenCategoriesRecursively(
          cat.subCategories,
          level + 1,
          expandedCategories,
          cat.name
        )
      );
    }
  });


  return flattened;
};


const getAllCategoryIds = (cats: MainCategoryWithSub[]): string[] => {
  const ids: string[] = [];
  cats.forEach((cat) => {
    ids.push(cat.id);
    if (cat.subCategories?.length) {
      ids.push(...getAllCategoryIds(cat.subCategories));
    }
  });
  return ids;
};

// =================================================================

export default function CategoryManager({categories}: CategoryManagerProps) {

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(categories.map((cat) => cat.id))
  );


  const toggleCategory = (categoryId: string) => {

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
    () => flattenCategoriesRecursively(categories, 0, expandedCategories, null),
    [categories, expandedCategories]
  );


  const columns = useMemo(
    () => [

      {
        header: getAdminHeader('name'),
        cell: (category: FlattenedCategory) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasChildren =
            category.subCategories && category.subCategories.length > 0;


          if (category.level === 0) {
            return (
              <div className='flex  items-center group transition-all duration-100'>
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
                    <div className='w-4 mr-2 flex-shrink-0' />
                  )}
                  <span className='font-semibold uppercase'>
                    {category.name}
                  </span>
                </div>
                {hasChildren && (
                  <span className='ml-2 text-xs text-gray-500'>
                    ({category.subCategories?.length || 0})
                  </span>
                )}
              </div>
            );
          }


          return (
            <div className='flex  items-center relative'>

              <div
                style={{width: `${(category.level - 1) * 24}px`}}
                className='flex-shrink-0 h-1 ml-10'
              />

              <div className='w-3 absolute -top-0.5 left-10 h-3 border-l border-b border-gray-400 rounded-bl-lg  flex-shrink-0' />

              <div className='flex items-center text-gray-900'>
                <div
                  className='flex items-center cursor-pointer hover:text-black'
                  onClick={() => hasChildren && toggleCategory(category.id)}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FiChevronDown
                        size={20}
                        strokeWidth={1}
                        className='mr-1 text-gray-500  flex-shrink-0'
                      />
                    ) : (
                      <FiChevronRight
                        size={20}
                        strokeWidth={1}
                        className='mr-1 text-gray-500 flex-shrink-0'
                      />
                    )
                  ) : (
                    <div className='w-4 mr-1 flex-shrink-0' />
                  )}
                  <span className='normal-case'>{category.name}</span>
                </div>
                {category.parentName && (
                  <div className='ml-2 flex items-center text-xs text-gray-400 '>
                    <FiArrowRight size={12} className='inline mr-1.5' />
                    <span className='italic'>{category.parentName}</span>
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
        header: getAdminHeader('isActive'),
        cell: (category: FlattenedCategory) => (
          <div>{category.isActive ? 'Aktiv' : 'Inaktiv'}</div>
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
      label: <FiEdit size={16} />, 
      key: 'edit', 
      onClick: (category: FlattenedCategory) =>
        console.log('Redigera kategori:', category), 
    },
    {
      label: <FiTrash size={16} />,
      key: 'delete',
      onClick: (category: FlattenedCategory) =>
        console.log('Ta bort kategori:', category),
    },
  ];


  const getRowClassName = (category: FlattenedCategory) => {

    if (category.level === 0) {
      return `bg-gray-100 text-sm border-b border-gray-300 hover:bg-blue-50 transition-colors`;
    }

    return `bg-white text-[13px] border-b border-gray-200 hover:bg-gray-50`;
  };


  const expandAll = () =>
    setExpandedCategories(new Set(getAllCategoryIds(categories)));

  const collapseAll = () => setExpandedCategories(new Set());


  return (
    <div>

      <div className='mb-4 flex items-center gap-2'>
        <button
          onClick={expandAll}
          className='px-3 py-1 text-sm bg-blue-100 hover:bg-blue-200 text-gray-700 rounded transition-colors'
        >
          Expand All
        </button>
        <button
          onClick={collapseAll}
          className='px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors'
        >
          Collapse All
        </button>
        <div className='text-sm text-gray-500 self-center ml-auto'>
          {expandedCategories.size} expanderade
        </div>
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
