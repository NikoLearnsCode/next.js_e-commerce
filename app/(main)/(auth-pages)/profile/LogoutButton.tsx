'use client';

import {useTransition} from 'react';
import {signOutAction} from '@/actions/auth';
import {Button} from '@/components/shared/button';
import {Loader2} from 'lucide-react';
import {twMerge} from 'tailwind-merge';

interface LogoutButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export default function LogoutButton({className, ...props}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <Button
      onClick={handleLogout}
      disabled={isPending}
      variant='underline'
      className={twMerge(
        'uppercase text-sm px-0 text-red-700 font-medium',
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
