import type {Metadata} from 'next';
import SignInForm from './sign-in-form';
import {Suspense} from 'react';

import AnimatedContainer from '@/components/shared/AnimatedContainer';
import {authOptions} from '@/lib/auth';
import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';

export const metadata: Metadata = {
  title: 'Logga in',
};

export default async function Login() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    return redirect('/profile');
  }
  return (
    <Suspense fallback={null}>
      <AnimatedContainer direction='down'>
        <SignInForm />
      </AnimatedContainer>
    </Suspense>
  );
}
