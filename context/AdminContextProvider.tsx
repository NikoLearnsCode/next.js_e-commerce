// components/admin/AdminContextProvider.tsx

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import FormWrapper from '@/components/admin/FormWrapper';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {Category, CategoryWithChildren} from '@/lib/types/category';
import {Product} from '@/lib/types/db';
import {ProductFormData} from '@/lib/form-validators';

// CRUD operationer types
type CRUDOperationType = 'create' | 'update' | 'delete' | null;

// UTÖKAD TYP: Lägg till CRUD funktioner
type AdminContextType = {
  // Befintliga sidebar funktioner
  activeSidebar: 'category' | 'product' | null;
  openSidebar: (
    type: 'category' | 'product',
    editDataParam?: Category | Product
  ) => void;
  closeSidebar: () => void;
  editData: Category | Product | null;
  categories: CategoryWithChildren[];

  // CRUD funktioner för produkter
  createProduct: (data: ProductFormData) => Promise<void>;
  updateProduct: (id: number, data: ProductFormData) => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  // CRUD funktioner för kategorier
  createCategory: (data: any) => Promise<void>; // TODO: Lägg till CategoryFormData type
  updateCategory: (id: number, data: any) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  // Loading states
  isLoading: boolean;
  operationType: CRUDOperationType;

  // Delete confirmation modal
  deleteModalOpen: boolean;
  setDeleteModalOpen: (open: boolean) => void;
  itemToDelete: {id: number; name: string; type: 'product' | 'category'} | null;
  setItemToDelete: (
    item: {id: number; name: string; type: 'product' | 'category'} | null
  ) => void;
  triggerElement: HTMLElement | null;
  setTriggerElement: (element: HTMLElement | null) => void;
};

const AdminContext = createContext<AdminContextType | null>(null);

// UPPDATERAD TYP: Lägg till `categories` som en prop
type AdminContextProviderProps = {
  children: React.ReactNode;
  categories: CategoryWithChildren[]; // Tillagd
};

export default function AdminContextProvider({
  children,
  categories, // Ta emot datan som en prop
}: AdminContextProviderProps) {
  // Sidebar state
  const [activeSidebar, setActiveSidebar] = useState<
    'category' | 'product' | null
  >(null);
  const [editData, setEditData] = useState<Category | Product | null>(null);

  // CRUD loading states
  const [isLoading, setIsLoading] = useState(false);
  const [operationType, setOperationType] = useState<CRUDOperationType>(null);

  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
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

  // CRUD FUNKTIONER FÖR PRODUKTER
  const createProduct = async (data: ProductFormData) => {
    setIsLoading(true);
    setOperationType('create');
    try {
      // TODO: Flytta befintlig addProductWithImages logik hit
      // TODO: Hantera FormData transformation
      // TODO: Anropa server action
      // TODO: Stäng sidebar vid framgång
      // TODO: Uppdatera produktlista/cache
      console.log('Creating product:', data);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error creating product:', error);
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const updateProduct = async (id: number, data: ProductFormData) => {
    setIsLoading(true);
    setOperationType('update');
    try {
      // TODO: Implementera server action för update
      // TODO: Hantera FormData transformation
      // TODO: Stäng sidebar vid framgång
      // TODO: Uppdatera produktlista/cache
      console.log('Updating product:', id, data);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error updating product:', error);
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const deleteProduct = async (id: number) => {
    setIsLoading(true);
    setOperationType('delete');
    try {
      // TODO: Implementera server action för delete
      // TODO: Ta bort bilder från filesystem
      // TODO: Uppdatera produktlista/cache
      // TODO: Stäng delete modal
      console.log('Deleting product:', id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error deleting product:', error);
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  // CRUD FUNKTIONER FÖR KATEGORIER
  const createCategory = async (data: any) => {
    setIsLoading(true);
    setOperationType('create');
    try {
      // TODO: Implementera server action för create category
      // TODO: Uppdatera kategorilista/cache
      // TODO: Stäng sidebar vid framgång
      console.log('Creating category:', data);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error creating category:', error);
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const updateCategory = async (id: number, data: any) => {
    setIsLoading(true);
    setOperationType('update');
    try {
      // TODO: Implementera server action för update category
      // TODO: Uppdatera kategorilista/cache
      // TODO: Stäng sidebar vid framgång
      console.log('Updating category:', id, data);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error updating category:', error);
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const deleteCategory = async (id: number) => {
    setIsLoading(true);
    setOperationType('delete');
    try {
      // TODO: Implementera server action för delete category
      // TODO: Kontrollera att inga produkter är kopplade
      // TODO: Uppdatera kategorilista/cache
      // TODO: Stäng delete modal
      console.log('Deleting category:', id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      // TODO: Hantera fel med toast/notification
      console.error('Error deleting category:', error);
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
        // Sidebar funktioner
        activeSidebar,
        openSidebar,
        closeSidebar,
        editData,
        categories,

        // CRUD funktioner för produkter
        createProduct,
        updateProduct,
        deleteProduct,

        // CRUD funktioner för kategorier
        createCategory,
        updateCategory,
        deleteCategory,

        // Loading states
        isLoading,
        operationType,

        // Delete modal
        deleteModalOpen,
        setDeleteModalOpen,
        itemToDelete,
        setItemToDelete,
        triggerElement,
        setTriggerElement,
      }}
    >
      <div>
        <div className='-mt-[54px] py-12 px-8'>{children}</div>
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
          description={
            itemToDelete?.type === 'category'
              ? 'Obs: Detta kommer att påverka alla produkter i denna kategori.'
              : undefined
          }
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
              // TODO: Visa error toast/notification
            }
          }}
          onCancel={() => {
            if (isLoading) return; // Förhindra stängning under loading
            setDeleteModalOpen(false);
            setItemToDelete(null);
            setTriggerElement(null);
          }}
        />
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
