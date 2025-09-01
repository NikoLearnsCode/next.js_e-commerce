import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';
import {AnimatePresence} from 'framer-motion';
import ProductForm from '../products/ProductForm';
import CategoryForm from '../categories/CategoryForm';
import {useAdmin} from '@/app/admin/layout';

export default function FormWrapper({onClose}: {onClose: () => void}) {
  const {activeSidebar} = useAdmin();

  const renderForm = () => {
    switch (activeSidebar) {
      case 'product':
        return <ProductForm />;
      case 'category':
        return <CategoryForm />;
      default:
        return null;
    }
  };

  const isFormOpen = activeSidebar !== null;
  const title = activeSidebar === 'product' ? 'ny produkt' : 'ny kategori';

  return (
    <>
      <AnimatePresence>
        {isFormOpen && (
          <>
            <MotionOverlay id='admin-form-overlay' onClick={onClose} />
            <MotionDropdown
              position='right'
              className='max-w-full z-50 p-6 min-w-full md:max-w-[500px] md:min-w-[500px]'
            >
              <div className='flex uppercase font-semibold justify-between items-center pb-8'>
                <h1>{title}</h1>
                <MotionCloseX onClick={onClose} size={16} className='px-4 py-1'/>
              </div>

              {renderForm()}
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
