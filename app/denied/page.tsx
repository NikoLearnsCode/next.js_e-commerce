import {Metadata} from 'next';
import {Link} from '@/components/shared/ui/link';
import {ArrowLeft} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Access Denied',
};

export default async function Denied() {
  return (
    <div className='flex -mt-[56px] flex-col items-center pb-32 justify-center h-screen'>
      <h1 className='text-3xl uppercase font-syne font-bold'>ACCESS DENIED</h1>
      <Link
        href='/'
        variant='underline'
        className='mt-6 tracking-wider h-8 gap-2 font-syne  text-sm font-medium  group'
      >
        <ArrowLeft
          size={18}
          strokeWidth={1.25}
          className='group-hover:-translate-x-1 mb-[1px] transition-transform duration-300'
        />
        Gå tillbaka
      </Link>
    </div>
  );
}
