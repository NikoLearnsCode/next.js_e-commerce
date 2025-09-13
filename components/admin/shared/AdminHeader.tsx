'use client';

import {Button} from '@/components/shared/ui/button';
import {useAdmin} from '@/context/AdminContextProvider';
import {ArrowRight, PlusIcon} from 'lucide-react';

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
          variant='link'
          className='gap-0 m-0  text-gray-900 hover:no-underline uppercase font-semibold  shadow-none text-sm group  '
          onClick={handleClick}
        >
          <span className='text-xl font-medium   mb-[4.5px]'>n</span>y{' '}
          {formType === 'product' ? 'produkt' : 'kategori'}
          <ArrowRight
            size={12}
            strokeWidth={1.75}
            className='group-hover:translate-x-1 ml-1.5 mb-[1px] transition-transform duration-300'
          />
        </Button>
      )}
    </div>
  );
}
