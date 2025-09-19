'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import {Category, CategoryWithChildren} from '@/lib/types/category';
import {Product} from '@/lib/types/db';
import {deleteProduct as deleteProductAction} from '@/actions/admin/admin.products.actions';
import {deleteCategory as deleteCategoryAction} from '@/actions/admin/admin.categories.actions';
import {toast} from 'sonner';

type CRUDOperationType = 'create' | 'update' | 'delete' | null;

type AdminContextType = {
  activeSidebar: 'category' | 'product' | null;
  openSidebar: (
    type: 'category' | 'product',
    editDataParam?: Category | Product
  ) => void;
  closeSidebar: () => void;
  editData: Category | Product | null;
  categories: CategoryWithChildren[];
  isCollapsed: boolean;
  toggleSidebar: () => void;
  deleteProduct: (id: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  isLoading: boolean;
  operationType: CRUDOperationType;
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;

  itemToDelete: {id: string; name: string; type: 'product' | 'category'} | null;
  
  setItemToDelete: (
    item: {id: string; name: string; type: 'product' | 'category'} | null
  ) => void;
  triggerElement: HTMLElement | null;
  setTriggerElement: (element: HTMLElement | null) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

type AdminContextProviderProps = {
  children: React.ReactNode;
  categories: CategoryWithChildren[];
};

export default function AdminContextProvider({
  children,
  categories,
}: AdminContextProviderProps) {
  const [activeSidebar, setActiveSidebar] = useState<
    'category' | 'product' | null
  >(null);
  const [editData, setEditData] = useState<Category | Product | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [operationType, setOperationType] = useState<CRUDOperationType>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: string;
    name: string;
    type: 'product' | 'category';
  } | null>(null);
  const [triggerElement, setTriggerElement] = useState<HTMLElement | null>(
    null
  );

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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const deleteProduct = async (id: string) => {
    setIsLoading(true);
    setOperationType('delete');
    try {
      const result = await deleteProductAction(id);

      if (result.success) {
        setDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success('Produkt borttagen');
      } else {
        console.error('Product deletion failed:', result.error);
        toast.error(result.error);
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(
        'Ett oväntat fel uppstod på servern. Produkten kunde inte raderas.'
      );
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const deleteCategory = async (id: string) => {
    setIsLoading(true);
    setOperationType('delete');
    try {
      const result = await deleteCategoryAction(parseInt(id));

      if (result.success) {
        setDeleteModalOpen(false);
        setItemToDelete(null);
        toast.success('Kategori borttagen');
      } else {
        console.error('Category deletion failed:', result.error);
        toast.error(result.error);
        setDeleteModalOpen(false);
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error(
        'Ett oväntat fel uppstod på servern. Kategorin kunde inte raderas.'
      );
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
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

        isCollapsed,
        toggleSidebar,

        deleteProduct,
        deleteCategory,

        isLoading,
        operationType,

        deleteModalOpen,
        setDeleteModalOpen,
        itemToDelete,
        setItemToDelete,
        triggerElement,
        setTriggerElement,
      }}
    >
      {children}
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
