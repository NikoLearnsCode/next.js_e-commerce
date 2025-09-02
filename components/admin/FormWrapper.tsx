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
              className='max-w-full z-50 p-6 min-w-full sm:max-w-[640px] sm:min-w-[640px] overflow-y-auto'
            >
              <div className='flex uppercase font-semibold justify-between items-center pb-8'>
                <h1>{title}</h1>
                <MotionCloseX
                  onClick={onClose}
                  size={16}
                  className='px-4 py-1'
                />
              </div>

              {renderForm()}
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
