'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {productFormSchema, type ProductFormData} from '@/lib/form-validators';
import {Button} from '@/components/shared/ui/button';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import {CustomTextarea} from '@/components/shared/ui/CustomTextarea';

export default function ProductForm() {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      name: 'Test Product',
      slug: 'test-product',
      description: 'test description',
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
  <div>
    <form onSubmit={form.handleSubmit(onSubmit)}>
    <div>
      {[
        {
          name: 'name',
          label: 'Namn',
          type: 'text',
        },
        {
          name: 'name',
          label: 'Namn',
          type: 'text',
        },
        {
          name: 'name',
          label: 'Namn',
          type: 'text',
        },
        {
          name: 'name',
          label: 'Namn',
          type: 'text',
        },
        {
          name: 'name',
          label: 'Namn',
          type: 'text',
        },
      ]}
    </div>










    </form>
  </div>
  );
}
