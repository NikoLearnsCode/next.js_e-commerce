import type {Metadata} from 'next';
import PasswordResetForm from './password-reset';
import {Suspense} from 'react';

import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';

export const metadata: Metadata = {
  title: 'Återställ lösenord',
};

export default async function PasswordReset() {
  return (
    <Suspense fallback={null}>
      <AnimatedAuthContainer direction='up'>
        <PasswordResetForm />
      </AnimatedAuthContainer>
    </Suspense>
  );
}
