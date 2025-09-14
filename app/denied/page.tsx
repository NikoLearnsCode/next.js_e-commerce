import {Metadata} from 'next';
import {Link} from '@/components/shared/ui/link';

export const metadata: Metadata = {
  title: 'Access Denied',
};

export default async function Denied() {
  return (
    <div className='flex -mt-[56px] flex-col items-center pb-32 justify-center h-screen'>
      <h1 className='text-3xl uppercase font-syne font-bold'>ACCESS DENIED</h1>
      <Link
        href='/'
        variant='secondary'
        className='mt-6 uppercase h-8 text-xs font-bold font-syne '
      >
        go back to homepage
      </Link>
    </div>
  );
}
