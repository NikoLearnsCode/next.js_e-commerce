import type {Metadata} from 'next';
import SignInForm from './sign-in-form';
import {Suspense} from 'react';

import AnimatedContainer from '@/components/shared/AnimatedContainer';

export const metadata: Metadata = {
  title: 'Logga in',
};

export default async function Login() {
  return (
    <Suspense fallback={null}>
      <AnimatedContainer direction='right'>
        <SignInForm />
      </AnimatedContainer>
    </Suspense>
  );
}
