import type {Metadata} from 'next';
import SignUpForm from './sign-up-form';
import {Suspense} from 'react';

import AnimatedContainer from '@/components/shared/AnimatedContainer';

export const metadata: Metadata = {
  title: 'Sign Up',
};

export default async function Signup() {
  return (
    <Suspense fallback={null}>
      <AnimatedContainer direction='left'>
        <SignUpForm />
      </AnimatedContainer>
    </Suspense>
  );
}
