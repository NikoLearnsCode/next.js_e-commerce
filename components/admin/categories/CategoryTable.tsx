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

/**
 * @param cats - Arrayen av kategorier att platta ut.
 * @param level - Den nuvarande nästlingsnivån (startar på 0).
 * @param expandedCategories - Ett Set med IDn för de kategorier som användaren har expanderat.
 * @param parentName - Namnet på föräldrakategorin, skickas med i rekursiva anrop.
 * @returns En platt array av kategorier, redo att renderas i en tabell.
 */
const flattenCategoriesRecursively = (
  cats: MainCategoryWithSub[],
  level: number,
  expandedCategories: Set<string>,
  parentName: string | null
): FlattenedCategory[] => {
  const flattened: FlattenedCategory[] = [];

  // Loopar igenom varje kategori på den nuvarande nivån.
  cats.forEach((cat) => {
    // 1. Lägger till den nuvarande kategorin i listan, tillsammans med dess nivå och förälderns namn.
    flattened.push({...cat, level, parentName: parentName || undefined});

    // 2. Kontrollerar om kategorin är expanderad OCH om den faktiskt har underkategorier.
    if (expandedCategories.has(cat.id) && cat.subCategories?.length) {
      // 3. Om ja, anropa samma funktion igen (rekursion) för underkategorierna.
      //    - Öka nivån med 1.
      //    - Skicka med den *nuvarande* kategorins namn som förälder.
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

  // Returnerar den färdiga, platta listan.
  return flattened;
};

/**
 * Hämtar rekursivt alla IDn från en hierarkisk kategori-array.
 * Används för "Expand All"-knappen.
 * @param cats - Arrayen av kategorier att söka igenom.
 * @returns En array med alla funna kategori-IDn.
 */
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
// HUVUDKOMPONENT: CategoryManager
// =================================================================

export default function CategoryManager({categories}: CategoryManagerProps) {
  // State-variabel som håller reda på vilka kategorier som är expanderade.
  // Vi använder ett 'Set' eftersom det är väldigt snabbt att kolla om ett ID finns (med .has()).
  // Initialt är alla huvudkategorier expanderade för en bra användarupplevelse.
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      // Vi använder en funktion här för att kunna ha lite logik för startvärdet.
      // Denna funktion körs bara EN GÅNG när komponenten skapas.

      // 1. Säkerställ att 'categories'-arrayen faktiskt innehåller något.
      if (categories && categories.length > 0) {
        // 2. Om den gör det, skapa ett nytt Set som BARA innehåller ID:t
        //    från det allra första objektet i arrayen.
        return new Set([categories[0].id]);
      }

      // 3. Om 'categories' är tom, returnera ett tomt Set.
      return new Set();
    }
  );

  /**
   * Funktion för att växla (expandera/kollapsa) en specifik kategori.
   * @param categoryId - ID på kategorin som ska växlas.
   */
  const toggleCategory = (categoryId: string) => {
    // Använder en callback-funktion i setState för att säkert kunna jobba med föregående state.
    setExpandedCategories((prev) => {
      const newSet = new Set(prev); // Skapa en kopia för att undvika att mutera state direkt.
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId); // Om ID:t redan finns, ta bort det.
      } else {
        newSet.add(categoryId); // Annars, lägg till det.
      }
      return newSet;
    });
  };

  // Använder 'useMemo' för att beräkna den platta listan.
  // Denna beräkning körs endast om 'categories' (grund-datan) eller 'expandedCategories' ändras.
  // Detta förhindrar onödiga och potentiellt tunga beräkningar vid varje rendering.
  const flattenedCategories = useMemo(
    () => flattenCategoriesRecursively(categories, 0, expandedCategories, null),
    [categories, expandedCategories]
  );

  // Använder 'useMemo' för att definiera kolumnerna.
  // Detta görs för att inte skapa om hela denna (potentiellt stora) array vid varje rendering.
  // Beroende av `expandedCategories` eftersom `cell`-renderaren behöver veta om en rad är expanderad.
  const columns = useMemo(
    () => [
      // Definition för "Namn"-kolumnen.
      {
        header: 'Kategorier',
        headerClassName: 'pl-12',
        cell: (category: FlattenedCategory) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasChildren =
            category.subCategories && category.subCategories.length > 0;

          // Om det är en huvudkategori (nivå 0), rendera en enklare variant.
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

          // Om det är en underkategori (nivå > 0), rendera den med en L-formad koppling.
          return (
            <div className='flex  items-center relative'>
              {/* 1. Tom div som skapar indraget för djupare nivåer. */}
              <div
                style={{width: `${(category.level - 1) * 24}px`}}
                className='flex-shrink-0 h-1 ml-10'
              />
              {/* 2. Div som skapar den L-formade kopplingen med CSS-borders. */}
              <div className='w-3 absolute -top-0.5 left-10 h-3 border-l border-b border-gray-400 rounded-bl-lg  flex-shrink-0' />
              {/* 3. Det faktiska innehållet för raden. */}
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
      // Definition för "Slug"-kolumnen.
      {
        header: getAdminHeader('slug'),
        cell: (category: FlattenedCategory) => <div>{category.slug}</div>,
      },
      // Definition för "Status"-kolumnen.
      {
        header: getAdminHeader('isActive'),
        cell: (category: FlattenedCategory) => (
          <div>{category.isActive ? 'Aktiv' : 'Inaktiv'}</div>
        ),
      },
      // Definition för "Skapad"-kolumnen.
      {
        header: getAdminHeader('created_at'),
        cell: (category: FlattenedCategory) => (
          <div>{formatDateForAdmin(category.created_at)}</div>
        ),
      },
      // Definition för "Uppdaterad"-kolumnen.
      {
        header: getAdminHeader('updated_at'),
        cell: (category: FlattenedCategory) => (
          <div>{formatDateForAdmin(category.updated_at)}</div>
        ),
      },
    ],
    [expandedCategories]
  );

  // Definition av "Åtgärder" (knappar) som ska visas för varje rad.
  const actions = [
    {
      label: <FiEdit size={16} />, // Ikonen som visas.
      key: 'edit', // En unik nyckel för React.
      onClick: (category: FlattenedCategory) =>
        console.log('Redigera kategori:', category), // Funktion som körs vid klick.
    },
    {
      label: <FiTrash size={16} />,
      key: 'delete',
      onClick: (category: FlattenedCategory) =>
        console.log('Ta bort kategori:', category),
    },
  ];

  /**
   * Funktion som returnerar ett CSS-klassnamn för en tabellrad baserat på dess data.
   * @param category - Objektet för den aktuella raden.
   * @returns En sträng med Tailwind CSS-klasser.
   */
  const getRowClassName = (category: FlattenedCategory) => {
    // Ge huvudkategorier en annorlunda, mörkare bakgrund.
    if (category.level === 0) {
      return `bg-gray-50 text-sm border-b  border-gray-200  transition-colors ${
        expandedCategories.has(category.id) ? 'bg-gray-200' : 'bg-white hover:bg-gray-50'
      }`;
    }
    // Ge underkategorier en vit bakgrund.
    return `bg-white text-[13px] border-b border-gray-200 hover:bg-gray-50 `;
  };

  // Funktion för att expandera alla kategorier.
  const expandAll = () =>
    setExpandedCategories(new Set(getAllCategoryIds(categories)));
  // Funktion för att kollapsa alla kategorier.
  const collapseAll = () => setExpandedCategories(new Set());

  // Returnerar JSX som renderar komponenten.
  return (
    <div className=''>
      {/* Header-sektionen med knappar och information. */}
      <div className=' pb-1 flex items-center gap-2'>
        <button
          onClick={expandAll}
          className='p-2 text-sm cursor-pointer hover:underline text-gray-600 font-medium  font-syne  '
        >
          Expandera
        </button>
        <button
          onClick={collapseAll}
          className='p-2 text-sm cursor-pointer hover:underline text-gray-600 font-medium font-syne rounded transition-colors'
        >
          Kollapsa
        </button>
      </div>

      {/* Den återanvändbara tabellkomponenten. */}
      {/* Vi skickar med all data och konfiguration som props. */}
      <AdminTable
        data={flattenedCategories}
        columns={columns}
        actions={actions}
        getRowClassName={getRowClassName}
      />
    </div>
  );
}
