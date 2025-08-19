import MainCart from '@/components/cart/CartPage';
import {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Varukorg',
};

export default function CartPage() {
  return (
    <div className='w-full flex  justify-center max-w-[2000px] mx-auto py-8 pl-4 pr-4 lg:pl-4 lg:pr-8'>
      <div className='w-full '>
        <MainCart />
      </div>
    </div>
  );
}
