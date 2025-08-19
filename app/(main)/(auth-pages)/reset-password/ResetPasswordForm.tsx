'use client';

import {useState, useTransition} from 'react';
import {Button} from '@/components/shared/button';
import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {resetPasswordAction} from '@/actions/auth';
import {Loader2, Eye, EyeOff} from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const pwd = formData.get('password') as string;
    const confirmPwd = formData.get('confirmPassword') as string;
    if (pwd !== confirmPwd) {
      setErrorMessage('Lösenorden matchar inte');
      return;
    }

    startTransition(async () => {
      try {
        const result = await resetPasswordAction(formData);
        if (result.success) {
          setSuccessMessage(result.message || 'Lösenordet har återställts!');
          router.push('/');
        } else {
          setErrorMessage(result.error || 'Något gick fel.');
        }
      } catch (error) {
        console.error('Password reset error:', error);
        setErrorMessage('Ett oväntat fel inträffade.');
      }
    });
  };

  const handleInputChange = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  return (
    <form action={handleSubmit} className='flex flex-col mx-auto px-4 gap-2'>
      <h1 className='text-lg uppercase font-semibold'>Välj nytt lösenord</h1>
      <p className='text-sm font-medium'>Ange ditt nya lösenord nedan.</p>

      {errorMessage && (
        <div className=' text-red-600  border-red-600 px-1 text-sm mt-2'>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className=' text-green-700  border-green-700 px-1 text-sm mt-2'>
          {successMessage}
        </div>
      )}

      <div className='flex flex-col mt-3'>
        <div className='relative'>
          <FloatingLabelInput
            id='password'
            name='password'
            label='Nytt lösenord'
            type={showPassword ? 'text' : 'password'}
            value={password}
            required
            disabled={isPending}
            onChange={(e) => {
              setPassword(e.target.value);
              handleInputChange();
            }}
            className='pr-10'
          />
          <button
            type='button'
            onClick={() => setShowPassword(!showPassword)}
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 focus:text-black hover:text-black outline-none'
            aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
          >
            {showPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <div className='mt-2'>
        <div className='relative'>
          <FloatingLabelInput
            id='confirmPassword'
            name='confirmPassword'
            label='Bekräfta nytt lösenord'
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            required
            disabled={isPending}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              handleInputChange();
            }}
            className='pr-10'
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-black focus:text-black outline-none'
            aria-label={
              showConfirmPassword
                ? 'Dölj bekräftelselösenord'
                : 'Visa bekräftelselösenord'
            }
          >
            {showConfirmPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <Button
        type='submit'
        disabled={isPending}
        className='flex items-center justify-center w-full mt-4'
      >
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Sparar...
          </>
        ) : (
          'Spara nytt lösenord'
        )}
      </Button>
    </form>
  );
}
