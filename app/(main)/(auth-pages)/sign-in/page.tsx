import type {Metadata} from 'next';
import SignInForm from './sign-in-form';
import {Suspense} from 'react';
import {authOptions} from '@/lib/auth.config';
import {getServerSession} from 'next-auth';
import {redirect} from 'next/navigation';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Logga in',
  };
}

export default async function Login() {
  const session = await getServerSession(authOptions);

  if (session?.user) {
    return redirect('/profile');
  }
  return (
    <Suspense fallback={null}>
      <SignInForm />
    </Suspense>
  );
}
