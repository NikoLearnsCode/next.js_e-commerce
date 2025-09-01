// components/admin/AdminContextProvider.tsx

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import FormWrapper from '@/components/admin/FormWrapper';
import {Category} from '@/lib/types/category';
import {Product} from '@/lib/types/db';
import {type GroupedDropdownOption} from '@/actions/admin/utils/category-formatter'; // Importera typen

// UPPDATERAD TYP: Lägg till `categories`
type AdminContextType = {
  activeSidebar: 'category' | 'product' | null;
  openSidebar: (
    type: 'category' | 'product',
    editDataParam?: Category | Product
  ) => void;
  closeSidebar: () => void;
  editData: Category | Product | null;
  categories: GroupedDropdownOption[]; // Tillagd
};

const AdminContext = createContext<AdminContextType | null>(null);

// UPPDATERAD TYP: Lägg till `categories` som en prop
type AdminContextProviderProps = {
  children: React.ReactNode;
  categories: GroupedDropdownOption[]; // Tillagd
};

export default function AdminContextProvider({
  children,
  categories, // Ta emot datan som en prop
}: AdminContextProviderProps) {
  const [activeSidebar, setActiveSidebar] = useState<
    'category' | 'product' | null
  >(null);
  const [editData, setEditData] = useState<Category | Product | null>(null);

  const openSidebar = (
    type: 'category' | 'product',
    editDataParam?: Category | Product
  ) => {
    setActiveSidebar(type);
    setEditData(editDataParam || null);
  };

  const closeSidebar = () => {
    setActiveSidebar(null);
    setEditData(null);
  };

  useEffect(() => {
    if (activeSidebar) {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          closeSidebar();
        }
      };
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [activeSidebar]);

  useEffect(() => {
    if (activeSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [activeSidebar]);

  return (
    <AdminContext.Provider
      value={{
        activeSidebar,
        openSidebar,
        closeSidebar,
        editData,
        categories, 
      }}
    >
      <div>
        <div className='-mt-[54px] py-12 px-8'>{children}</div>
        <FormWrapper onClose={closeSidebar} />
      </div>
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
