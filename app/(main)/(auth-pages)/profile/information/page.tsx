import {createClient} from '@/utils/supabase/server';
import {redirect} from 'next/navigation';
import {Metadata} from 'next';
import ProfileForm from './ProfileForm';

export const metadata: Metadata = {
  title: 'Mina uppgifter',
};

export default async function UserInformationPage() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in?next=/profile/information');
  }

  // Get user data from metadata
  const fullName =
    `${user.user_metadata?.first_name || ''} ${user.user_metadata?.last_name || ''}`.trim();
  const email = user.email || '';
  const phoneNumber = user.user_metadata?.phone_number || '';

  return (
    <div className='w-full'>
      <ProfileForm
        fullName={fullName}
        email={email}
        userId={user.id}
        phoneNumber={phoneNumber}
      />
    </div>
  );
}
