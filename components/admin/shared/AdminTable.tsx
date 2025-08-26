// Definierar typen för en enskild kolumnkonfiguration.
// Vi använder generics (<T>) så att komponenten kan hantera vilken typ av data som helst.
type ColumnDef<T> = {
  header: string; // Rubriken som visas i <thead>
  // En funktion som tar emot ett item (en rads data) och returnerar
  // JSX som ska renderas i cellen (<td>).
  cell: (item: T) => React.ReactNode;
  // Valfri klass för <th>-elementet för t.ex. textjustering
  headerClassName?: string;
};

// Props för vår generella tabellkomponent.
// Den måste veta vilken typ av data den hanterar (<T>) och kräver en unik nyckel (id).
interface ReusableTableProps<T extends {id: string | number}> {
  data: T[];
  columns: ColumnDef<T>[];
}

export default function ReusableTable<T extends {id: string | number}>({
  data,
  columns,
}: ReusableTableProps<T>) {
  return (
    <div className='bg-white rounded-lg  px-10 '>
      <div className='overflow-x-auto shadow-sm border'>
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
                {/* För varje rad, mappa igenom kolumndefinitionerna för att rendera cellerna */}
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className='px-6 py-2.5 whitespace-nowrap'
                  >
                    {/* Anropa cell-funktionen för att få rätt JSX för denna specifika cell */}
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
