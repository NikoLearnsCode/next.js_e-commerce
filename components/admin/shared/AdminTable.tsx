type ColumnDef<T> = {
  header: string;
  cell: (item: T) => React.ReactNode;
  headerClassName?: string;
};

interface ReusableTableProps<T extends {id: string | number}> {
  data: T[];
  columns: ColumnDef<T>[];
}

export default function ReusableTable<T extends {id: string | number}>({
  data,
  columns,
}: ReusableTableProps<T>) {
  return (
    <div className='bg-white rounded-lg py-14 px-10 '>
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
            </tr>
          </thead>
          <tbody className='bg-white divide-y divide-gray-100'>
            {data.map((item) => (
              <tr key={item.id} className='hover:bg-gray-50'>
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className='px-6 py-2.5 whitespace-nowrap'
                  >
                    {column.cell(item)}
                  </td>
                ))}
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
