// components/admin/CategoryForm.tsx

'use client';

import {Category} from '@/lib/types/category';
import {useAdmin} from '@/context/AdminContextProvider';

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialData?: Category | null;
};

export default function CategoryForm({mode, initialData}: CategoryFormProps) {
  const {createCategory, updateCategory, closeSidebar, isLoading} = useAdmin();

  // TODO: Implementera category form med react-hook-form
  // TODO: Lägg till category form validator schema
  // TODO: Hantera parent/child relationer
  // TODO: Implementera dropdown för parent category
  // TODO: Lägg till fält för: name, slug, type, displayOrder, isActive

 /*  const handleSubmit = async (data: any) => {
    try {
      if (mode === 'edit' && initialData) {
        await updateCategory(initialData.id, data);
      } else {
        await createCategory(data);
      }
    } catch (error) {
      console.error('Category form submission error:', error);
    }
  }; */

  return (
    <div className='p-4'>
      <h3 className='text-lg font-semibold mb-4'>
        {mode === 'edit' ? 'Redigera kategori' : 'Skapa ny kategori'}
      </h3>

      {/* TODO: Implementera faktisk form här */}
      <div className='text-gray-600'>
        <p>CategoryForm kommer att implementeras här</p>
        <p>Mode: {mode}</p>
        {initialData && <p>Redigerar: {initialData.name}</p>}
      </div>

      <div className='mt-4 flex gap-2'>
        <button
          className='px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50'
          disabled={isLoading}
          // onClick={() => handleSubmit({})}
        >
          {isLoading
            ? mode === 'edit'
              ? 'Uppdaterar...'
              : 'Sparar...'
            : mode === 'edit'
              ? 'Uppdatera kategori'
              : 'Spara kategori'}
        </button>
        <button
          className='px-4 py-2 border border-gray-300 rounded'
          onClick={closeSidebar}
          disabled={isLoading}
        >
          Avbryt
        </button>
      </div>
    </div>
  );
}
