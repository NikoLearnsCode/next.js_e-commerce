'use client';

import {useTransition, useState, FormEvent} from 'react';
import {Button} from '@/components/shared/button';
import Link from 'next/link';

import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {signInAction} from '@/actions/auth';
import {useSearchParams, useRouter} from 'next/navigation';
import {ArrowLeft, Loader2, Eye, EyeOff} from 'lucide-react';
import {useCart} from '@/context/CartProvider';

export default function SignInForm() {
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();
  const router = useRouter();

  const {refreshCart} = useCart();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const source = searchParams.get('source');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const guestCallbackUrl = callbackUrl.includes('?')
    ? `${callbackUrl}&guest=true`
    : `${callbackUrl}?guest=true`;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('email', email);
    formData.append('password', password);
    formData.append('callbackUrl', callbackUrl);

    startTransition(async () => {
      try {
        const result: {success: boolean; callbackUrl?: string; error?: string} =
          await signInAction(formData);

        if (result.success) {
          await refreshCart();
          // Redirecta till värde i sessionStorage om det finns
          const redirect = sessionStorage.getItem('postLoginRedirect');
          if (redirect) {
            sessionStorage.removeItem('postLoginRedirect');
            router.replace(redirect);
          } else {
            router.push(result.callbackUrl || '/');
          }
        } else {
          setErrorMessage(result.error || 'Något gick fel under inloggningen.');
          if (!result.error) {
            console.error(
              '[SignInForm] Login failed without specific error message:',
              result
            );
          }
        }
      } catch (error) {
        console.error('[SignInForm] Login transition error:', error);
        setErrorMessage('Ett oväntat fel inträffade.');
      }
    });
  };

  const handleInputChange = () => {
    setErrorMessage(null);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className='mx-auto px-4'>
        <fieldset disabled={isPending} className='flex flex-col gap-2'>
          <span
            className={`${isPending ? 'pointer-events-none opacity-50' : ''}`}
          >
            <h1 className='text-lg uppercase font-semibold '>Logga in</h1>
            <p className='text-sm font-medium'>
              Har du inget konto?{' '}
              <Link
                className={' text-primary font-medium underline'}
                href={{
                  pathname: '/sign-up',
                  query:
                    source === 'checkout'
                      ? {source: 'checkout', callbackUrl: callbackUrl}
                      : {},
                }}
              >
                Skapa konto
              </Link>
            </p>
          </span>

          {errorMessage && (
            <div className=' text-red-600  border-red-600 px-1 text-sm mt-2'>
              {errorMessage}
            </div>
          )}

          <div className='flex flex-col mt-3'>
            <FloatingLabelInput
              id='email'
              name='email'
              label='E-postadress'
              type='email'
              required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                handleInputChange();
              }}
            />
          </div>

          <div className='mt-2'>
            <div className='relative'>
              <FloatingLabelInput
                id='password'
                label='Lösenord'
                type={showPassword ? 'text' : 'password'}
                name='password'
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage('');
                }}
                required
                className='pr-10'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 focus:text-black hover:text-black focus:outline-none'
                aria-label={showPassword ? 'Dölj lösenord' : 'Visa lösenord'}
              >
                {showPassword ? (
                  <EyeOff className='h-5 w-5 ' />
                ) : (
                  <Eye className='h-5 w-5 ' />
                )}
              </button>
            </div>
          </div>
          <div className='flex justify-end'>
            <Link
              className={`${isPending ? 'pointer-events-none opacity-50' : ''} text-xs mt-1 text-primary font-medium underline`}
              href={
                source === 'checkout'
                  ? '/forgot-password?source=checkout'
                  : '/forgot-password'
              }
            >
              Glömt lösenord?
            </Link>
          </div>
        </fieldset>

        <Button
          type='submit'
          disabled={isPending}
          className='flex items-center w-full justify-center mt-3'
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Loggar in...
            </>
          ) : (
            'Logga in'
          )}
        </Button>
      </form>

      {source === 'checkout' && (
        <div className='flex flex-col items-center mt-4 px-4'>
          <div className='relative flex py-3 mb-4 items-center w-full'>
            <div className='flex-grow border-t border-gray-400'></div>
            <span className='flex-shrink mx-4 text-gray-500 text-xs uppercase'>
              Eller
            </span>
            <div className='flex-grow border-t border-gray-400'></div>
          </div>
          <Link
            href={guestCallbackUrl}
            passHref
            className={`${isPending ? 'pointer-events-none opacity-50' : ''} 	w-full`}
          >
            <Button variant='outline' className='w-full mt-0  border-black'>
              Fortsätt som gäst
            </Button>
          </Link>
        </div>
      )}

      {source !== 'checkout' && (
        <Link
          className={`${isPending ? 'pointer-events-none opacity-50' : ''} 	text-xs text-primary font-medium hover:underline flex justify-center  items-center gap-1 mt-6 group tracking-wider mx-auto text-center`}
          href='/'
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className='group-hover:-translate-x-1 transition-transform duration-300'
          />
          Tillbaka till startsidan
        </Link>
      )}
    </>
  );
}
