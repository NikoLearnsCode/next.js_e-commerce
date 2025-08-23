'use client';

import {useState} from 'react';
import {signOut} from 'next-auth/react';
import {Button} from '@/components/shared/ui/button';
import {Loader2} from 'lucide-react';
import {twMerge} from 'tailwind-merge';

interface LogoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function LogoutButton({className, ...props}: LogoutButtonProps) {
  const [isPending, setIsPending] = useState(false);

  const handleLogout = async () => {
    setIsPending(true);
    setTimeout(async () => {
      await signOut();
      setIsPending(false);
    }, 1000);
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant='underline'
      className={twMerge(
        'uppercase text-base px-0 text-red-700 font-medium',
        'flex items-center gap-2',
        className
      )}
      {...props}
    >
      {isPending ? (
        <>
          Loggar ut {''}
          <Loader2 className='h-4 w-4 animate-spin' />
        </>
      ) : (
        'Logga ut'
      )}
    </Button>
  );
}
