'use client';

import {useState, useTransition} from 'react';
import {Button} from '@/components/shared/button';
import Link from 'next/link';

import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {signUpAction} from '@/actions/auth';
import {useSearchParams, useRouter} from 'next/navigation';
import {Loader2, Eye, EyeOff} from 'lucide-react';
import {useCart} from '@/context/CartProvider';

export default function SignUpForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const {refreshCart} = useCart();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');

  // Read callbackUrl and source from search params
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const source = searchParams.get('source');

  const handleInputChange = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPasswordError(null);
  };

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);
    setPasswordError(null);

    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (password !== confirmPassword) {
      setPasswordError('Lösenorden matchar inte');
      return;
    }

    // Add callbackUrl to formData
    formData.append('callbackUrl', callbackUrl);

    setPasswordError(null);
    startTransition(async () => {
      try {
        const result: {
          success: boolean;
          callbackUrl?: string;
          error?: string;
          message?: string;
        } = await signUpAction(formData);

        if (result.success) {
          setEmail('');
          setPassword('');
          setConfirmPasswordValue('');
          // setSuccessMessage(
          //   result.message || 'Registrering lyckad! Kontrollera din e-post.'
          // );
          await refreshCart();
          router.push(result.callbackUrl || '/');
        } else {
          setErrorMessage(result.error || 'Registreringen misslyckades.');
        }
      } catch (error) {
        console.error('Registration error:', error);
        setErrorMessage('Ett oväntat fel inträffade under registreringen.');
      }
    });
  };

  return (
    <form action={handleSubmit} className='flex flex-col mx-auto px-4 gap-2'>
      <h1 className='text-lg uppercase font-semibold '>Skapa konto</h1>
      <p className='text-sm font-medium'>
        Har du redan ett konto?{' '}
        <Link
          className={' text-primary font-medium underline'}
          href={source === 'checkout' ? '/sign-in?source=checkout' : '/sign-in'}
        >
          Logga in
        </Link>
      </p>

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

      {passwordError && (
        <div className=' text-red-600  border-red-600 px-1 text-sm mt-2'>
          {passwordError}
        </div>
      )}

      <div className='flex flex-col mt-3'>
        <FloatingLabelInput
          id='email'
          name='email'
          label='E-postadress'
          type='email'
          value={email}
          required
          disabled={isPending}
          onChange={(e) => {
            setEmail(e.target.value);
            handleInputChange();
          }}
        />
      </div>
      <div className='my-2'>
        <div className='relative'>
          <FloatingLabelInput
            id='password'
            name='password'
            label='Lösenord'
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
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700 focus:outline-none'
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
      <div>
        <div className='relative'>
          <FloatingLabelInput
            id='confirmPassword'
            name='confirmPassword'
            label='Bekräfta lösenord'
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPasswordValue}
            required
            disabled={isPending}
            onChange={(e) => {
              setConfirmPasswordValue(e.target.value);
              handleInputChange();
            }}
            className='pr-10'
          />
          <button
            type='button'
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-gray-700 focus:outline-none'
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
        className='flex items-center justify-center mt-4'
      >
        {isPending ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' />
            Skapar konto...
          </>
        ) : (
          'Skapa konto'
        )}
      </Button>
    </form>
  );
}