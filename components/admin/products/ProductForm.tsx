'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {Button} from '@/components/shared/ui/button';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';

export default function ProductForm() {
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
      category: 'byxor',
      color: 'svart',
      specs: ['test spec 1', 'test spec 2'],
      images: ['test image 1', 'test image 2'],
      sizes: ['XS', 'S', 'M', 'L', 'XL'],
    },
  });

  const onSubmit = (data: ProductFormData) => {
    console.log(data);
  };

  return (
    <div className='overflow-y-auto'>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 overflow-y-auto'
      >
        <div className='grid grid-cols-1 gap-5 md:grid-cols-1'>
          {[
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
              className: ' h-32',
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
          ].map((field) => (
            <FloatingLabelInput
              key={field.name}
              {...form.register(field.name as keyof ProductFormData)}
              id={field.name}
              label={field.label}
              as={field.type === 'textarea' ? 'textarea' : 'input'}
              type={field.type !== 'textarea' ? field.type : undefined}
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
