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
import Image from 'next/image';
import {Product} from '@/lib/types/db';

type ProductFormProps = {
  mode: 'create' | 'edit';
  initialData?: Product | null;
};

export default function ProductForm({mode, initialData}: ProductFormProps) {
  const {categories, createProduct, updateProduct, closeSidebar, isLoading} =
    useAdmin();
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState<
    DropdownOption[]
  >([]);

  // Sätt defaultValues baserat på mode och initialData
  const getDefaultValues = (): Partial<ProductFormData> => {
    if (mode === 'edit' && initialData) {
      return {
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        price:
          typeof initialData.price === 'string'
            ? parseInt(initialData.price)
            : initialData.price,
        brand: initialData.brand,
        color: initialData.color,
        gender: initialData.gender,
        category: initialData.category,
        sizes: Array.isArray(initialData.sizes)
          ? initialData.sizes.join(',')
          : '',
        specs: Array.isArray(initialData.specs)
          ? initialData.specs.join('\n')
          : '',
      };
    }

    // Default values för create mode (för development)
    return {
      name: 'test',
      slug: 'test',
      description: 'test',
      price: 1337,
      brand: 'test',
      color: 'test',
      gender: '',
      category: '',
      sizes: 'S,M,L',
      specs: 'Material: Bomull',
    };
  };

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(),
  });

  // Ladda befintliga bilder vid edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData?.images) {
      // TODO: Sätt imagePreviews till befintliga bilder
      // setImagePreviews(initialData.images);
      console.log('Edit mode - existing images:', initialData.images);
    }
  }, [mode, initialData]);

  // Hämta errors-objektet från formState. Det uppdateras automatiskt.
  const {errors} = form.formState;

  const selectedMainCategorySlug = form.watch('gender');

  useEffect(() => {
    if (!selectedMainCategorySlug) {
      setSubCategoryOptions([]);
      form.resetField('category');
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
  }, [selectedMainCategorySlug, categories, form]);

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
      // TODO: Hantera bilduppladdning separat för edit mode
      // TODO: I edit mode, hantera både nya bilder och befintliga bilder

      if (mode === 'edit' && initialData) {
        // Update mode
        await updateProduct(initialData.id, data);
      } else {
        // Create mode - använd befintlig logik
        await createProduct(data);
      }

      // Reset form och stäng sidebar hanteras i context funktionerna
      form.reset();
      setImageFiles([]);
      setImagePreviews([]);
    } catch (error) {
      console.error('Form submission error:', error);
      // TODO: Visa error toast/notification
    }
  };

  const handleReset = () => {
    form.reset();
    setImageFiles([]);
    setImagePreviews([]);
  };

  const allFields = [
    {
      name: 'name',
      label: 'Produktnamn',
      type: 'text',
      className: '',
    },
    {name: 'slug', label: 'Slug', type: 'text'},
    {name: 'price', label: 'Pris (SEK)', type: 'number'},
    {name: 'brand', label: 'Märke', type: 'text'},
    {name: 'color', label: 'Färg', type: 'text'},

    {
      name: 'sizes',
      label: 'Storlekar (kommaseparerade)',
      type: 'text',
      className: 'col-span-2',
    },
    {
      name: 'description',
      label: 'Beskrivning',
      type: 'textarea',
      className: 'h-32  col-span-1',
    },
    {
      name: 'specs',
      label: 'Specifikationer (en per rad)',
      type: 'textarea',
      className: 'h-24  col-span-1',
    },
  ];

  const regularFields = allFields.filter((field) => field.type !== 'textarea');
  const textareaFields = allFields.filter((field) => field.type === 'textarea');

  return (
    <div className='overflow-y-auto'>
      <form
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className='space-y-6 overflow-y-auto'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5 pt-2'>
          <div>
            <label
              htmlFor='gender-select'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Huvudkategori
            </label>
            <select
              id='gender-select'
              className='block w-full h-12 px-3 text-base border-gray-400 focus:outline-none focus:ring-black focus:border-black rounded-xs'
              {...form.register('gender')}
            >
              <option value=''>-- Välj --</option>
              {categories.map((mainCat) => (
                <option key={mainCat.id} value={mainCat.slug}>
                  {mainCat.name}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className='text-xs text-destructive mt-1'>
                {errors.gender.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor='category-select'
              className='block text-sm font-medium text-gray-700 mb-1'
            >
              Underkategori
            </label>
            <select
              id='category-select'
              className='block w-full h-12 px-3 text-base border-gray-400 focus:outline-none focus:ring-black focus:border-black rounded-xs disabled:bg-gray-100'
              {...form.register('category')}
              disabled={
                !selectedMainCategorySlug || subCategoryOptions.length === 0
              }
            >
              <option value=''>-- Välj --</option>
              {subCategoryOptions.map((option) => (
                <option key={option.value} value={option.slug}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className='text-xs text-destructive mt-1'>
                {errors.category.message}
              </p>
            )}
          </div>
        </div>

        {/* VANLIGA TEXT-INPUTS */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-1'>
          {regularFields.map((field) => (
            <FloatingLabelInput
              key={field.name}
              {...form.register(field.name as keyof ProductFormData)}
              id={field.name}
              label={field.label}
              as={'input'}
              type={field.type}
              hasError={!!errors[field.name as keyof ProductFormData]}
              errorMessage={
                errors[field.name as keyof ProductFormData]?.message
              }
            />
          ))}

          {/* TEXTAREA-FÄLT */}
          {textareaFields.map((field) => (
            <FloatingLabelInput
              key={field.name}
              {...form.register(field.name as keyof ProductFormData)}
              id={field.name}
              label={field.label}
              as={'textarea'}
              className={field.className}
              hasError={!!errors[field.name as keyof ProductFormData]}
              errorMessage={
                errors[field.name as keyof ProductFormData]?.message
              }
            />
          ))}
        </div>

        {/* BILDUPPLADDNING */}
        <div className=' p-4 border border-gray-400 rounded-xs'>
          <label
            htmlFor='image-upload'
            className='block uppercase text-base font-medium   mb-4'
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
            <div className='mt-4   grid grid-cols-2 sm:grid-cols-3 gap-1'>
              {imagePreviews.map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  height={250}
                  width={160}
                  alt={`Förhandsgranskning ${index + 1}`}
                  className='w-full h-auto object-cover rounded-md'
                />
              ))}
            </div>
          )}
        </div>
        <div className='flex justify-end gap-2 pb-5'>
          <Button className='w-full h-12' type='submit' disabled={isLoading}>
            {isLoading
              ? mode === 'edit'
                ? 'Uppdaterar...'
                : 'Sparar...'
              : mode === 'edit'
                ? 'Uppdatera produkt'
                : 'Spara produkt'}
          </Button>
          <Button
            className='w-full h-12'
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
