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

  return (
    <div className=' py-8 font-syne '>
      <h1 className='text-4xl  mb-12  border-black w-fit '>Mitt konto</h1>
      <div className='flex flex-col justify-center items-center space-y-6'>
        <Link
          href='/profile/orders'
          className='text-lg font-normal uppercase hover:underline w-fit'
        >
          Mina ordrar
        </Link>

        <LogoutButton className='mt-10' />
      </div>
    </div>
  );
}
