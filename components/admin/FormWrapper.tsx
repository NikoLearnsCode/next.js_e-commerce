import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';
import {AnimatePresence} from 'framer-motion';
import ProductForm from './products/ProductForm';
import CategoryForm from './categories/CategoryForm';
import {useAdmin} from '@/context/AdminContextProvider';

export default function FormWrapper({onClose}: {onClose: () => void}) {
  const {activeSidebar, editData} = useAdmin();

  const renderForm = () => {
    const isEditMode = editData !== null;

    switch (activeSidebar) {
      case 'product':
        return (
          <ProductForm
            mode={isEditMode ? 'edit' : 'create'}
            initialData={isEditMode && editData ? (editData as any) : null}
          />
        );
      case 'category':
        return (
          <CategoryForm
            mode={isEditMode ? 'edit' : 'create'}
            initialData={isEditMode && editData ? (editData as any) : null}
          />
        );
      default:
        return null;
    }
  };

  const isFormOpen = activeSidebar !== null;
  const isEditMode = editData !== null;

  const getTitle = () => {
    if (activeSidebar === 'product') {
      return isEditMode ? 'redigera produkt' : 'ny produkt';
    }
    return isEditMode ? 'redigera kategori' : 'ny kategori';
  };

  const title = getTitle();

  return (
    <>
      <AnimatePresence>
        {isFormOpen && (
          <>
            <MotionOverlay id='admin-form-overlay' onClick={onClose} />
            <MotionDropdown
              position='right'
              className='max-w-full z-50  min-w-full sm:max-w-[550px] sm:min-w-[550px] overflow-y-auto'
            >
              <div className='flex uppercase font-semibold justify-between items-center  pl-8 pr-2 pt-6 pb-3'>
                <h1 className='font-semibold font-syne text-[17px]'>{title}</h1>
                <MotionCloseX
                  onClick={onClose}
                  size={16}
                  className='px-7 py-3'
                />
              </div>
              <div className='px-8 py-4'>{renderForm()}</div>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
