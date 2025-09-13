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
              className='max-w-full min-w-full  sm:max-w-[600px] sm:min-w-[600px]'
            >
              <div className='flex flex-col h-screen bg-white'>
                <div className='flex   justify-between items-center pl-4 sm:pl-6 pt-4 pb-0.5'>
                  <h1 className='font-medium    uppercase text-sm'>{title}</h1>
                  <MotionCloseX
                    onClick={onClose}
                    size={16}
                    strokeWidth={2}
                    className='px-7 py-3 '
                  />
                </div>

                <div className='px-4 sm:px-6  flex-1 overflow-y-auto'>
                  {renderForm()}
                </div>
              </div>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
