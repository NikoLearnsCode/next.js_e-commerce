'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import FormWrapper from '@/components/admin/shared/FormWrapper';

const AdminContext = createContext<AdminContextType | null>(null);

type AdminContextType = {
  isFormOpen: boolean;
  openForm: () => void;
  closeForm: () => void;
};

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}

export default function AdminContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  const openForm = () => {
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
  };

  useEffect(() => {
    if (isFormOpen) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeForm();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isFormOpen]);

  useEffect(() => {
    if (isFormOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isFormOpen]);

  return (
    <AdminContext.Provider value={{isFormOpen, openForm, closeForm}}>
      <div>
        <div className='-mt-[54px] py-12 px-8'>{children}</div>
        <FormWrapper onClose={closeForm} isFormOpen={isFormOpen} />
      </div>
    </AdminContext.Provider>
  );
}
