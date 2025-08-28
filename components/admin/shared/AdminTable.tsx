'use client';

import {twMerge} from 'tailwind-merge';

type ColumnDef<T> = {
  header: string;
  cell: (item: T) => React.ReactNode;
  headerClassName?: string;
};

interface ReusableTableProps<T extends {id: string | number}> {
  data: T[];
  columns: ColumnDef<T>[];
  actions?: {
    label: React.ReactNode;
    onClick: (item: T) => void;
    key: string;
  }[];
  getRowClassName?: (item: T) => string;
}

export default function ReusableTable<T extends {id: string | number}>({
  data,
  columns,
  actions,
  getRowClassName,
}: ReusableTableProps<T>) {
  return (
    <div className='bg-white rounded-lg py-14 text-sm px-10 '>
      <div className='overflow-x-auto  shadow-sm border'>
        <table className='min-w-full divide-y divide-gray-00'>
          <thead className='bg-gray-50'>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className={`px-6 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.headerClassName || ''
                  }`}
                >
                  {column.header}
                </th>
              ))}
              {actions && (
                <th className='px-6 py-2.5 flex justify-center  font-medium text-gray-500 uppercase tracking-wider'>
                  Åtgärder
                </th>
              )}
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {data.map((item) => (
              <tr
                key={item.id}
                className={twMerge(
                  getRowClassName ? getRowClassName(item) : 'hover:bg-gray-50'
                )}
              >
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className='px-6 py-2.5 whitespace-nowrap'
                  >
                    {column.cell(item)}
                  </td>
                ))}
                {actions && (
                  <td className='px-6 py-2.5 flex justify-center whitespace-nowrap'>
                    {actions.map((action) => (
                      <button
                        key={action.key}
                        onClick={() => action.onClick(item)}
                        className={`px-3   text-xs font-syne hover:underline  uppercase font-semibold cursor-pointer text-black ${actions.length > 1 ? 'first:border-r border-gray-400' : ''}`}
                      >
                        {action.label}
                      </button>
                    ))}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {data.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-gray-500'>Inga data hittades</p>
          </div>
        )}
      </div>
    </div>
  );
}
