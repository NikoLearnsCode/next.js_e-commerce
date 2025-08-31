import {
  MotionDropdown,
  MotionOverlay,
  MotionCloseX,
} from '@/components/shared/AnimatedSidebar';
import {AnimatePresence} from 'framer-motion';
import AdminForm from './AdminForm';

export default function FormWrapper({
  onClose,
  isFormOpen,
}: {
  onClose: () => void;
  isFormOpen: boolean;
}) {
  return (
    <>
      <AnimatePresence>
        {isFormOpen && (
          <>
            <MotionOverlay id='admin-form-overlay' onClick={onClose} />
            <MotionDropdown
              position='right'
              className='max-w-full z-50 min-w-full md:max-w-[500px] md:min-w-[500px]'
            >
              <AdminForm />
              <div>
                <MotionCloseX onClick={onClose} size={16} />
              </div>
            </MotionDropdown>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
