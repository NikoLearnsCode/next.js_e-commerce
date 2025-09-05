'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Category} from '@/lib/types/category';
import {useAdmin} from '@/context/AdminContextProvider';
import {
  categoryFormSchema,
  CategoryFormData,
  CATEGORY_TYPE_OPTIONS,
} from '@/lib/form-validators';
import {useEffect} from 'react';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {Button} from '@/components/shared/ui/button';
import {CheckboxOption} from '@/components/shared/ui/CheckboxOption';
import {generateSlug} from '@/utils/slug-generator';
import CustomSelect from '../shared/CustomSelect';
import {
  findAllPossibleParentCategories,
  findCategoryById,
} from '@/utils/category-helper';

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
    formState: {errors, isDirty /* , isValid */},
    setValue,
    watch,
    reset,
    // trigger,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      type: undefined,
      displayOrder: 0,
      isActive: true,
      parentId: null,
    },
  });

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        type: initialData.type as
          | 'MAIN-CATEGORY'
          | 'SUB-CATEGORY'
          | 'CONTAINER',
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
        parentId: initialData.parentId || null,
      });
    }
  }, [mode, initialData, reset]);

  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && mode === 'create') {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, mode]);

  const watchedType = watch('type');
  const isParentSelectionEnabled =
    watchedType &&
    (watchedType === 'CONTAINER' || watchedType === 'SUB-CATEGORY');

  useEffect(() => {
    // trigger('parentId');

    if (watchedType === 'MAIN-CATEGORY' && watch('parentId') !== null) {
      setValue('parentId', null, {shouldValidate: true});
    }

    // Rensa ett ogiltigt val om listan med föräldrar ändras
    const currentParentId = watch('parentId');
    if (currentParentId && isParentSelectionEnabled) {
      const validParents = getValidParentOptions();
      const isCurrentParentValid = validParents.some(
        (p) => p.value === currentParentId
      );
      if (!isCurrentParentValid) {
        setValue('parentId', null, {shouldValidate: true});
      }
    }
  }, [watchedType, isParentSelectionEnabled, /* trigger, */ setValue, watch]);

  const getValidParentOptions = () => {
    if (!watchedType || watchedType === 'MAIN-CATEGORY') {
      return [];
    }
    const allPossibleParents = findAllPossibleParentCategories(categories);
    let filteredParents = allPossibleParents;
    if (watchedType === 'CONTAINER') {
      filteredParents = allPossibleParents.filter((parent) => {
        const parentCategory = findCategoryById(categories, parent.value);
        return parentCategory?.type === 'MAIN-CATEGORY';
      });
    }
    return filteredParents;
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

  const availableParents = getValidParentOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div className='flex-1 space-y-4 overflow-y-auto pt-8  pr-5 -mr-5'>
        {/* Select 1 - Kategori-typ */}
        <div>
          <label className='block text-sm sr-only font-medium text-gray-700 mb-1'>
            Kategori-typ *
          </label>
          <CustomSelect
            hasError={!!errors.type}
            {...register('type')}
            value={watch('type')}
            options={CATEGORY_TYPE_OPTIONS}
            placeholder='Välj kategori-typ *'
            disabled={mode === 'edit'}
          />
          {errors.type && (
            <p className='text-red-500 font-medium text-xs mt-1 ml-1'>
              {errors.type.message}
            </p>
          )}
        </div>

        {/* Select 2 - Föräldrakategori  */}
        <div>
          <label className='block text-sm sr-only font-medium text-gray-700 mb-1'>
            Föräldrakategori
            {!watchedType && (
              <span className='text-gray-500 text-xs ml-2'>
                (Välj först kategori-typ)
              </span>
            )}
          </label>

          <CustomSelect
            hasError={!!errors.parentId}
            {...register('parentId')}
            value={watch('parentId') || ''}
            options={availableParents.map((parent) => ({
              value: parent.value,
              label: parent.label,
            }))}
            placeholder={
              !watchedType
                ? 'Välj först en kategori-typ ovan *'
                : !isParentSelectionEnabled
                  ? 'Ej tillämpligt'
                  : watchedType === 'CONTAINER'
                    ? 'Välj huvudkategori som förälder *'
                    : 'Välj föräldrakategori *'
            }
            disabled={!isParentSelectionEnabled || mode === 'edit'}
          />

          {errors.parentId && (
            <p className='text-red-500 font-medium text-xs ml-1 mt-1'>
              {errors.parentId.message}
            </p>
          )}
        </div>

        {/* name, slug, displayOrder, isActive */}
        <FloatingLabelInput
          {...register('name')}
          id='category-name'
          label='Kategorinamn *'
          type='text'
          hasError={!!errors.name}
          errorMessage={errors.name?.message}
        />

        <FloatingLabelInput
          {...register('slug')}
          id='category-slug'
          label='Slug *'
          type='text'
          value={watch('slug')}
          hasError={!!errors.slug}
          errorMessage={errors.slug?.message}
        />

        <FloatingLabelInput
          {...register('displayOrder')}
          id='category-display-order'
          label='Sorteringsordning'
          type='number'
          min='0'
          hasError={!!errors.displayOrder}
          errorMessage={errors.displayOrder?.message}
        />

        <CheckboxOption
          svgClassName='w-5 h-5 '
          className=' ml-0.5 w-10 h-6 '
          {...register('isActive')}
          labelClassName={`font-medium text-sm normal-case  ${watch('isActive') ? 'text-black' : 'text-red-900/80'}`}
          id='category-is-active'
          label={watch('isActive') ? 'Aktiv' : 'Inaktiv'}
          checked={watch('isActive')}
        />
      </div>

      <div className='flex  gap-3 pt-4  pb-6'>
        <Button
          type='submit'
          disabled={
            isLoading /* || !isValid */ || (mode === 'edit' && !isDirty)
          }
          className=' h-13 mt-0 w-full'
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
          className='w-full h-13 mt-0'
        >
          Avbryt
        </Button>
      </div>
    </form>
  );
}
