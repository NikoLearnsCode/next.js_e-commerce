import {Suspense} from 'react';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <AnimatedAuthContainer direction='down'>
        <ResetPasswordForm />
      </AnimatedAuthContainer>
    </Suspense>
  );
}
