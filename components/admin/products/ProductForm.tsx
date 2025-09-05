// components/admin/ProductForm.tsx

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {Button} from '@/components/shared/ui/button';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {useAdmin} from '@/context/AdminContextProvider';
import {useState, useEffect} from 'react';
import {
  findAllAssignableSubCategories,
  DropdownOption,
} from '@/utils/dropdown-helper';
import {generateSlug} from '@/utils/slug-generator';
import Image from 'next/image';
import {Product} from '@/lib/types/db';
import {X} from 'lucide-react';
import CustomSelect from '../shared/CustomSelect';

type ProductFormProps = {
  mode: 'create' | 'edit';
  initialData?: Product | null;
};

export default function ProductForm({mode, initialData}: ProductFormProps) {
  const {categories, createProduct, updateProduct, isLoading} = useAdmin();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [subCategoryOptions, setSubCategoryOptions] = useState<
    DropdownOption[]
  >([]);

  const {
    register,
    handleSubmit,
    formState: {errors /* , isValid */},
    setValue,
    watch,
    reset,
    resetField,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      // @ts-ignore
      price: '',
      brand: '',
      color: '',
      gender: '',
      category: '',
      sizes: '',
      specs: '',
    },
  });

  // Populate form with initial data when editing
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        price:
          typeof initialData.price === 'string'
            ? parseInt(initialData.price)
            : initialData.price,
        brand: initialData.brand,
        color: initialData.color,
        sizes: Array.isArray(initialData.sizes)
          ? initialData.sizes.join(',')
          : '',
        specs: Array.isArray(initialData.specs)
          ? initialData.specs.join('\n')
          : '',
      });
    }
  }, [mode, initialData, reset]);

  // Separat useEffect för att hantera select-fält i edit mode (timing-fix)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      // Sätt gender först
      setValue('gender', initialData.gender);
    }
  }, [mode, initialData, setValue]);

  // Sätt category när subCategoryOptions har laddats (efter gender är satt)
  useEffect(() => {
    if (mode === 'edit' && initialData && subCategoryOptions.length > 0) {
      const categoryExists = subCategoryOptions.some(
        (option) => option.slug === initialData.category
      );

      if (categoryExists) {
        setValue('category', initialData.category);
      }
    }
  }, [mode, initialData, subCategoryOptions, setValue]);

  // Ladda befintliga bilder vid edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.images) {
      setImagePreviews(initialData.images);
      setImageFiles([]);
    }
  }, [mode, initialData]);

  const selectedMainCategorySlug = watch('gender');

  // Auto-generate slug from name
  const watchedName = watch('name');
  useEffect(() => {
    if (watchedName && mode === 'create') {
      const slug = generateSlug(watchedName);
      setValue('slug', slug);
    }
  }, [watchedName, setValue, mode]);

  // Hanterar select options
  useEffect(() => {
    if (!selectedMainCategorySlug) {
      setSubCategoryOptions([]);
      // Resettera bara category i create mode, inte edit mode
      if (mode === 'create') {
        resetField('category');
      }
      return;
    }

    const selectedMainCategory = categories.find(
      (cat) => cat.slug === selectedMainCategorySlug
    );

    if (selectedMainCategory && selectedMainCategory.children) {
      const options = findAllAssignableSubCategories(
        selectedMainCategory.children
      );
      setSubCategoryOptions(options);
    } else {
      setSubCategoryOptions([]);
    }
  }, [selectedMainCategorySlug, categories, resetField, mode]);

  // Hanterar bilduppladdning
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (files) {
      const newFiles = Array.from(files);
      setImageFiles((prev) => [...prev, ...newFiles]);

      const newPrevies = newFiles.map((file: File) =>
        URL.createObjectURL(file)
      );
      setImagePreviews((prev) => [...prev, ...newPrevies]);
    }
  };

  const onError = (errors: any) => {
    console.error('Valideringsfel i formuläret:', errors);
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (mode === 'edit' && initialData) {
        await updateProduct(
          initialData.id,
          data,
          imageFiles.length > 0 ? imageFiles : undefined
        );
      } else {
        await createProduct(data, imageFiles);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  const handleReset = () => {
    reset({
      name: '',
      slug: '',
      description: '',
      // @ts-ignore
      price: '',
      brand: '',
      color: '',
      gender: '',
      category: '',
      sizes: '',
      specs: '',
    });

    setImageFiles([]);
    setImagePreviews([]);
  };

  return (
    <div className='overflow-y-auto'>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className='space-y-5 overflow-y-auto'
      >
        <div className='grid grid-cols-1 md:grid-cols-1 gap-5 '>
          <div>
            <label
              htmlFor='gender-select'
              className='block text-sm font-medium sr-only text-gray-700 mb-1'
            >
              Huvudkategori
            </label>
            <CustomSelect
              hasError={!!errors.gender}
              value={watch('gender')}
              id='gender-select'
              {...register('gender')}
              options={categories.map((mainCat) => ({
                value: mainCat.slug,
                label: mainCat.name,
              }))}
              placeholder='Välj huvudkategori'
            />

            {errors.gender && (
              <p className='text-xs text-destructive mt-1'>
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='category-select'
              className='block text-sm font-medium sr-only text-gray-700 mb-1'
            >
              Underkategori
            </label>
            <CustomSelect
              hasError={!!errors.category}
              value={watch('category')}
              disabled={
                !selectedMainCategorySlug || subCategoryOptions.length === 0
              }
              id='category-select'
              {...register('category')}
              options={subCategoryOptions.map((option) => ({
                  value: option.slug,
                  label: option.label,
                }))}
              placeholder={
                !selectedMainCategorySlug
                  ? 'Välj huvudkategori först'
                  : 'Välj underkategori'
              }
            />

            {errors.category && (
              <p className='text-xs text-destructive mt-1'>
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* TEXT-INPUTS */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-1'>
          {/* Name */}
          <FloatingLabelInput
            {...register('name')}
            id='product-name'
            label='Produktnamn'
            as='input'
            type='text'
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />

          {/* Slug */}
          <FloatingLabelInput
            {...register('slug')}
            id='product-slug'
            label='Slug'
            as='input'
            type='text'
            value={watch('slug')}
            hasError={!!errors.slug}
            errorMessage={errors.slug?.message}
          />

          {/* Price */}
          <FloatingLabelInput
            {...register('price')}
            id='product-price'
            label='Pris (SEK)'
            as='input'
            type='number'
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />

          {/* Brand */}
          <FloatingLabelInput
            {...register('brand')}
            id='product-brand'
            label='Märke'
            as='input'
            type='text'
            hasError={!!errors.brand}
            errorMessage={errors.brand?.message}
          />

          {/* Color */}
          <FloatingLabelInput
            {...register('color')}
            id='product-color'
            label='Färg'
            as='input'
            type='text'
            hasError={!!errors.color}
            errorMessage={errors.color?.message}
          />

          {/* Sizes */}
          <FloatingLabelInput
            {...register('sizes')}
            id='product-sizes'
            label='Storlekar (kommaseparerade)'
            as='input'
            type='text'
            className='col-span-2'
            hasError={!!errors.sizes}
            errorMessage={errors.sizes?.message}
          />

          {/* Description */}
          <FloatingLabelInput
            {...register('description')}
            id='product-description'
            label='Beskrivning'
            as='textarea'
            className='h-24 col-span-1'
            hasError={!!errors.description}
            errorMessage={errors.description?.message}
          />

          {/* Specs */}
          <FloatingLabelInput
            {...register('specs')}
            id='product-specs'
            label='Specifikationer (en per rad)'
            as='textarea'
            className='h-36 col-span-1'
            hasError={!!errors.specs}
            errorMessage={errors.specs?.message}
          />
        </div>

        {/* BILDUPPLADDNING */}
        <div className='   hover:border-gray-500 rounded-xs'>
          <label
            htmlFor='image-upload'
            className='block uppercase text-base font-medium px-  mb-4'
          >
            Bilder *
          </label>
          <input
            id='image-upload'
            type='file'
            multiple
            accept='image/*'
            onChange={handleImageChange}
            className='block w-full text-sm  file:mr-4 file:py-2 file:px-4 file:rounded-xs file:uppercase file:text-xs uppercase file:font-semibold file:bg-gray-50 file:cursor-pointer hover:file:bg-gray-100 cursor-pointer'
          />
          {/* FÖRHANDSGRANSKNING */}
          {imagePreviews.length > 0 && (
            <div className='mt-4   grid grid-cols-2 sm:grid-cols-2 gap-1'>
              {imagePreviews.map((src, index) => (
                <div key={index} className='relative'>
                  <Image
                    key={index}
                    src={src}
                    height={250}
                    width={160}
                    alt={`Förhandsgranskning ${index + 1}`}
                    className='w-full h-auto object-cover rounded-md'
                  />
                  <button
                    type='button'
                    className='absolute cursor-pointer text-gray-500 hover:text-red-700 p-3 top-0 right-0'
                    onClick={() =>
                      setImagePreviews(
                        imagePreviews.filter((_, i) => i !== index)
                      )
                    }
                  >
                    <X size={12} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className='flex justify-end gap-2 pb-5'>
          <Button
            className='w-full h-14'
            type='submit'
            disabled={isLoading /* || !isValid */}
          >
            {isLoading
              ? mode === 'edit'
                ? 'Uppdaterar...'
                : 'Sparar...'
              : mode === 'edit'
                ? 'Uppdatera produkt'
                : 'Spara produkt'}
          </Button>
          <Button
            className='w-full h-14'
            variant='outline'
            type='button'
            onClick={handleReset}
            disabled={isLoading}
          >
            Rensa
          </Button>
        </div>
      </form>
    </div>
  );
}
