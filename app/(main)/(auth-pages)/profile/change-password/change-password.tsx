'use client';

import {useTransition, useState} from 'react';
import {changePasswordAction} from '@/actions/auth';
import {Button} from '@/components/shared/button';
import {FloatingLabelInput} from '@/components/shared/floatingLabelInput';
import Link from 'next/link';

import {Loader2, Eye, EyeOff, ArrowLeft} from 'lucide-react';
import {useRouter} from 'next/navigation';

export default function ChangePasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  // Input states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Local state for messages
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for password visibility
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    // Clear previous messages
    setErrorMessage(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const result = await changePasswordAction(formData);
        if (result.success) {
          setSuccessMessage(result.message || 'Lösenordet har uppdaterats!');
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            router.push('/profile');
          }, 1000);
        } else {
          setErrorMessage(result.error || 'Något gick fel.');
        }
      } catch (error) {
        console.error('Password change error:', error);
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
      <h1 className='text-lg uppercase font-semibold'>Ändra lösenord</h1>

      {/* Display messages from local state */}
      {errorMessage && (
        <div className=' text-red-600  border-red-600 px-1 text-base mt-2'>
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className=' text-green-700  border-green-700 px-1 text-base mt-2'>
          {successMessage}
        </div>
      )}

      <div className='flex flex-col mt-3'>
        {/* Current Password Input */}
        <div className='relative'>
          <FloatingLabelInput
            id='currentPassword'
            name='currentPassword'
            label='Nuvarande lösenord'
            type={showCurrentPassword ? 'text' : 'password'}
            value={currentPassword}
            required
            disabled={isPending}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              handleInputChange();
            }}
            className='pr-10'
          />
          <button
            type='button'
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-black focus:text-black outline-none'
            aria-label={
              showCurrentPassword
                ? 'Dölj nuvarande lösenord'
                : 'Visa nuvarande lösenord'
            }
          >
            {showCurrentPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <div className='my-2'>
        {/* New Password Input */}
        <div className='relative'>
          <FloatingLabelInput
            id='newPassword'
            name='newPassword'
            label='Nytt lösenord'
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            required
            disabled={isPending}
            onChange={(e) => {
              setNewPassword(e.target.value);
              handleInputChange();
            }}
            className='pr-10'
          />
          <button
            type='button'
            onClick={() => setShowNewPassword(!showNewPassword)}
            className='absolute inset-y-0 right-0 flex items-center justify-center h-full px-3 text-gray-500 hover:text-black focus:text-black outline-none'
            aria-label={
              showNewPassword ? 'Dölj nytt lösenord' : 'Visa nytt lösenord'
            }
          >
            {showNewPassword ? (
              <EyeOff className='h-5 w-5' />
            ) : (
              <Eye className='h-5 w-5' />
            )}
          </button>
        </div>
      </div>

      <div>
        {/* Confirm Password Input */}
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

      <div className='flex flex-col justify-between mt-4'>
        <Button
          type='submit'
          disabled={isPending}
          className='flex items-center mt-0 justify-center w-full'
        >
          {isPending ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Uppdaterar...
            </>
          ) : (
            'Ändra lösenord'
          )}
        </Button>
        <Link
          className={`${isPending ? 'pointer-events-none opacity-50' : ''} 	text-sm text-primary  hover:underline flex justify-center  items-center gap-1 mt-6 group tracking-wider mx-auto text-center`}
          href='/profile'
        >
          <ArrowLeft
            size={14}
            strokeWidth={1.5}
            className='group-hover:-translate-x-1 transition-transform duration-300'
          />
          Tillbaka
        </Link>
      </div>
    </form>
  );
}
