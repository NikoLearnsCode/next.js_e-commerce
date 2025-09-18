'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm, Controller} from 'react-hook-form';
import {
  productSchema,
  type ProductFormData,
} from '@/lib/validators/admin-validators';
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
import {X} from 'lucide-react';
import CustomSelect from '../shared/Select';
import FileInput from '../shared/FileInput';
import {UploadIcon} from '../shared/UploadIcon';
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [isPending, startTransition] = useTransition();
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<
    DropdownOption[]
  >([]);
  const [realtimeUpdate, setRealtimeUpdate] = useState(true);
  const formRef = useRef<HTMLFormElement>(null);

  const {
    register,
    handleSubmit,
    formState: {errors, isDirty},
    setValue,
    watch,
    reset,
    control,
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    // dummydata
    defaultValues: {
      name: 'riktigt bra testprodukt',
      slug: 'riktigt-bra-test-produkt',
      description: 'riktigt bra testbeskrivning',
      price: 199,
      brand: 'riktigt bra testmärke',
      color: 'riktigt färgglad testfärg',
      gender: '',
      category: '',
      sizes: ['46', '32/32', 'XXL', '28/32', 'S'],
      specs: [
        'riktigt bra testspecifikation',
        'ännu en riktigt bra testspecifikation',
        'och en till riktigt bra testspecifikation',
        'och till sist en riktigt bra testspecifikation',
      ],
      publishedAt: new Date(),
    },
  });

  // sätter initial data
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        price:
          typeof initialData.price === 'string'
            ? parseFloat(initialData.price)
            : initialData.price,
        brand: initialData.brand,
        color: initialData.color,
        gender: initialData.gender || '',
        category: initialData.category || '',
        sizes: initialData.sizes,
        specs: initialData.specs || [],
        publishedAt: initialData.published_at
          ? new Date(initialData.published_at)
          : undefined,
      });
    }
  }, [mode, initialData, reset]);

  // sätter befintliga bilder
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
  const watchedName = watch('name');
  const watchedSlug = watch('slug');

  // generera slug
  useEffect(() => {
    if (watchedName && mode === 'create') {
      setValue('slug', generateSlug(watchedName));
    }
  }, [watchedName, setValue, mode]);

  // rensar sub om main ändras samt hämtar sub options baserat på main
  useEffect(() => {
    if (!selectedMainCategorySlug) {
      setSubCategoryOptions([]);
      return;
    }
    const selectedMainCategory = categories.find(
      (cat) => cat.slug === selectedMainCategorySlug
    );
    if (selectedMainCategory?.children) {
      setSubCategoryOptions(
        findCategoriesForDropdown(selectedMainCategory.children, [
          'MAIN-CATEGORY',
          'SUB-CATEGORY',
        ])
      );
    } else {
      setSubCategoryOptions([]);
    }
  }, [selectedMainCategorySlug, categories]);

  // realtime date/tid update (nästan helt onödig)
  useEffect(() => {
    if (mode === 'create' && realtimeUpdate) {
      const interval = setInterval(
        () => setValue('publishedAt', new Date()),
        1000
      );
      return () => clearInterval(interval);
    }
  }, [mode, realtimeUpdate, setValue]);

  const handleImageChange = (files: File[]) => {
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...files.map(URL.createObjectURL)]);
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
    setSubCategoryOptions([]);
    if (mode === 'create') setRealtimeUpdate(true);
  };

  // form action + react-hook-form wrapper
  // client-side validering först innan det skickas vidare till server
  const onSubmit = () => {
    startTransition(async () => {
      if (!formRef.current) return;

      const formData = new FormData(formRef.current);
      newImageFiles.forEach((file) => formData.append('images', file));
      if (mode === 'edit') {
        existingImages.forEach((url) => formData.append('existingImages', url));
      }

      const result =
        mode === 'edit' && initialData
          ? await updateProductWithImages(initialData.id, formData)
          : await createProductWithImages(formData);

      if (result.success) {
        toast.success(
          mode === 'edit' ? 'Produkt uppdaterad!' : 'Produkt skapad!'
        );
        closeSidebar();
      } else {
        toast.error(result.error || 'Något gick galet.');
      }
    });
  };

  // scrollar till botten av form när nya bilder läggs till
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && newImagePreviews.length > 0) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [newImagePreviews]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit(onSubmit)}
      onReset={handleReset}
      className='flex flex-col h-full'
    >
      <div
        ref={scrollContainerRef}
        className='flex-1 space-y-4 scrollbar-hide overflow-y-auto pt-5 pb-16 pr-5 -mr-5'
      >
        <div className='grid grid-cols-1 md:grid-cols-1 gap-4'>
          <Controller
            name='gender'
            control={control}
            render={({field}) => (
              <CustomSelect
                {...field}
                hasError={!!errors.gender}
                options={categories.map((c) => ({
                  value: c.slug,
                  label: c.name,
                }))}
                placeholder='Välj huvudkategori *'
              />
            )}
          />
          {mode === 'edit' && initialData && (
            <input type='hidden' {...register('gender')} />
          )}
          {errors.gender && (
            <p className='text-xs text-destructive font-medium ml-1 -mt-2.5 '>
              {errors.gender.message}
            </p>
          )}
          <Controller
            control={control}
            name='category'
            render={({field}) => (
              <CustomSelect
                {...field}
                hasError={!!errors.category}
                value={field.value}
                disabled={
                  !selectedMainCategorySlug || subCategoryOptions.length === 0
                }
                options={subCategoryOptions.map((o) => ({
                  value: o.slug,
                  label: o.label,
                }))}
                placeholder={
                  !selectedMainCategorySlug
                    ? 'Välj huvudkategori först'
                    : 'Välj underkategori *'
                }
              />
            )}
          />
          {mode === 'edit' && initialData && (
            <input type='hidden' {...register('category')} />
          )}

          {errors.category && (
            <p className='text-xs text-destructive font-medium ml-1 -mt-2.5'>
              {errors.category.message}
            </p>
          )}
        </div>
        <div className='grid gap-4 grid-cols-2 w-full'>
          <FloatingLabelInput
            {...register('name')}
            id='product-name'
            label='Produktnamn *'
            type='text'
            hasError={!!errors.name}
            errorMessage={errors.name?.message}
          />
          <FloatingLabelInput
            {...register('slug')}
            id='product-slug'
            value={watchedSlug}
            label='Slug *'
            type='text'
            hasError={!!errors.slug}
            errorMessage={errors.slug?.message}
          />
          <FloatingLabelInput
            {...register('price')}
            id='product-price'
            label='Pris (SEK) *'
            type='number'
            hasError={!!errors.price}
            errorMessage={errors.price?.message}
          />
          <FloatingLabelInput
            {...register('brand')}
            id='product-brand'
            label='Märke *'
            type='text'
            hasError={!!errors.brand}
            errorMessage={errors.brand?.message}
          />
          <FloatingLabelInput
            {...register('color')}
            id='product-color'
            label='Färg *'
            type='text'
            hasError={!!errors.color}
            errorMessage={errors.color?.message}
          />
          <Controller
            name='sizes'
            control={control}
            render={({field}) => (
              <FloatingLabelInput
                {...field}
                id='product-sizes'
                label='Storlekar * (kommaseparerade)'
                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                onChange={(e) =>
                  field.onChange(e.target.value.split(',').map((s) => s.trim()))
                }
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
            as='textarea'
            rows={3}
            className='w-full col-span-2'
            hasError={!!errors.description}
            errorMessage={errors.description?.message}
          />
          <Controller
            name='specs'
            control={control}
            render={({field}) => (
              <FloatingLabelInput
                {...field}
                id='product-specs'
                label='Specifikationer (en per rad)'
                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                onChange={(e) => field.onChange(e.target.value.split('\n'))}
                as='textarea'
                className='w-full col-span-2'
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
                label='Publiceringsdatum'
                value={field.value || null}
                onChange={(date) => {
                  field.onChange(date);
                  if (mode === 'create') setRealtimeUpdate(false);
                }}
                className='w-full col-span-2 mb-4'
                hasError={!!errors.publishedAt}
                errorMessage={errors.publishedAt?.message}
              />
            )}
          />
        </div>
        <div className='sticky -top-5 z-10 pb-2.5 bg-white'>
          <FileInput
            id='image-upload'
            multiple
            accept='image/*'
            onFilesSelected={handleImageChange}
          >
            <UploadIcon
              message={
                newImageFiles.length === 0 && existingImages.length === 0
                  ? 'Minst en bild krävs *'
                  : ''
              }
            />
          </FileInput>
        </div>
        {(existingImages.length > 0 || newImagePreviews.length > 0) && (
          <div className='mt-2 space-y-4'>
            {existingImages.length > 0 && (
              <div>
                <p className='text-sm font-medium mb-1'>Befintliga bilder:</p>
                <div className='grid grid-cols-2 gap-1 mb-8'>
                  {existingImages.map((src, i) => (
                    <div key={`existing-${i}`} className='relative group'>
                      <Image
                        src={src}
                        height={400}
                        width={300}
                        alt={`Bild ${i + 1}`}
                      />
                      <button
                        type='button'
                        className='absolute group-hover:opacity-100 opacity-0 group-active:opacity-100 transition-opacity duration-300 group-hover:bg-white/60 cursor-pointer top-1 right-1 p-2'
                        onClick={() =>
                          setExistingImages(
                            existingImages.filter((_, idx) => i !== idx)
                          )
                        }
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {newImagePreviews.length > 0 && (
              <div>
                <p className='text-sm font-medium mb-1'>Nya bilder:</p>
                <div className='grid grid-cols-2 gap-1 mb-8'>
                  {newImagePreviews.map((src, i) => (
                    <div key={`new-${i}`} className='relative group'>
                      <Image
                        src={src}
                        height={400}
                        width={300}
                        alt={`Ny bild ${i + 1}`}
                      />
                      <button
                        type='button'
                        className='absolute group-hover:opacity-100 opacity-0 group-active:opacity-100 transition-opacity duration-300 group-hover:bg-white/60 cursor-pointer top-1 right-1 p-2'
                        onClick={() => {
                          setNewImagePreviews(
                            newImagePreviews.filter((_, idx) => i !== idx)
                          );

                          setNewImageFiles(
                            newImageFiles.filter((_, idx) => i !== idx)
                          );
                        }}
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className='flex w-full gap-2 pb-6 pt-3'>
        <Button
          className='w-full mt-0 h-13'
          type='submit'
          disabled={isPending || (mode === 'edit' && !isDirty)}
        >
          {isPending
            ? 'Sparar...'
            : mode === 'edit'
              ? 'Uppdatera produkt'
              : 'Spara produkt'}
        </Button>
        <Button
          className='w-full mt-0 h-13'
          variant='outline'
          type='reset'
          disabled={isPending}
        >
          Rensa
        </Button>
      </div>
    </form>
  );
}
