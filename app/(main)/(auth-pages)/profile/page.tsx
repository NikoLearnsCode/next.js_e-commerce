import Link from 'next/link';
import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import {authOptions} from '@/lib/auth';
import LogoutButton from '@/app/(main)/(auth-pages)/profile/LogoutButton';

export const metadata: Metadata = {
  title: 'Mitt konto',
};

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
          className='text-lg font-normal uppercase hover:underline w-fit underline-offset-4'
        >
          Beställningar
        </Link>

        <LogoutButton className='mt-10' />
      </div>
    </div>
  );
}
