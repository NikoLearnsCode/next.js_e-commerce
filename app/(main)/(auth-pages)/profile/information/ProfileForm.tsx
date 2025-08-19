'use client';

import {Button} from '@/components/shared/button';
import {Link} from '@/components/shared/link';
import {useState, useTransition, useRef, useEffect} from 'react';
import {updateProfileAction} from '@/actions/profile';

import {toast} from 'sonner';
import {useRouter} from 'next/navigation';
import {motion} from 'framer-motion';
import {ArrowRight} from 'lucide-react';
import AnimatedAuthContainer from '@/components/shared/AnimatedContainer';
interface ProfileFormProps {
  fullName: string;
  email: string;
  userId: string;
  phoneNumber?: string;
}

export default function ProfileForm({
  fullName,
  email,
  userId,
  phoneNumber = '',
}: ProfileFormProps) {
  const [fullNameValue, setFullNameValue] = useState(fullName);
  const [phoneNumberValue, setPhoneNumberValue] = useState(phoneNumber);
  const [isUpdatingProfile, startProfileTransition] = useTransition();

  const router = useRouter();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [editingPhone, setEditingPhone] = useState(false);

  const nameHasChanged = fullNameValue !== fullName;
  const phoneHasChanged = phoneNumberValue !== phoneNumber;

  useEffect(() => {
    if (editingName && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [editingName]);

  useEffect(() => {
    if (editingPhone && phoneInputRef.current) {
      phoneInputRef.current.focus();
    }
  }, [editingPhone]);

  const handleSubmit = async (field: 'fullName' | 'phoneNumber') => {
    startProfileTransition(async () => {
      try {
        const formData = new FormData();
        formData.append('userId', userId);

        if (field === 'fullName') {
          formData.append('fullName', fullNameValue);
          formData.append('updateType', 'fullName');
          setEditingName(false);
        } else {
          formData.append('phoneNumber', phoneNumberValue);
          formData.append('updateType', 'phoneNumber');
          setEditingPhone(false);
        }

        const result = await updateProfileAction(formData);

        if (result.success) {
          toast.success(
            field === 'fullName'
              ? 'Namn har uppdaterats'
              : 'Telefonnummer har uppdaterats'
          );
        }
      } catch (error: any) {
        if (error.message === 'UNAUTHORIZED') {
          router.push('/sign-in');
          return;
        }
        toast.error('Något gick fel vid uppdatering av profilen');
        console.error('Error updating profile:', error);
      }
    });
  };

  return (
    <AnimatedAuthContainer direction='left'>
      <div className='bg-white rounded-xs   w-full'>
        <div className='px-4 '>
          <span className='flex justify-between items-center mb-8'>
            <h1 className='text-xl uppercase font-syne font-medium '>
              Mina uppgifter
            </h1>
            <Link
              className='text-xs px-0 text-primary font-medium hover:underline flex  gap-2  group tracking-wider '
              href='/profile'
            >
              {' '}
              Tillbaka
              <ArrowRight
                size={16}
                strokeWidth={1.5}
                className='group-hover:translate-x-1 transition-transform duration-300'
              />
            </Link>
          </span>
        </div>

        {/* Full Name  */}
        <div className=' px-4 py-4'>
          <div className='flex justify-between items-center'>
            <span className='font-semibold uppercase '>namn:</span>
            <div className='flex items-center h-6'>
              {!editingName ? (
                <Button
                  variant='link'
                  size='profile'
                  onClick={() => setEditingName(true)}
                  className='font-medium text-black  p-0 h-auto'
                >
                  Redigera
                </Button>
              ) : (
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.1}}
                  className='flex gap-2'
                >
                  <Button
                    type='button'
                    variant='ghost'
                    size='profile'
                    onClick={() => {
                      setEditingName(false);
                      setFullNameValue(fullName);
                    }}
                    className='h-6 px-2 text-xs'
                  >
                    Avbryt
                  </Button>
                  <Button
                    type='button'
                    size='profile'
                    onClick={() => handleSubmit('fullName')}
                    disabled={isUpdatingProfile || !nameHasChanged}
                    className={`h-6 px-2 text-xs ${!nameHasChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpdatingProfile ? '...' : 'Spara'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className='mt-0.5 relative'>
            {!editingName ? (
              <div className='text-black'>{fullNameValue}</div>
            ) : (
              <motion.div
                initial={{width: '40%', opacity: 0}}
                animate={{width: '100%', opacity: 1}}
                transition={{duration: 0.3}}
                className='w-full'
              >
                <input
                  ref={nameInputRef}
                  type='text'
                  value={fullNameValue}
                  onChange={(e) => setFullNameValue(e.target.value)}
                  className='w-full py-0 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-black h-auto'
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Phone Number */}
        <div className=' px-4 py-4'>
          <div className='flex justify-between items-center'>
            <span className='font-semibold uppercase '>mobil:</span>
            <div className='flex items-center h-6'>
              {!editingPhone ? (
                <Button
                  variant='link'
                  size='profile'
                  onClick={() => setEditingPhone(true)}
                  className='font-medium text-black  p-0 h-auto'
                >
                  Redigera
                </Button>
              ) : (
                <motion.div
                  initial={{opacity: 0}}
                  animate={{opacity: 1}}
                  transition={{delay: 0.1}}
                  className='flex gap-2'
                >
                  <Button
                    type='button'
                    variant='ghost'
                    size='profile'
                    onClick={() => {
                      setEditingPhone(false);
                      setPhoneNumberValue(phoneNumber);
                    }}
                    className='h-6 px-2 text-xs'
                  >
                    Avbryt
                  </Button>
                  <Button
                    type='button'
                    size='profile'
                    onClick={() => handleSubmit('phoneNumber')}
                    disabled={isUpdatingProfile || !phoneHasChanged}
                    className={`h-6 px-2 text-xs ${!phoneHasChanged ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isUpdatingProfile ? '...' : 'Spara'}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>

          <div className='pt-0.5 relative'>
            {!editingPhone ? (
              <div className='text-black'>{phoneNumberValue || '-'}</div>
            ) : (
              <motion.div
                initial={{width: '40%', opacity: 0}}
                animate={{width: '100%', opacity: 1}}
                transition={{duration: 0.3}}
                className='w-full'
              >
                <input
                  ref={phoneInputRef}
                  type='tel'
                  value={phoneNumberValue}
                  onChange={(e) => setPhoneNumberValue(e.target.value)}
                  className='w-full py-0 bg-transparent border-b border-gray-300 focus:border-black focus:outline-none text-black h-auto'
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Password  */}
        <div className='px-4 py-4 '>
          <div className='flex justify-between items-center'>
            <span className='font-semibold uppercase'>lösenord:</span>
            <div className='flex items-center h-6'>
              <Button
                variant='link'
                size='profile'
                asChild
                className='font-medium text-black p-0 h-auto'
              >
                <Link href='/profile/change-password'>Redigera</Link>
              </Button>
            </div>
          </div>
          <div className='mt-0.5 text-gray-500'>••••••••</div>
        </div>

        {/* Email  */}
        <div className='px-4 py-4 '>
          <div className='flex justify-between items-center'>
            <span className='font-semibold uppercase'>e-post</span>
            <div className='flex items-center h-6 cursor-not-allowed'>
              <Button
                disabled={true}
                variant='link'
                size='profile'
                asChild
                className='pointer-events-none font-medium opacity-30  text-black p-0 h-auto'
              >
                <span className=''>Redigera</span>
              </Button>
            </div>
          </div>
          <div className='mt-0.5 text-gray-500'>{email}</div>
        </div>
      </div>
    </AnimatedAuthContainer>
  );
}
