'use client';

import {useState, useMemo} from 'react';

import {
  FiEdit,
  FiTrash,
  FiChevronDown,
  FiChevronRight,
  FiCornerLeftUp,
  FiChevronUp,
} from 'react-icons/fi';

import AdminTable from '../shared/AdminTable';
import {
  MainCategoryWithSub,
  SubCategory,
  SubSubCategory,
} from '@/lib/validators';
import {formatDateForAdmin, getAdminHeader} from '@/utils/helpers';

type CategoryManagerProps = {
  categories: MainCategoryWithSub[];
};

type FlattenedCategory = (
  | MainCategoryWithSub
  | (SubCategory & {subSubCategories?: SubSubCategory[]})
  | SubSubCategory
) & {
  level: number;
  parentName?: string;
};

/**
 * Plattar ut den hierarkiska kategoristrukturen till en plan lista för tabellrendering.
 * Använder manuell iteration istället för rekursion för bättre prestanda och enkelhet.
 * @param cats - Arrayen av huvudkategorier att platta ut.
 * @param expandedCategories - Ett Set med IDn för de kategorier som användaren har expanderat.
 * @returns En platt array av kategorier, redo att renderas i en tabell.
 */
const flattenCategoriesForTable = (
  cats: MainCategoryWithSub[],
  expandedCategories: Set<string>
): FlattenedCategory[] => {
  const flattened: FlattenedCategory[] = [];

  // Nivå 0: Huvudkategorier (Main Categories)
  cats.forEach((cat) => {
    flattened.push({...cat, level: 0, parentName: undefined});

    // Nivå 1: Underkategorier (Sub Categories) - bara om huvudkategori är expanderad
    if (expandedCategories.has(cat.id) && cat.subCategories?.length) {
      cat.subCategories.forEach((subCat) => {
        flattened.push({...subCat, level: 1, parentName: cat.name});

        // Nivå 2: Under-underkategorier (SubSub Categories) - bara om underkategori är expanderad
        if (
          expandedCategories.has(subCat.id) &&
          subCat.subSubCategories?.length
        ) {
          subCat.subSubCategories.forEach((subSubCat) => {
            flattened.push({...subSubCat, level: 2, parentName: subCat.name});
          });
        }
      });
    }
  });

  return flattened;
};

/**
 * Hämtar alla IDn från den hierarkiska kategori-arrayen med manuell iteration.
 * Används för "Expand All"-knappen.
 * @param cats - Arrayen av kategorier att söka igenom.
 * @returns En array med alla funna kategori-IDn.
 */
const getAllCategoryIds = (cats: MainCategoryWithSub[]): string[] => {
  const ids: string[] = [];

  // Nivå 0: Huvudkategorier
  cats.forEach((cat) => {
    ids.push(cat.id);

    // Nivå 1: Underkategorier
    if (cat.subCategories?.length) {
      cat.subCategories.forEach((subCat) => {
        ids.push(subCat.id);

        // Nivå 2: Under-underkategorier
        if (subCat.subSubCategories?.length) {
          subCat.subSubCategories.forEach((subSubCat) => {
            ids.push(subSubCat.id);
          });
        }
      });
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

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    () => {
      // Vi använder en funktion här för att kunna ha lite logik för startvärdet.
      // Denna funktion körs bara EN GÅNG när komponenten skapas.

      // 1. Säkerställ att 'categories'-arrayen faktiskt innehåller något.
      if (categories && categories.length > 0) {
        // 2. Om den gör det, skapa ett nytt Set som BARA innehåller ID:t
        //    från det allra första objektet i arrayen.
        return new Set([
          categories[0].id,
          categories[0].subCategories![2].id,
          categories[0].subCategories![2].subSubCategories![0].id, 
          /* categories[0].id,
          categories[0].subCategories![0].id,
          categories[0].subCategories![0].subSubCategories![0].id, */
        ]);
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
    () => flattenCategoriesForTable(categories, expandedCategories),
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
            category.level === 0
              ? (category as MainCategoryWithSub).subCategories &&
                (category as MainCategoryWithSub).subCategories!.length > 0
              : category.level === 1
                ? (
                    category as SubCategory & {
                      subSubCategories?: SubSubCategory[];
                    }
                  ).subSubCategories &&
                  (
                    category as SubCategory & {
                      subSubCategories?: SubSubCategory[];
                    }
                  ).subSubCategories!.length > 0
                : false; // subSubCategories har inga barn

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
                    <div className='w-5 mr-2 flex-shrink-0' />
                  )}
                  <span className='font-semibold uppercase'>
                    {category.name}
                  </span>
                </div>
                {hasChildren && category.level === 0 && (
                  <span className='ml-2 text-xs text-gray-700'>
                    (
                    {(category as MainCategoryWithSub).subCategories?.length ||
                      0}
                    )
                  </span>
                )}
              </div>
            );
          }

          // Om det är en underkategori (nivå > 0), rendera den med en L-formad koppling.
          return (
            <div className='flex relative '>
              {/* 1. Tom div som skapar indraget för djupare nivåer. */}
              <div
                style={{width: `${(category.level - 1) * 45}px`}}
                className='flex-shrink-0 h-1 ml-8'
              />
              {/* 2. Div som skapar den L-formade kopplingen med CSS-borders. */}
              {category.level === 2 && category.parentName && (
                <FiCornerLeftUp
                  size={14}
                  strokeWidth={1.5}
                  className='text-gray-500 flex-shrink-0 ml-2'
                />
              )}
              {/* 3. Det faktiska innehållet för raden. */}
              <div className='flex items-center  text-gray-900'>
                <div
                  className={`flex items-center  ${hasChildren ? 'cursor-pointer hover:text-black' : ''}`}
                  onClick={() => hasChildren && toggleCategory(category.id)}
                >
                  {hasChildren ? (
                    isExpanded ? (
                      <FiChevronDown
                        size={20}
                        strokeWidth={1}
                        className='mr-4  text-black  flex-shrink-0'
                      />
                    ) : (
                      <FiChevronUp
                        size={20}
                        strokeWidth={1}
                        className='mr-4  text-gray-500  flex-shrink-0'
                      />
                    )
                  ) : (
                    <div className='w-5 mr-4 flex-shrink-0' />
                  )}
                  <span className='normal-case'>{category.name}</span>
                </div>
                {category.level === 1 && category.parentName && (
                  <div className='ml-2 flex items-center text-xs text-gray-500'>
                    <span className='italic'>({category.parentName})</span>
                  </div>
                )}
                {/* Visa föräldrakategori för subSubCategories (nivå 2) */}
                {category.level === 2 && category.parentName && (
                  <div className='ml-2 flex items-center text-xs text-gray-500'>
                    <span className='italic lowercase'>
                      ({category.parentName})
                    </span>
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
        header: 'Sortering',
        cell: (category: FlattenedCategory) => (
          <div>{category.displayOrder}</div>
        ),
      },
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
      label: <FiEdit size={16} className='text-gray-600 hover:text-gray-900' />, // Ikonen som visas.
      key: 'edit', // En unik nyckel för React.
      onClick: (category: FlattenedCategory) =>
        console.log('Redigera kategori:', category), // Funktion som körs vid klick.
    },
    {
      label: <FiTrash size={16} className='text-gray-600 hover:text-gray-900' />,
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
      return `bg-gray-50 text-sm border-b   transition-colors ${
        expandedCategories.has(category.id)
          ? 'bg-gray-300 hover:bg-gray-300/80 border-gray-300'
          : 'bg-white hover:bg-gray-50 border-gray-200'
      }`;
    }
    // Ge subCategories en vit bakgrund.
    if (category.level === 1) {
      return `bg-white text-[13px] border-b  hover:bg-gray-50 ${
        expandedCategories.has(category.id)
          ? 'bg-gray-200 hover:bg-gray-200/80 border-gray-300'
          : 'bg-white border-gray-100'
      }`;
    }
    // Ge subSubCategories en ljusare bakgrund för att skilja dem från subCategories.
    return `bg-gray-200 text-[12px] border-b border-gray-300 hover:bg-gray-200/80`;
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
