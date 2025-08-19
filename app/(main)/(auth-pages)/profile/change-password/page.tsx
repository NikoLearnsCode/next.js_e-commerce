import {createClient} from '@/utils/supabase/server';
import ChangePasswordForm from './change-password';
import {Metadata} from 'next';
import {redirect} from 'next/navigation';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
export const metadata: Metadata = {
  title: 'Byt lösenord',
};

export default async function page() {
  const supabase = await createClient();

  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect('/sign-in?next=/profile/change-password');
  }

  return (
    <AnimatedAuthContainer direction='down'>
      <ChangePasswordForm />
    </AnimatedAuthContainer>
  );
}
