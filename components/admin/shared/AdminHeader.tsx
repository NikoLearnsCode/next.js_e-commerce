'use client';

import {Button} from '@/components/shared/ui/button';
import {useAdmin} from '@/context/AdminContextProvider';
import {PlusIcon} from 'lucide-react';

type AdminHeaderProps = {
  title: string;
  count?: number;
  button?: React.ReactNode;
  buttonShow?: boolean;
  formType?: 'category' | 'product';
};

export default function AdminHeader({
  title,
  count,
  buttonShow,
  formType,
}: AdminHeaderProps) {
  const {openSidebar} = useAdmin();

  const handleClick = () => {
    if (formType) {
      openSidebar(formType);
    }
  };

  return (
    <div className='pr-4 pb-6 flex items-center justify-between'>
      <h1 className='text-[17px] uppercase  font-semibold'>
        {title} {count && `(${count})`}
      </h1>

      {buttonShow && formType && (
        <Button
          variant='secondary'
          className='gap-1 m-0 rounded-full   '
          onClick={handleClick}
        >
          <PlusIcon />
          Lägg till
        </Button>
      )}
    </div>
  );
}
