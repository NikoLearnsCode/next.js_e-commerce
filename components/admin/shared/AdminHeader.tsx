'use client';

import { Button } from '@/components/shared/ui/button';
import { PlusIcon } from 'lucide-react';

type AdminHeaderProps = {
  title: string;
  count?: number;
  button?: React.ReactNode;
  buttonShow?: boolean;
};

export default function AdminHeader({title, count, buttonShow}: AdminHeaderProps) {
  return (
    <div className='pr-4 pb-6 flex items-center justify-between'>
      <h1 className='text-lg uppercase  font-semibold'>
        {title} {count && `(${count})`}
      </h1>

      {buttonShow && (
        <Button variant='secondary' className='gap-1 m-0 rounded-full'>
          <PlusIcon className='w-4 h-4 ' />
          Lägg till
        </Button>
      )}
    </div>
  );
}
