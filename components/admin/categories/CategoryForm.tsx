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
import {useEffect, useState} from 'react';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {Button} from '@/components/shared/ui/button';
import {CheckboxOption} from '@/components/shared/ui/CheckboxOption';
import {generateSlug} from '@/components/admin/utils/slug-generator';
import CustomSelect from '../shared/Select';
import {
  findCategoriesForDropdown,
  findCategoryById,
} from '@/components/admin/utils/admin.form-helpers';
import {UploadCloud} from 'lucide-react';
import FileInput from '../shared/FileInput';
import {uploadCategoryImages} from '@/actions/admin/admin.image-upload.actions';

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialData?: Category | null;
};

export default function CategoryForm({mode, initialData}: CategoryFormProps) {
  const {createCategory, updateCategory, closeSidebar, isLoading, categories} =
    useAdmin();

  // State för bilduppladdning
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string>('');
  const [mobilePreview, setMobilePreview] = useState<string>('');

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
      desktopImage: '',
      mobileImage: '',
    },
  });

  // Funktioner för bildhantering
  const handleDesktopImageSelect = (files: File[]) => {
    if (files && files[0]) {
      const file = files[0];
      setDesktopImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setDesktopPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMobileImageSelect = (files: File[]) => {
    if (files && files[0]) {
      const file = files[0];
      setMobileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setMobilePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearDesktopImage = () => {
    setDesktopImage(null);
    setDesktopPreview('');
  };

  const clearMobileImage = () => {
    setMobileImage(null);
    setMobilePreview('');
  };

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
        desktopImage: initialData.desktopImage || '',
        mobileImage: initialData.mobileImage || '',
      });

      // Sätt befintliga bilder för förhandsgranskning
      if (initialData.desktopImage) {
        setDesktopPreview(initialData.desktopImage);
      }
      if (initialData.mobileImage) {
        setMobilePreview(initialData.mobileImage);
      }
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
    const allPossibleParents = findCategoriesForDropdown(categories, [
      'MAIN-CATEGORY',
      'CONTAINER',
    ]);
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
      let finalData = {...data};

      // Ladda upp bilder om det är en MAIN-CATEGORY och bilder har valts
      if (data.type === 'MAIN-CATEGORY' && (desktopImage || mobileImage)) {
        try {
          const imageUrls = await uploadCategoryImages(
            desktopImage,
            mobileImage,
            data.slug
          );

          finalData.desktopImage = imageUrls.desktopImageUrl || '';
          finalData.mobileImage = imageUrls.mobileImageUrl || '';
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          alert(`Bilduppladdning misslyckades: ${uploadError}`);
          return;
        }
      }

      if (mode === 'edit' && initialData) {
        await updateCategory(initialData.id.toString(), finalData);
      } else {
        await createCategory(finalData);
      }
    } catch (error) {
      console.error('Category form submission error:', error);
    }
  };

  const availableParents = getValidParentOptions();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
      <div className='flex-1  space-y-4 overflow-y-auto pt-5 pb-2 scrollbar-hide pr-5 -mr-5'>
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
          value={watch('name')}
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
          value={watch('displayOrder').toString()}
          min='0'
          className='mb-7'
          hasError={!!errors.displayOrder}
          errorMessage={errors.displayOrder?.message}
        />

        <CheckboxOption
          svgClassName='w-4.5 h-4.5 '
          className=' ml-0.5  w-10 h-6 '
          {...register('isActive')}
          labelClassName={`font-medium text-sm ml-0.5 font-semibold font-syne normal-case  ${watch('isActive') ? 'text-black' : 'text-red-900/80'}`}
          id='category-is-active'
          label={watch('isActive') ? 'Aktiv' : 'Inaktiv'}
          checked={watch('isActive')}
        />

        {/* BILDUPPLADDNING */}
        {watchedType === 'MAIN-CATEGORY' && (
          <div className='sticky -top-5 z-10 pb-2.5 pt-4 bg-white space-y-4'>
            {/* Desktop bild */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Desktop-bild (16:9 format rekommenderas)
              </label>
              <FileInput
                onFilesSelected={handleDesktopImageSelect}
                accept='image/*'
                className='w-full'
                id='desktop-image-upload'
              >
                <div className='flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 transition-colors'>
                  <UploadCloud className='w-8 h-8 text-gray-600 mb-1.5' />
                  <p className='font-semibold text-gray-700 uppercase text-xs'>
                    Desktop-bild
                  </p>
                </div>
              </FileInput>
              {desktopPreview && (
                <div className='mt-2 relative'>
                  <img
                    src={desktopPreview}
                    alt='Desktop förhandsgranskning'
                    className='w-full h-24 object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={clearDesktopImage}
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Mobile bild */}
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Mobile-bild (9:16 format rekommenderas)
              </label>
              <FileInput
                onFilesSelected={handleMobileImageSelect}
                accept='image/*'
                className='w-full'
                id='mobile-image-upload'
              >
                <div className='flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 transition-colors'>
                  <UploadCloud className='w-8 h-8 text-gray-600 mb-1.5' />
                  <p className='font-semibold text-gray-700 uppercase text-xs'>
                    Mobile-bild
                  </p>
                </div>
              </FileInput>
              {mobilePreview && (
                <div className='mt-2 relative'>
                  <img
                    src={mobilePreview}
                    alt='Mobile förhandsgranskning'
                    className='w-full h-32 object-cover rounded-lg'
                  />
                  <button
                    type='button'
                    onClick={clearMobileImage}
                    className='absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600'
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className='flex  gap-3 pt-3  pb-6'>
        <Button
          type='submit'
          disabled={
            isLoading /* || !isValid */ || (mode === 'edit' && !isDirty)
          }
          className=' h-12 mt-0 w-full'
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
          className='w-full h-12 mt-0'
        >
          Avbryt
        </Button>
      </div>
    </form>
  );
}
