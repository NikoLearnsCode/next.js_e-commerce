// components/admin/ProductForm.tsx

'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {Button} from '@/components/shared/ui/button';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {useAdmin} from '@/context/AdminContextProvider';

export default function ProductForm() {
  const {categories} = useAdmin();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: 'Test Product',
      slug: 'test-product',
      description:
        'Detta är en fantastisk testprodukt med många fina egenskaper.',
      price: '100',
      brand: 'Test Brand',
      gender: 'herr',
      category: '',
      color: 'svart',
      specs: [],
      images: [],
      sizes: [],
    },
  });

  const onSubmit = (data: ProductFormData) => {
    console.log(data);
  };

  // Definiera alla fält först
  const allFields = [
    {name: 'name', label: 'Produktnamn', type: 'text'},
    {name: 'slug', label: 'Slug', type: 'text'},
    {name: 'price', label: 'Pris (SEK)', type: 'number'},
    {name: 'brand', label: 'Märke', type: 'text'},
    {name: 'color', label: 'Färg', type: 'text'},
    {name: 'gender', label: 'Kön', type: 'text'},
    {name: 'category', label: 'Kategori', type: 'text'}, 
    {name: 'sizes', label: 'Storlekar (kommaseparerade)', type: 'text'},
    {
      name: 'description',
      label: 'Beskrivning',
      type: 'textarea',
      className: 'h-32',
    },
    {
      name: 'specs',
      label: 'Specifikationer (en per rad)',
      type: 'textarea',
      className: 'h-24',
    },
    {
      name: 'images',
      label: 'Bilder (en URL per rad)',
      type: 'textarea',
      className: 'h-24',
    },
  ];


  const regularFields = allFields.filter(
    (field) => field.name !== 'category' && field.type !== 'textarea'
  );
  const textareaFields = allFields.filter((field) => field.type === 'textarea');

  return (
    <div className='overflow-y-auto'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 overflow-y-auto'
      >
        {/* KATEGORI-DROPDWON */}
        <div className='pt-2 border'>
          <label
            htmlFor='category-select'
            className='block text-sm font-medium sr-only text-gray-700 mb-1'
          >
            Kategori
          </label>
          <select
            id='category-select'
            className='block w-full h-12 px-3 text-base border-gray-400 focus:outline-none focus:ring-black focus:border-black rounded-xs'
            {...form.register('category')}
          >
            <option value=''>-- Välj en kategori --</option>
            {categories.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
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
            />
          ))}
        </div>
        <div className='flex justify-end gap-2 pb-5'>
          <Button className='w-full h-12' type='submit'>
            Spara produkt
          </Button>
          <Button className='w-full h-12' variant='outline' type='button'>
            Rensa
          </Button>
        </div>
      </form>
    </div>
  );
}
