'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {Button} from '@/components/shared/button';
import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {DeliveryFormData, deliverySchema} from '@/lib/validators';

interface DeliveryStepProps {
  onNext: (data: DeliveryFormData) => void;
  initialData?: DeliveryFormData | null;
}

export default function DeliveryStep({onNext, initialData}: DeliveryStepProps) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<DeliveryFormData>({
    shouldUnregister: false,
    resolver: zodResolver(deliverySchema),
    defaultValues: initialData || {
      deliveryMethod: '',
      firstName: 'Brick',
      lastName: 'Tamland',
      email: 'ilovelamp@channel4.com',
      phone: '123 456 7890',
      address: '123 Main St',
      postalCode: '101 101',
      city: 'San Diego',
    },
  });

  const selectedMethod = form.watch('deliveryMethod');

  const selectDeliveryMethod = (method: string) => {
    form.setValue('deliveryMethod', method, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit = async (data: DeliveryFormData) => {
    setIsLoading(true);
    try {
      onNext(data);
    } catch (error) {
      console.error('Error in onSubmit handler:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <input
          type='hidden'
          {...form.register('deliveryMethod')}
          value={selectedMethod || ''}
        />

        <div className='space-y-4'>
          <h2 className='text-lg font-medium'>Leveransmetod</h2>
          <div className='grid grid-cols-2 gap-3'>
            <div
              className={`flex h-16 justify-center items-center p-2 w-full border  hover:border-black cursor-pointer transition-colors duration-200 ${selectedMethod === 'home' ? 'border-black bg-gray-50' : 'border-gray-300'}`}
              onClick={() => selectDeliveryMethod('home')}
              tabIndex={0}
              role='radio'
              aria-checked={selectedMethod === 'home'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectDeliveryMethod('home');
                }
              }}
            >
              <input
                type='radio'
                value='home'
                id='radio-home'
                checked={selectedMethod === 'home'}
                readOnly
                className='hidden'
              />
              <div className='text-sm text-center'>
                <p
                  className={`font-medium ${selectedMethod === 'home' ? 'font-semibold' : ''}`}
                >
                  Hemleverans
                </p>
                <p className='text-gray-600'>GRATIS</p>
              </div>
            </div>

            <div
              className={`flex h-16 justify-center items-center p-2 w-full border  hover:border-black cursor-pointer transition-colors duration-200 ${selectedMethod === 'pickup' ? 'border-black bg-gray-50' : 'border-gray-300'}`}
              onClick={() => selectDeliveryMethod('pickup')}
              tabIndex={0}
              role='radio'
              aria-checked={selectedMethod === 'pickup'}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  selectDeliveryMethod('pickup');
                }
              }}
            >
              <input
                type='radio'
                value='pickup'
                id='radio-pickup'
                checked={selectedMethod === 'pickup'}
                readOnly
                className='hidden'
              />
              <div className='text-sm text-center'>
                <p
                  className={`font-medium ${selectedMethod === 'pickup' ? 'font-semibold' : ''}`}
                >
                  Upphämtningsplats
                </p>
                <p className='text-gray-600'>GRATIS</p>
              </div>
            </div>
          </div>
          {form.formState.errors.deliveryMethod && (
            <span className='text-red-500 text-sm'>
              {form.formState.errors.deliveryMethod.message}
            </span>
          )}
        </div>

        <div className='space-y-6'>
          <h2 className='text-lg font-medium'>Leveransinformation</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <div>
              <FloatingLabelInput
                {...form.register('firstName')}
                id='firstName'
                label='Förnamn'
                autoComplete='given-name'
              />
              {form.formState.errors.firstName && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <FloatingLabelInput
                {...form.register('lastName')}
                id='lastName'
                label='Efternamn'
                autoComplete='family-name'
              />
              {form.formState.errors.lastName && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <FloatingLabelInput
                {...form.register('email')}
                id='email'
                type='email'
                label='E-post'
                autoComplete='email'
              />
              {form.formState.errors.email && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>
            <div>
              <FloatingLabelInput
                {...form.register('phone')}
                id='phone'
                type='tel'
                label='Telefon'
                autoComplete='tel'
              />
              {form.formState.errors.phone && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <FloatingLabelInput
              {...form.register('address')}
              id='address'
              label='Adress'
              autoComplete='street-address'
            />
            {form.formState.errors.address && (
              <p className='text-red-500 text-sm mt-1'>
                {form.formState.errors.address.message}
              </p>
            )}
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <FloatingLabelInput
                {...form.register('postalCode')}
                id='postalCode'
                label='Postnummer'
                autoComplete='postal-code'
              />
              {form.formState.errors.postalCode && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.postalCode.message}
                </p>
              )}
            </div>
            <div>
              <FloatingLabelInput
                {...form.register('city')}
                id='city'
                label='Stad'
                autoComplete='address-level2'
              />
              {form.formState.errors.city && (
                <p className='text-red-500 text-sm mt-1'>
                  {form.formState.errors.city.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <Button
          type='submit'
          disabled={isLoading || !selectedMethod}
          className='w-full mt-0 h-13'
        >
          {isLoading
            ? 'Sparar...'
            : !selectedMethod
              ? 'Välj en leveransmetod'
              : 'Fortsätt till betalning'}
        </Button>
      </form>
    </div>
  );
}
