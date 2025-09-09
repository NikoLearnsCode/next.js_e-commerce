'use client';

import FormWrapper from '@/components/admin/AdminFormWrapper';
import AdminSidebar from '@/components/admin/AdminSidebar';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {useAdmin} from '@/context/AdminContextProvider';
import {Toaster} from 'sonner';

interface AdminUIWrapperProps {
  children: React.ReactNode;
}

export default function AdminUIWrapper({children}: AdminUIWrapperProps) {
  const {
    deleteModalOpen,
    setDeleteModalOpen,
    itemToDelete,
    setItemToDelete,
    triggerElement,
    setTriggerElement,
    isLoading,
    operationType,
    deleteProduct,
    deleteCategory,
    closeSidebar,
    isCollapsed,
  } = useAdmin();

  return (
    <div className='flex h-screen '>
      <AdminSidebar />
      <main
        className={`flex-1 px-8 -mt-[56px] pb-16 transition-all ease-in-out duration-200 ${
          isCollapsed ? 'ml-15' : 'ml-45'
        }`}
      >
        <div className='py-12'>{children}</div>
      </main>
      <FormWrapper onClose={closeSidebar} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        title='Bekräfta borttagning'
        message={
          itemToDelete
            ? `Är du säker på att du vill ta bort ${
                itemToDelete.type === 'product' ? 'produkten' : 'kategorin'
              } "${itemToDelete.name}"?`
            : ''
        }
        /* description={
          itemToDelete?.type === 'category'
            ? 'Obs: Detta kommer att påverka alla produkter i denna kategori.'
            : undefined
        } */
        confirmText='Ta bort'
        cancelText='Avbryt'
        variant='danger'
        isLoading={isLoading && operationType === 'delete'}
        triggerElement={triggerElement}
        onConfirm={async () => {
          if (!itemToDelete) return;
          try {
            if (itemToDelete.type === 'product') {
              await deleteProduct(itemToDelete.id);
            } else {
              await deleteCategory(itemToDelete.id);
            }
          } catch (error) {
            console.error('Delete error:', error);
          }
        }}
        onCancel={() => {
          if (isLoading) return;
          setDeleteModalOpen(false);
          setItemToDelete(null);
          setTriggerElement(null);
        }}
      />
      <Toaster />
    </div>
  );
}
