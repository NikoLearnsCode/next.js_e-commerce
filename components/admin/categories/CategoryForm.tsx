// components/admin/CategoryForm.tsx

'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Category} from '@/lib/types/category';
import {useAdmin} from '@/context/AdminContextProvider';
import {categoryFormSchema, CategoryFormData} from '@/lib/form-validators';
import {useEffect} from 'react';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {Button} from '@/components/shared/ui/button';
import {CheckboxOption} from '@/components/shared/ui/CheckboxOption';
import {generateSlug} from '@/utils/slug-generator';
import CustomSelect from '../shared/CustomSelect';

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialData?: Category | null;
};

export default function CategoryForm({mode, initialData}: CategoryFormProps) {
  const {createCategory, updateCategory, closeSidebar, isLoading, categories} =
    useAdmin();

  const {
    register,
    handleSubmit,
    formState: {errors/* , isValid */},
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      type: 'SUB-CATEGORY',
      displayOrder: 0,
      isActive: true,
      parentId: null,
    },
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        type: initialData.type,
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
        parentId: initialData.parentId || null,
      });
    }
  }, [mode, initialData, reset]);

  // Auto-generate slug from name
  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && mode === 'create') {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, mode]);

  // intialt
  const getAvailableParentCategories = () => {
    const flattenCategories = (
      cats: typeof categories,
      level = 0
    ): Array<{id: number; name: string; level: number}> => {
      let result: Array<{id: number; name: string; level: number}> = [];
      cats.forEach((cat) => {
        // Exclude current category when editing
        if (mode === 'edit' && initialData && cat.id === initialData.id) {
          return;
        }
        result.push({id: cat.id, name: cat.name, level});
        if (cat.children) {
          result.push(...flattenCategories(cat.children, level + 1));
        }
      });
      return result;
    };
    return flattenCategories(categories);
  };

  const onSubmit = async (data: CategoryFormData) => {
    try {
      if (mode === 'edit' && initialData) {
        await updateCategory(initialData.id.toString(), data);
      } else {
        await createCategory(data);
      }
    } catch (error) {
      console.error('Category form submission error:', error);
    }
  };

  const availableParents = getAvailableParentCategories();

  return (
    <div className=''>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {/* Name */}
        <FloatingLabelInput
          {...register('name')}
          id='category-name'
          label='Kategorinamn *'
          as='input'
          type='text'
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
        />

        {/* Slug */}
        <FloatingLabelInput
          {...register('slug')}
          id='category-slug'
          label='Slug *'
          as='input'
          type='text'
          value={watch('slug')}
          hasError={!!errors.slug}
          errorMessage={errors.slug?.message}
        />

        {/* Type */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Kategori-typ *
          </label>
          <CustomSelect
            {...register('type')}
            options={[
              {value: 'MAIN-CATEGORY', label: 'Huvudkategori'},
              {value: 'SUB-CATEGORY', label: 'Underkategori'},
              {value: 'CONTAINER', label: 'Container'},
              {value: 'COLLECTION', label: 'Collection'},
            ]}
            placeholder='Välj kategori-typ...'
          />
          {errors.type && (
            <p className='text-red-500 text-sm mt-1'>{errors.type.message}</p>
          )}
        </div>

        {/* Parent Category */}
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-1'>
            Föräldrakategori
          </label>
          <CustomSelect
            {...register('parentId', {
              setValueAs: (value) => (value === '' ? null : parseInt(value)),
            })}
            options={[
              {value: '', label: 'Ingen förälder (toppnivå)'},
              ...availableParents.map((parent) => ({
                value: parent.id,
                label: `${'  '.repeat(parent.level)}${parent.name}`,
              })),
            ]}
            placeholder='Välj föräldrakategori...'
          />

          {errors.parentId && (
            <p className='text-red-500 text-sm mt-1'>
              {errors.parentId.message}
            </p>
          )}
        </div>

        {/* Display Order */}
        <FloatingLabelInput
          {...register('displayOrder')}
          id='category-display-order'
          label='Sorteringsordning'
          as='input'
          type='number'
          min='0'
          hasError={!!errors.displayOrder}
          errorMessage={errors.displayOrder?.message}
        />

        {/* Is Active */}
        <CheckboxOption
          id='category-is-active'
          label='Aktiv kategori'
          checked={watch('isActive')}
          onChange={() => setValue('isActive', !watch('isActive'))}
        />

        {/* Submit Buttons */}
        <div className='flex gap-3 pt-4'>
          <Button
            type='submit'
            disabled={isLoading /* || !isValid */}
            className='flex-1'
          >
            {isLoading
              ? mode === 'edit'
                ? 'Uppdaterar...'
                : 'Sparar...'
              : mode === 'edit'
                ? 'Uppdatera kategori'
                : 'Skapa kategori'}
          </Button>
          <Button
            type='button'
            variant='outline'
            onClick={closeSidebar}
            disabled={isLoading}
          >
            Avbryt
          </Button>
        </div>
      </form>
    </div>
  );
}
