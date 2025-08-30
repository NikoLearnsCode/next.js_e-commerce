import Link from 'next/link';
import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import {authOptions} from '@/lib/auth.config';
import LogoutButton from '@/app/(main)/(auth-pages)/profile/LogoutButton';
import {ArrowRight} from 'lucide-react';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Mitt konto',
  };
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return redirect('/sign-in');
  }

  const user = session?.user?.name?.split(' ')[0];

  return (
    <div className=' py-8  '>
      <h1 className='text-4xl  mb-16 mx-auto border-black w-fit '>
        Hej {user}
      </h1>
      <div className='flex flex-col justify-center items-center space-y-6'>
        <Link
          href='/profile/orders'
          className='text-base font-medium  hover:underline w-fit underline-offset-4 flex items-center gap-2 group'
        >
          Mina beställningar
          <ArrowRight
            size={16}
            strokeWidth={1.5}
            className='group-hover:translate-x-1  transition-transform duration-300'
          />
        </Link>

        <LogoutButton className='mt-10' />
      </div>
    </div>
  );
}
