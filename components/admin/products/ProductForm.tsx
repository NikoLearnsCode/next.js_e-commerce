'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, Controller} from 'react-hook-form';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {Button} from '@/components/shared/ui/button';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {CustomDateInput} from '@/components/shared/ui/DateInput';
import {useAdmin} from '@/context/AdminContextProvider';
import {useState, useEffect, useTransition, useRef} from 'react';
import {
  DropdownOption,
  findCategoriesForDropdown,
} from '@/components/admin/utils/admin.form-helpers';
import {generateSlug} from '@/components/admin/utils/slug-generator';
import Image from 'next/image';
import {Product} from '@/lib/types/db';
import {UploadCloud, X} from 'lucide-react';
import CustomSelect from '../shared/Select';
import FileInput from '../shared/FileInput';
import {
  createProductWithImages,
  updateProductWithImages,
} from '@/actions/admin/admin.products.actions';
import {toast} from 'sonner';

type ProductFormProps = {
  mode: 'create' | 'edit';
  initialData?: Product | null;
};

export default function ProductForm({mode, initialData}: ProductFormProps) {
  const {categories, closeSidebar} = useAdmin();
  const [isPending, startTransition] = useTransition();
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const [subCategoryOptions, setSubCategoryOptions] = useState<
    DropdownOption[]
  >([]);
  const [realtimeUpdate, setRealtimeUpdate] = useState(true);

  const {
    register,
    handleSubmit,
    formState: {errors, isDirty /* , isValid */},
    setValue,
    watch,
    reset,
    resetField,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      price: 0,
      brand: '',
      color: '',
      gender: '',
      category: '',
      sizes: [],
      specs: [],
      publishedAt: new Date(),
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
        sizes: initialData.sizes,
        specs: initialData.specs || [],

        publishedAt: initialData.published_at
          ? new Date(initialData.published_at)
          : undefined,
      });
    }
  }, [mode, initialData, reset]);

  // Separat useEffect för att hantera select-fält i edit mode (timing-fix)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setValue('gender', initialData.gender || '');
    }
  }, [mode, initialData, setValue]);

  // Sätt category när subCategoryOptions har laddats (efter gender är satt)
  useEffect(() => {
    if (mode === 'edit' && initialData && subCategoryOptions.length > 0) {
      const categoryExists = subCategoryOptions.some(
        (option) => option.slug === initialData.category
      );

      if (categoryExists) {
        setValue('category', initialData.category || '');
      }
    }
  }, [mode, initialData, subCategoryOptions, setValue]);

  // Ladda befintliga bilder vid edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.images) {
      setExistingImages(initialData.images);
      setNewImageFiles([]);
      setNewImagePreviews([]);
    } else {
      setExistingImages([]);
      setNewImageFiles([]);
      setNewImagePreviews([]);
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
      if (mode === 'create') {
        resetField('category');
      }
      return;
    }

    const selectedMainCategory = categories.find(
      (cat) => cat.slug === selectedMainCategorySlug
    );

    if (selectedMainCategory && selectedMainCategory.children) {
      const options = findCategoriesForDropdown(selectedMainCategory.children, [
        'MAIN-CATEGORY',
        'SUB-CATEGORY',
      ]);
      setSubCategoryOptions(options);
    } else {
      setSubCategoryOptions([]);
    }
  }, [selectedMainCategorySlug, categories, resetField, mode]);

  // Realtime clock update i create mode
  useEffect(() => {
    if (mode === 'create' && realtimeUpdate) {
      const interval = setInterval(() => {
        setValue('publishedAt', new Date());
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [mode, realtimeUpdate, setValue]);

  // Denna funktion tar emot filerna från FileInput-komponenten
  const handleImageChange = (files: File[]) => {
    setNewImageFiles((prevFiles) => [...prevFiles, ...files]);

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);
  };

  // Handles form submission - called after react-hook-form validation passes
  const onSubmit = async (
    data: ProductFormData,
    event?: React.BaseSyntheticEvent
  ) => {
    startTransition(async () => {
      try {
        // Get FormData from the actual form element
        const formData = new FormData(event?.target);

        // Add new image files to FormData
        newImageFiles.forEach((file) => {
          formData.append('images', file);
        });

        // Add existing images to FormData (for edit mode)
        if (mode === 'edit') {
          existingImages.forEach((imageUrl) => {
            formData.append('existingImages', imageUrl);
          });
        }

        let result;
        if (mode === 'edit' && initialData) {
          result = await updateProductWithImages(
            initialData.id,
            null,
            formData
          );
        } else {
          result = await createProductWithImages(null, formData);
        }

        if (result.success) {
          toast.success(
            mode === 'edit' ? 'Produkt uppdaterad!' : 'Produkt skapad!'
          );
          if (mode === 'create') {
            handleReset();
          }
          closeSidebar();
        } else {
          toast.error(result.error || 'Ett fel uppstod');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        toast.error('Ett oväntat fel uppstod');
      }
    });
  };

  const onError = (errors: any) => {
    console.log('Valideringsfel:', errors);
    toast.error('Vänligen fyll i alla obligatoriska fält korrekt');
  };

  const handleReset = () => {
    reset({
      name: '',
      slug: '',
      description: '',
      price: 0,
      brand: '',
      color: '',
      gender: '',
      category: '',
      sizes: [],
      specs: [],
      publishedAt: new Date(),
    });

    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);

    // Starta realtime update igen
    if (mode === 'create') {
      setRealtimeUpdate(true);
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit, onError)}
      className='flex flex-col h-full'
    >
      {/* Scrollbart område för alla input-fält */}
      <div className='flex-1 space-y-4 scrollbar-hide overflow-y-auto pt-5 pb-16 pr-5 -mr-5'>
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4  '>
          {/* Huvudkategori Select */}
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
              placeholder='Välj huvudkategori *'
            />
            {errors.gender && (
              <p className='text-xs text-destructive font-medium ml-1 mt-1'>
                {errors.gender.message}
              </p>
            )}
          </div>

          {/* Underkategori Select */}
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
                  : 'Välj underkategori *'
              }
            />
            {errors.category && (
              <p className='text-xs text-destructive font-medium ml-1 mt-1'>
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* TEXT-INPUTS */}
        <div className='grid gap-4 grid-cols-2 w-full'>
          <FloatingLabelInput
            {...register('name')}
            id='product-name'
            label='Produktnamn *'
            value={watch('name')}
            as='input'
            type='text'
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <FloatingLabelInput
            {...register('slug')}
            id='product-slug'
            label='Slug *'
            value={watch('slug')}
            as='input'
            type='text'
            hasError={!!errors.slug}
            errorMessage={errors.slug?.message}
          />
          <FloatingLabelInput
            {...register('price')}
            id='product-price'
            label='Pris (SEK) *'
            value={watch('price').toString()}
            as='input'
            type='number'
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />
          <FloatingLabelInput
            {...register('brand')}
            id='product-brand'
            label='Märke *'
            value={watch('brand')}
            as='input'
            type='text'
            hasError={!!errors.brand}
            errorMessage={errors.brand?.message}
          />
          <FloatingLabelInput
            {...register('color')}
            id='product-color'
            label='Färg *'
            value={watch('color')}
            as='input'
            type='text'
            hasError={!!errors.color}
            // className='col-span-2 col-start-1'
            errorMessage={errors.color?.message}
          />

          {/* SIZES INPUT */}
          {/* We use a Controller here because react-hook-form's state for 'sizes' is an ARRAY, */}
          {/* but a standard HTML input's value can only be a STRING. */}
          {/* The Controller acts as a bridge: */}
          {/* 1. `render > value`: It transforms the form's array state into a comma-separated string for display in the input. */}
          {/* 2. `render > onChange`: It transforms the input's string value back into an array before saving it in the form's state. */}
          {/* This allows for a flexible user input experience while maintaining correct data types internally. */}
          <Controller
            name='sizes'
            control={control}
            render={({field}) => (
              <FloatingLabelInput
                {...field}
                id='product-sizes'
                label='Storlekar * (kommaseparerade)'
                value={Array.isArray(field.value) ? field.value.join(',') : ''}
                onChange={(e) => {
                  field.onChange(e.target.value.split(','));
                }}
                as='input'
                type='text'
                hasError={!!errors.sizes}
                errorMessage={errors.sizes?.message}
              />
            )}
          />
          <FloatingLabelInput
            {...register('description')}
            id='product-description'
            label='Beskrivning *'
            value={watch('description')}
            as='textarea'
            rows={3}
            className='w-full  col-span-2 col-start-1'
            hasError={!!errors.description}
            errorMessage={errors.description?.message}
          />

          {/* SPECS INPUT */}
          {/* Similar to the 'sizes' field, we use a Controller to manage the mismatch */}
          {/* between the form's internal ARRAY state for 'specs' and the textarea's STRING value. */}
          {/* 1. `render > value`: Transforms the array into a newline-separated string for the textarea. */}
          {/* 2. `render > onChange`: Transforms the string from the textarea back into an array. */}
          <Controller
            name='specs'
            control={control}
            render={({field}) => (
              <FloatingLabelInput
                {...field}
                id='product-specs'
                label='Specifikationer (en per rad)'
                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                onChange={(e) => {
                  field.onChange(e.target.value.split('\n'));
                }}
                as='textarea'
                className=' w-full col-span-2 col-start-1'
                rows={5}
                hasError={!!errors.specs}
                errorMessage={errors.specs?.message}
              />
            )}
          />
          <Controller
            name='publishedAt'
            control={control}
            render={({field}) => (
              <CustomDateInput
                {...field}
                id='product-published-at'
                label='Publiceringsdatum (optional, default: nu)'
                value={field.value || null}
                onChange={(date) => {
                  field.onChange(date || undefined);
                  // Stoppa realtime update när användaren manuellt ändrar
                  if (mode === 'create') {
                    setRealtimeUpdate(false);
                  }
                }}
                className='w-full col-span-2 col-start-1 mb-2'
                hasError={!!errors.publishedAt}
                errorMessage={errors.publishedAt?.message}
              />
            )}
          />
        </div>

        {/* BILDUPPLADDNING */}
        <div className='sticky -top-5 z-10 pb-2.5 bg-white '>
          <FileInput
            id='image-upload'
            multiple
            accept='image/*'
            onFilesSelected={handleImageChange}
          >
            <div className='flex flex-col items-center justify-center w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-gray-500 transition-colors'>
              <UploadCloud
                strokeWidth={1.25}
                className='w-8 h-8 text-gray-600 mb-1.5'
              />
              <p className='font-semibold text-gray-700 uppercase text-xs'>
                Klicka för att ladda upp produktbilder
              </p>
            </div>
          </FileInput>
        </div>
        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
          <div className='mt-4 space-y-4'>
            {/* Befintliga bilder */}
            {existingImages.length > 0 && (
              <div>
                <p className='text-sm  font-medium text-gray-700 ml-1 my-2'>
                  Befintliga bilder:
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-2 gap-1 mb-8'>
                  {existingImages.map((src, index) => (
                    <div key={`existing-${index}`} className='relative group '>
                      <Image
                        src={src}
                        height={250}
                        width={160}
                        alt={`Befintlig bild ${index + 1}`}
                        className='w-full h-auto object-cover rounded-md '
                      />
                      <button
                        type='button'
                        className='absolute cursor-pointer  group-hover:bg-white/50 group-active:bg-white/50 transition-all duration-300  text-gray-500 group-hover:text-black hover:text-red-800 p-2 top-1 right-1'
                        onClick={() =>
                          setExistingImages(
                            existingImages.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nya bilder */}
            {newImagePreviews.length > 0 && (
              <div>
                <p className='text-sm  font-medium text-gray-700 ml-1 my-2'>
                  Nya bilder:
                </p>
                <div className='grid grid-cols-2 sm:grid-cols-2 gap-1 mb-8'>
                  {newImagePreviews.map((src, index) => (
                    <div key={`new-${index}`} className='relative group'>
                      <Image
                        src={src}
                        height={250}
                        width={160}
                        alt={`Ny bild ${index + 1}`}
                        className='w-full h-auto object-cover rounded-md '
                      />
                      <button
                        type='button'
                        className='absolute cursor-pointer  group-hover:bg-white/50 group-active:bg-white/50 transition-all duration-300  text-gray-500 group-hover:text-black hover:text-red-800 p-2 top-1 right-1'
                        onClick={() => {
                          setNewImagePreviews(
                            newImagePreviews.filter((_, i) => i !== index)
                          );
                          setNewImageFiles(
                            newImageFiles.filter((_, i) => i !== index)
                          );
                        }}
                      >
                        <X size={12} strokeWidth={1.5} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer med knappar som alltid är synlig */}
      <div className='flex w-full gap-2 pb-6 pt-3 '>
        <Button
          className='w-full mt-0 h-13'
          type='submit'
          /*  disabled={
            isPending ||
            !isDirty ||
            (mode === 'create' && newImageFiles.length === 0) ||
            (mode === 'edit' &&
              existingImages.length + newImageFiles.length === 0)
          } */
        >
          {isPending
            ? mode === 'edit'
              ? 'Uppdaterar...'
              : 'Sparar...'
            : mode === 'edit'
              ? 'Uppdatera produkt'
              : 'Spara produkt'}
        </Button>
        <Button
          className='w-full mt-0 h-13'
          variant='outline'
          type='button'
          onClick={handleReset}
          disabled={isPending}
        >
          Rensa
        </Button>
      </div>
    </form>
  );
}
