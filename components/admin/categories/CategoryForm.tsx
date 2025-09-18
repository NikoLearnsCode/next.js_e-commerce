'use client';

import {Controller, useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Category} from '@/lib/types/category';
import {useAdmin} from '@/context/AdminContextProvider';
import {
  categoryFormSchema,
  CategoryFormData,
  CATEGORY_TYPE_OPTIONS,
} from '@/lib/validators/admin-validators';
import {useEffect, useMemo, useRef, useState, useTransition} from 'react';
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
  createCategoryLookupMap,
} from '@/components/admin/utils/admin.form-helpers';
import {X} from 'lucide-react';
import FileInput from '../shared/FileInput';
import {UploadIcon} from '../shared/UploadIcon';
import Image from 'next/image';

type CategoryFormProps = {
  mode: 'create' | 'edit';
  initialData?: Category | null;
};

export default function CategoryForm({mode, initialData}: CategoryFormProps) {
  const {closeSidebar, categories} = useAdmin();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);
  const [desktopImage, setDesktopImage] = useState<File | null>(null);
  const [mobileImage, setMobileImage] = useState<File | null>(null);
  const [desktopPreview, setDesktopPreview] = useState<string>('');
  const [mobilePreview, setMobilePreview] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: {errors, isDirty},
    setValue,
    watch,
    reset,
    control,
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

  const handleDesktopImageSelect = (files: File[]) => {
    if (files && files[0]) {
      const file = files[0];
      setDesktopImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setDesktopPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleMobileImageSelect = (files: File[]) => {
    if (files && files[0]) {
      const file = files[0];
      setMobileImage(file);
      const reader = new FileReader();
      reader.onload = (e) => setMobilePreview(e.target?.result as string);
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

  // Uppslagning av kategorier via ID används nedan
  const categoryLookup = useMemo(
    () => createCategoryLookupMap(categories),
    [categories]
  );

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        type: initialData.type as any,
        displayOrder: initialData.displayOrder,
        isActive: initialData.isActive,
        parentId: initialData.parentId || null,
      });
      if (initialData.desktopImage) setDesktopPreview(initialData.desktopImage);
      if (initialData.mobileImage) setMobilePreview(initialData.mobileImage);
    }
  }, [mode, initialData, reset]);

  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  useEffect(() => {
    if (watchedName && mode === 'create') {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, mode]);

  const watchedType = watch('type');

  const isParentSelectionEnabled = Boolean(
    watchedType &&
      (watchedType === 'CONTAINER' || watchedType === 'SUB-CATEGORY')
  );

  // Hämtar alla möjliga föräldrakategorier baserat på kategori-typ
  const getValidParentOptions = () => {
    if (!watchedType || watchedType === 'MAIN-CATEGORY') return [];
    const allPossibleParents = findCategoriesForDropdown(categories, [
      'MAIN-CATEGORY',
      'CONTAINER',
    ]);
    // Förhindrar att skapa container för annat än main-category, kan redigeras genom att lägga till container i allowedTypes
    if (watchedType === 'CONTAINER') {
      return allPossibleParents.filter((parent) => {
        const parentCategory = categoryLookup.get(parent.value);
        const allowedTypes = ['MAIN-CATEGORY'];
        return parentCategory && allowedTypes.includes(parentCategory.type);
      });
    }
    return allPossibleParents;
  };

  // form action + react-hook-form wrapper
  // client-side validering först innan det skickas vidare till server
  const onSubmit = () => {
    startTransition(async () => {
      if (!formRef.current) return;
      const formData = new FormData(formRef.current);

      if (desktopImage) formData.append('desktopImageFile', desktopImage);
      if (mobileImage) formData.append('mobileImageFile', mobileImage);

      if (mode === 'edit') {
        if (initialData?.desktopImage && !desktopPreview)
          formData.set('desktopImage', '');
        if (initialData?.mobileImage && !mobilePreview)
          formData.set('mobileImage', '');
      }

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
      }
    });
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      className='space-y-5 h-full flex flex-col'
    >
      <div className='flex-1 space-y-4 overflow-y-auto pt-5 pb-2 scrollbar-hide pr-5 -mr-5'>
        <div>
          <Controller
            name='type'
            control={control}
            render={({field}) => (
              <CustomSelect
                {...field}
                hasError={!!errors.type}
                options={CATEGORY_TYPE_OPTIONS}
                placeholder='Välj kategori-typ *'
                disabled={mode === 'edit'}
              />
            )}
          />
          {errors.type && (
            <p className='text-red-500 font-medium text-xs mt-1 ml-1'>
              {errors.type.message}
            </p>
          )}
          {mode === 'edit' && initialData && (
            <input
              type='hidden'
              {...register('type')}
              value={initialData.type}
            />
          )}
        </div>
        <div>
          <Controller
            name='parentId'
            control={control}
            render={({field}) => (
              <CustomSelect
                {...field}
                value={field.value || ''}
                hasError={!!errors.parentId && isParentSelectionEnabled}
                options={getValidParentOptions().map((p) => ({
                  value: p.value,
                  label: p.label,
                }))}
                placeholder={
                  !isParentSelectionEnabled
                    ? 'Ej tillämpligt'
                    : 'Välj föräldrakategori *'
                }
                disabled={!isParentSelectionEnabled || mode === 'edit'}
              />
            )}
          />
          {mode === 'edit' && initialData && (
            <input
              type='hidden'
              {...register('parentId')}
              value={initialData.parentId || ''}
            />
          )}
          {errors.parentId && isParentSelectionEnabled && (
            <p className='text-red-500 font-medium text-xs ml-1 mt-1'>
              {errors.parentId.message}
            </p>
          )}
        </div>
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
          value={watchedSlug}
          label='Slug *'
          type='text'
          hasError={!!errors.slug}
          errorMessage={errors.slug?.message}
        />
        <FloatingLabelInput
          {...register('displayOrder')}
          id='category-display-order'
          label='Sorteringsordning'
          className='mb-8'
          type='number'
          hasError={!!errors.displayOrder}
          errorMessage={errors.displayOrder?.message}
        />
        <CheckboxOption
          svgClassName='h-5 w-5'
          labelClassName=' font-medium '
          className='ml-1 w-7 h-6'
          {...register('isActive')}
          id='category-is-active'
          label={watch('isActive') ? 'Aktiv' : 'Inaktiv'}
          checked={watch('isActive')}
        />

        {watchedType === 'MAIN-CATEGORY' && (
          <div className='z-10 pb-2.5 pt-7 bg-white space-y-2'>
            <div>
              <label className='block -mb-2 text-sm font-medium text-gray-700'>
                <span className='font-semibold'>Desktop-bild</span> (16:9)
              </label>
              <FileInput
                onFilesSelected={handleDesktopImageSelect}
                accept='image/*'
                className='w-full'
                id='desktop-image-upload'
              >
                <UploadIcon />
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
                    className='absolute p-2  group-hover:opacity-100 opacity-0 group-active:opacity-100 transition-opacity duration-300 group-hover:bg-white/60 cursor-pointer top-1 right-1'
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            <div className='mt-6'>
              <label className='block -mb-2 text-sm font-medium text-gray-700'>
                <span className='font-semibold'>Mobile-bild</span> (9:16)
              </label>
              <FileInput
                onFilesSelected={handleMobileImageSelect}
                accept='image/*'
                className='w-full'
                id='mobile-image-upload'
              >
                <UploadIcon />
              </FileInput>
              {mobilePreview && (
                <div className='mt-2.5 relative group'>
                  <Image
                    src={mobilePreview}
                    alt='Mobile förhandsgranskning'
                    className='w-full object-contain'
                    width={300}
                    height={700}
                    quality={100}
                  />
                  <button
                    type='button'
                    onClick={clearMobileImage}
                    className='absolute p-2  group-hover:opacity-100 opacity-0 group-active:opacity-100 transition-opacity duration-300 group-hover:bg-white/60 cursor-pointer top-1 right-1'
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <div className='flex gap-3 pt-3 pb-6'>
        <Button
          type='submit'
          disabled={isPending || (mode === 'edit' && !isDirty)}
          className='h-13 mt-0 w-full'
        >
          {isPending
            ? 'Sparar...'
            : mode === 'edit'
              ? 'Uppdatera kategori'
              : 'Skapa kategori'}
        </Button>
        <Button
          type='button'
          variant='outline'
          onClick={closeSidebar}
          disabled={isPending}
          className='w-full h-13 mt-0'
        >
          Avbryt
        </Button>
      </div>
    </form>
  );
}
