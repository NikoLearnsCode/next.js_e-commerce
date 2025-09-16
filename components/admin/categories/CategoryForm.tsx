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
import {
  createCategoryWithImages,
  updateCategoryWithImages,
} from '@/actions/admin/admin.categories.actions';
import {toast} from 'sonner';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {Button} from '@/components/shared/ui/button';
import {CheckboxOption} from '@/components/shared/ui/CheckboxOption';
import {generateSlug} from '@/components/admin/utils/slug-generator';
import CustomSelect from '../shared/Select';
import {
  findCategoriesForDropdown,
  findCategoryById,
} from '@/components/admin/utils/admin.form-helpers';
import {UploadCloud, X} from 'lucide-react';
import FileInput from '../shared/FileInput';
import Image from 'next/image';

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialData?: Category | null;
};

export default function CategoryForm({mode, initialData}: CategoryFormProps) {
  const {closeSidebar, categories} = useAdmin();
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true);

    try {
      // Create FormData object
      const formData = new FormData();

      // Add text fields to FormData
      formData.append('name', data.name);
      formData.append('slug', data.slug);
      formData.append('type', data.type);
      formData.append('displayOrder', data.displayOrder.toString());
      formData.append('isActive', data.isActive.toString());
      formData.append(
        'parentId',
        data.parentId ? data.parentId.toString() : 'null'
      );

      // Add existing image URLs if in edit mode and no new files
      if (mode === 'edit') {
        formData.append('desktopImage', data.desktopImage || '');
        formData.append('mobileImage', data.mobileImage || '');
      }

      // Add image files if provided for MAIN-CATEGORY
      if (data.type === 'MAIN-CATEGORY') {
        if (desktopImage) {
          formData.append('desktopImageFile', desktopImage);
        }
        if (mobileImage) {
          formData.append('mobileImageFile', mobileImage);
        }
      }

      // Call the appropriate atomic server action
      const result =
        mode === 'edit' && initialData
          ? await updateCategoryWithImages(initialData.id, formData)
          : await createCategoryWithImages(formData);

      if (result.success) {
        closeSidebar();
        toast.success(
          mode === 'edit' ? 'Kategori uppdaterad' : 'Kategori skapad'
        );
      } else {
        toast.error(result.error);
        console.error('Category submission failed:', result.error);
      }
    } catch (error) {
      console.error('Category form submission error:', error);
      toast.error('Ett oväntat fel uppstod på servern.');
    } finally {
      setIsLoading(false);
    }
  };

  const availableParents = getValidParentOptions();

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-5 h-full flex flex-col'
    >
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
          className=' ml-0.5  w-8 h-6 '
          {...register('isActive')}
          labelClassName={`font-medium text-sm ml-0.5 font-medium  normal-case  ${watch('isActive') ? 'text-gray-900' : 'text-gray-500'}`}
          id='category-is-active'
          label={watch('isActive') ? 'Aktiv' : 'Inaktiv'}
          checked={watch('isActive')}
        />

        {/* BILDUPPLADDNING */}
        {watchedType === 'MAIN-CATEGORY' && (
          <div className='z-10 pb-2.5 pt-7 bg-white space-y-2'>
            {/* Desktop bild */}
            <div>
              <label className='block -mb-2 text-sm font-medium text-gray-700'>
                <span className=' font-semibold'>Desktop-bild</span> (16:9
                format rekommenderas)
              </label>
              <FileInput
                onFilesSelected={handleDesktopImageSelect}
                accept='image/*'
                className='w-full'
                id='desktop-image-upload'
              >
                <div className='flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 transition-colors'>
                  <UploadCloud
                    strokeWidth={1.25}
                    className='w-8 h-8 text-gray-600'
                  />
                  {/*   <p className='font-semibold text-gray-700 uppercase text-xs'>
                    Desktop-bild
                  </p> */}
                </div>
              </FileInput>
              {desktopPreview && (
                <div className='mt-2.5 mb-10 relative group'>
                  <Image
                    src={desktopPreview}
                    alt='Desktop förhandsgranskning'
                    className='w-full h-full object-cover'
                    width={700}
                    height={300}
                    quality={100}
                  />
                  <button
                    type='button'
                    onClick={clearDesktopImage}
                    className='absolute cursor-pointer  group-hover:bg-white/50 group-active:bg-white/50 transition-all duration-300  text-gray-500 group-hover:text-black hover:text-red-800 p-2 top-1 right-1'
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )}
            </div>

            {/* Mobile bild */}
            <div className='mt-6'>
              <label className='block -mb-2 text-sm font-medium text-gray-700 '>
                <span className=' font-semibold'>Mobile-bild</span> (9:16 format
                rekommenderas)
              </label>
              <FileInput
                onFilesSelected={handleMobileImageSelect}
                accept='image/*'
                className='w-full'
                id='mobile-image-upload'
              >
                <div className='flex flex-col items-center justify-center w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 transition-colors'>
                  <UploadCloud
                    strokeWidth={1.25}
                    className='w-8 h-8 text-gray-600 '
                  />
                  {/*  <p className='font-semibold text-gray-700 uppercase text-xs'>
                    Mobile-bild
                  </p> */}
                </div>
              </FileInput>
              {mobilePreview && (
                <div className='mt-2.5 relative group'>
                  <Image
                    src={mobilePreview}
                    alt='Mobile förhandsgranskning'
                    className='w-full full object-contain'
                    width={300}
                    height={700}
                    quality={100}
                  />
                  <button
                    type='button'
                    className='absolute cursor-pointer  group-hover:bg-white/50 group-active:bg-white/50 transition-all duration-300  text-gray-500 group-hover:text-black hover:text-red-800 p-2 top-1 right-1'
                    onClick={clearMobileImage}
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                </div>
              )}{' '}
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
