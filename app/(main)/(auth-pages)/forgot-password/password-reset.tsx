'use client';
import {useState, useTransition} from 'react';
import {Button} from '@/components/shared/button';
import Link from 'next/link';

import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import {forgotPasswordAction} from '@/actions/auth';
import {ArrowLeft, Loader2} from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function PasswordResetForm() {
  const [isPending, startTransition] = useTransition();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const router = useRouter();
  const handleInputChange = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (formData: FormData) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await forgotPasswordAction(formData);
        if (result.success) {
          setSuccessMessage(result.message || 'Återställningslänk skickad!');
          setTimeout(() => {
            router.push('/');
          }, 2000);
        } else {
          setErrorMessage(result.error || 'Något gick fel.');
        }
      } catch (error) {
        console.error('Forgot password error:', error);
        setErrorMessage('Ett oväntat fel inträffade.');
      }
    });
  };

  return (
    <>
      <form action={handleSubmit} className='flex flex-col mx-auto px-4 gap-2'>
        <h1 className='text-lg uppercase font-semibold'>Återställ Lösenord</h1>
        <p className='text-sm tracking-wide font-medium'>
          Skriv in din e-postadress så skickar vi en återställningslänk.
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

        <div className='flex flex-col mt-3'>
          <FloatingLabelInput
            id='email'
            name='email'
            label='E-postadress'
            type='email'
            required
            // disabled={isPending}
            disabled={true}
            onChange={handleInputChange}
          />
        </div>

        <Button
          type='submit'
          // disabled={isPending}
          disabled={true}
          className='mt-3'
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4  animate-spin' />
              Skickar...
            </>
          ) : (
            // 'Skicka återställningslänk'
            'Tillfälligt inaktiverad'
          )}
        </Button>
      </form>

      <Link
        className='text-xs text-primary font-medium hover:underline flex justify-center  items-center gap-1 mt-6 group tracking-wider mx-auto text-center'
        href='/sign-in'
      >
        <ArrowLeft
          size={14}
          strokeWidth={1.5}
          className='group-hover:-translate-x-1 transition-transform duration-300'
        />
        Tillbaka till inloggning
      </Link>
    </>
  );
}
