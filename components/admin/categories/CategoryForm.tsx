// components/admin/CategoryForm.tsx

'use client';

import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Category} from '@/lib/types/category';
import {useAdmin} from '@/context/AdminContextProvider';
import {
  categoryFormSchema,
  CategoryFormData,
  CREATABLE_CATEGORY_TYPES,
  isCreatableCategoryType,
} from '@/lib/form-validators';
import {useEffect} from 'react';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {Button} from '@/components/shared/ui/button';
import {CheckboxOption} from '@/components/shared/ui/CheckboxOption';
import {generateSlug} from '@/utils/slug-generator';
import CustomSelect from '../shared/CustomSelect';
import {findAllPossibleParentCategories} from '@/utils/category-helper';

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
    formState: {errors /* , isValid */},
    setValue,
    watch,
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      type: undefined, // Ingen typ vald initialt - användaren MÅSTE välja
      displayOrder: 0,
      isActive: true,
      parentId: null,
    },
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      const categoryType = isCreatableCategoryType(initialData.type)
        ? initialData.type
        : 'SUB-CATEGORY';

      reset({
        name: initialData.name,
        slug: initialData.slug,
        type: categoryType,
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

  // Watch category type for conditional parent logic
  const watchedType = watch('type');

  // Determine if parent selection should be enabled
  // Endast aktivera om typ är vald OCH är CONTAINER eller SUB-CATEGORY
  const isParentSelectionEnabled =
    watchedType &&
    (watchedType === 'CONTAINER' || watchedType === 'SUB-CATEGORY');

  // Hantera parentId baserat på vald kategori-typ
  useEffect(() => {
    const currentParentId = watch('parentId');

    // Rensa alltid för MAIN-CATEGORY eller om ingen typ är vald
    if (watchedType === 'MAIN-CATEGORY') {
      if (currentParentId !== null) {
        setValue('parentId', null);
      }
      return;
    }

    // För CONTAINER och SUB-CATEGORY: kontrollera om nuvarande val är giltigt
    if (
      currentParentId &&
      (watchedType === 'CONTAINER' || watchedType === 'SUB-CATEGORY')
    ) {
      const validParents = getValidParentOptions();
      const isCurrentParentValid = validParents.some(
        (parent) => parent.value === currentParentId
      );

      if (!isCurrentParentValid) {
        setValue('parentId', null);
      }
    }
  }, [watchedType, setValue, watch]);

  // DRY: Helper för kategori-typ alternativ (exkluderar COLLECTION)
  const getCategoryTypeOptions = () => {
    const typeLabels = {
      'MAIN-CATEGORY': 'Huvudkategori',
      'SUB-CATEGORY': 'Underkategori',
      CONTAINER: 'CONTAINER',
    } as const;

    return CREATABLE_CATEGORY_TYPES.map((type) => ({
      value: type,
      label: typeLabels[type],
    }));
  };

  // Helper för att hitta kategori i träd-struktur
  const findCategoryById = (
    cats: typeof categories,
    id: number
  ): (typeof categories)[0] | null => {
    for (const cat of cats) {
      if (cat.id === id) return cat;
      if (cat.children) {
        const found = findCategoryById(cat.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  // Hämta giltiga föräldra-alternativ baserat på vald typ
  const getValidParentOptions = () => {
    if (!watchedType || watchedType === 'MAIN-CATEGORY') {
      return []; // MAIN-CATEGORY kan inte ha förälder
    }

    const allPossibleParents = findAllPossibleParentCategories(categories);

    // Filtrera baserat på kategori-typ
    let filteredParents = allPossibleParents;

    if (watchedType === 'CONTAINER') {
      // CONTAINER kan endast ha MAIN-CATEGORY som förälder
      filteredParents = allPossibleParents.filter((parent) => {
        const parentCategory = findCategoryById(categories, parent.value);
        return parentCategory?.type === 'MAIN-CATEGORY';
      });
    }
    // SUB-CATEGORY kan ha både MAIN-CATEGORY och CONTAINER som förälder

    // Exkludera nuvarande kategori vid redigering
    if (mode === 'edit' && initialData) {
      filteredParents = filteredParents.filter(
        (parent) => parent.value !== initialData.id
      );
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

  // Hämta föräldra-alternativ (kommer att uppdateras när watchedType ändras)
  const availableParents = getValidParentOptions();

  return (
    <div className=''>
      <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
        {/* Type */}
        <div>
          <label className='block text-sm sr-only font-medium text-gray-700 mb-1'>
            Kategori-typ *
          </label>
          <CustomSelect
            {...register('type')}
            value={watch('type')}
            options={getCategoryTypeOptions()}
            placeholder='Välj kategori-typ *'
          />
          {errors.type && (
            <p className='text-red-500 text-sm mt-1'>{errors.type.message}</p>
          )}
        </div>

        {/* Parent Category */}
        <div>
          <label className='block text-sm sr-only font-medium text-gray-700 mb-1'>
            Föräldrakategori
            {!watchedType && (
              <span className='text-gray-500 text-xs ml-2'>
                (Välj först kategori-typ)
              </span>
            )}
            {watchedType && !isParentSelectionEnabled && (
              <span className='text-gray-500 text-xs ml-2'>
                (Inte tillämpligt för huvudkategorier)
              </span>
            )}
          </label>
          <CustomSelect
            {...register('parentId', {
              setValueAs: (value) => {
                // För MAIN-CATEGORY, sätt alltid till null
                if (watchedType === 'MAIN-CATEGORY') {
                  return null;
                }
                // För andra typer, konvertera normalt
                return value === '' ? null : Number(value);
              },
            })}
            value={
              watchedType === 'MAIN-CATEGORY' ? '' : watch('parentId') || ''
            }
            options={[
              // SUB-CATEGORY och CONTAINER MÅSTE ha en förälder - inget "ingen förälder" alternativ
              ...availableParents.map((parent) => ({
                value: parent.value,
                label: parent.label,
              })),
            ]}
            placeholder={
              !watchedType
                ? 'Välj först en kategori-typ ovan'
                : !isParentSelectionEnabled
                  ? ''
                  : watchedType === 'CONTAINER'
                    ? 'Välj huvudkategori som förälder *'
                    : 'Välj föräldrakategori *'
            }
            disabled={!isParentSelectionEnabled}
          />

          {errors.parentId && watchedType !== 'MAIN-CATEGORY' &&  (
            <p className='text-red-500 text-sm mt-1'>
              {errors.parentId.message}
            </p>
          )}
        </div>

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
