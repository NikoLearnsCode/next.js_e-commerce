import {Metadata} from 'next';
import Newsletter from '@/components/shared/Newsletter';
import Homepage from '@/components/Homepage';

export const metadata: Metadata = {
  title: 'E-commerce Next.js 2025',
  description: 'E-commerce Next.js 2025',
};

export default async function Page() {
  return (
    <div className='w-full h-full'>
      <Homepage />
      <Newsletter />
    </div>
  );
}
