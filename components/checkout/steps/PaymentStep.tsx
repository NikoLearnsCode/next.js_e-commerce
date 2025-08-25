'use client';

import {useState} from 'react';
import {useForm} from 'react-hook-form';
import {zodResolver} from '@hookform/resolvers/zod';
import {FloatingLabelInput} from '@/components/shared/ui/floatingLabelInput';
import OrderTotals from '../shared/OrderTotals';
import {
  PaymentFormData,
  paymentSchema,
  DeliveryFormData,
} from '@/lib/validators';
import {Button} from '@/components/shared/ui/button';
import {Accordion} from '@/components/shared/ui/Accordion';
import {SiKlarna} from 'react-icons/si';
import Image from 'next/image';
import {CiCreditCard1} from 'react-icons/ci';
import {useCart} from '@/context/CartProvider';
import {createOrder} from '@/actions/orders';

interface PaymentStepProps {
  onBack?: () => void;
  onNext: () => void;
  deliveryData?: DeliveryFormData | null;
}

export default function PaymentStep({onNext, deliveryData}: PaymentStepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const {cartItems, totalPrice, clearCart} = useCart();

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: 'card',
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '01/25',
      cvv: '123',
      swishNumber: '123 456 7890',
      klarnaNumber: '1234567890',
      campaignCode: '',
    },
  });

  const selectedMethod = form.watch('paymentMethod');

  const handleSubmit = async (data: PaymentFormData) => {
    setIsLoading(true);
    try {
      const paymentInfo = {
        method: data.paymentMethod as 'card' | 'swish' | 'klarna',
      };
      if (!deliveryData) {
        throw new Error('Delivery data is required');
      }
      const result = await createOrder(
        cartItems,
        deliveryData,
        paymentInfo,
        totalPrice
      );
      if (!result.success || !result.orderId) {
        throw new Error(result.error || 'Failed to create order');
      }
      await clearCart();
      onNext();
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Ett fel uppstod vid betalningen. Försök igen.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={form.handleSubmit(handleSubmit)} className='space-y-8'>
        <h3 className='font-medium mb-2'>BETALNINGSMETOD</h3>
        <input type='hidden' {...form.register('paymentMethod')} />

        <Accordion.Root
          type='single'
          collapsible={false}
          className='space-y-4 '
          value={selectedMethod}
          onValueChange={(value) => {
            if (typeof value === 'string') {
              form.setValue(
                'paymentMethod',
                value as 'card' | 'swish' | 'klarna',
                {
                  shouldValidate: true,
                  shouldDirty: true,
                }
              );
            }
          }}
        >
          {/* KORT */}
          <Accordion.Item
            value='card'
            className='border overflow-hidden rounded-md transition-colors duration-200 data-[state=open]:border-black'
          >
            <Accordion.Trigger
              showChevron={false}
              className='px-4 py-3 cursor-pointer w-full data-[state=open]:outline-none'
            >
              <div className='flex items-center gap-3 w-full data-[state=open]:font-semibold'>
                <div className='p-2'>
                  <CiCreditCard1 size={32} />
                </div>
                <p className='font-medium'>Visa, Mastercard</p>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className='space-y-4 px-4 py-3'>
                <FloatingLabelInput
                  {...form.register('cardNumber')}
                  type='text'
                  id='cardNumber'
                  label='Kortnummer'
                />
                {form.formState.errors.cardNumber && (
                  <p className='text-red-500 text-sm'>
                    {form.formState.errors.cardNumber.message}
                  </p>
                )}

                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <FloatingLabelInput
                      {...form.register('expiryDate')}
                      type='text'
                      id='expiryDate'
                      label='Utgångsdatum'
                    />
                    {form.formState.errors.expiryDate && (
                      <p className='text-red-500 text-sm'>
                        {form.formState.errors.expiryDate.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <FloatingLabelInput
                      {...form.register('cvv')}
                      type='text'
                      id='cvv'
                      label='CVV'
                    />
                    {form.formState.errors.cvv && (
                      <p className='text-red-500 text-sm'>
                        {form.formState.errors.cvv.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* SWISH */}
          <Accordion.Item
            value='swish'
            className='border overflow-hidden rounded-md transition-colors duration-200 data-[state=open]:border-black'
          >
            <Accordion.Trigger
              showChevron={false}
              className='px-4 py-3 cursor-pointer w-full data-[state=open]:outline-none'
            >
              <div className='flex items-center gap-3 w-full data-[state=open]:font-semibold'>
                <div className='p-2'>
                  <div className='w-8 h-8 relative'>
                    <Image
                      src='/images/swish-logo-official.svg'
                      alt='Swish logo'
                      fill
                      sizes='auto'
                      priority
                      className='object-contain w-auto h-auto'
                    />
                  </div>
                </div>
                <p className='font-medium'>Swish</p>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className='px-4 py-3'>
                <FloatingLabelInput
                  {...form.register('swishNumber')}
                  type='text'
                  id='swishNumber'
                  label='Swishnummer'
                />
                {form.formState.errors.swishNumber && (
                  <p className='text-red-500 text-sm'>
                    {form.formState.errors.swishNumber.message}
                  </p>
                )}
              </div>
            </Accordion.Content>
          </Accordion.Item>

          {/* KLARNA */}
          <Accordion.Item
            value='klarna'
            className='border overflow-hidden rounded-md transition-colors duration-200 data-[state=open]:border-black'
          >
            <Accordion.Trigger
              showChevron={false}
              className='px-4 py-3 cursor-pointer w-full data-[state=open]:outline-none'
            >
              <div className='flex items-center gap-3 w-full data-[state=open]:font-semibold'>
                <div className='p-2'>
                  <SiKlarna size={32} className='text-[#ffb3c7]' />
                </div>
                <p className='font-medium'>Klarna</p>
              </div>
            </Accordion.Trigger>
            <Accordion.Content>
              <div className='px-4 py-3'>
                <p className='text-sm text-gray-600'>
                  Betala senare med Klarna
                </p>
                <p className='text-xs text-gray-500 mt-2'>
                  När du klickar på "Betala" kommer du att omdirigeras till
                  Klarnas hemsida för att slutföra din betalning.
                </p>
              </div>
            </Accordion.Content>
          </Accordion.Item>
        </Accordion.Root>

        <div className='md:hidden mt-6'>
          <OrderTotals />
        </div>

        <Button
          type='submit'
          className='px-4 py-3 mt-0 h-16 cursor-pointer bg-black font-semibold text-base text-white w-full'
          disabled={isLoading || !selectedMethod}
        >
          {isLoading ? 'Bearbetar...' : `Betala ${totalPrice} kr`}
        </Button>
      </form>
    </div>
  );
}
