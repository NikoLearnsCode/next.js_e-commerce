import Link from 'next/link';
import {createClient} from '@/utils/supabase/server';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import LogoutButton from '@/app/(main)/(auth-pages)/profile/LogoutButton';

export const metadata: Metadata = {
  title: 'Mitt konto',
};

export default async function ProfilePage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/');
  }

  return (
    <div className=' py-8 font-syne '>
      <h1 className='text-4xl  mb-12  border-black w-fit '>Mitt konto</h1>
      <div className='flex flex-col justify-center items-center space-y-6'>
        <Link
          href='/profile/information'
          className='text-lg font-normal uppercase hover:underline w-fit'
        >
          Mina uppgifter
        </Link>

        <Link
          href='/profile/orders'
          className='text-lg font-normal uppercase hover:underline w-fit'
        >
          Mina ordrar
        </Link>

        {/* <Link
          href='/profile/address'
          className='text-lg font-medium hover:underline w-fit'
        >
          Mina adresser
        </Link> */}

        <LogoutButton className='mt-10' />
      </div>
    </div>
  );
}
