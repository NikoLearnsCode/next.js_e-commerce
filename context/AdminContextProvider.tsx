// components/admin/AdminContextProvider.tsx

'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import FormWrapper from '@/components/admin/FormWrapper';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import {Category, CategoryWithChildren} from '@/lib/types/category';
import {Product} from '@/lib/types/db';
import {ProductFormData, CategoryFormData} from '@/lib/form-validators';
import {uploadProductImages} from '@/actions/admin/utils/upload-image';
import {
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
} from '@/actions/admin/products';
import {
  createCategory as createCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
} from '@/actions/admin/categories';
import {toast, Toaster} from 'sonner';

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

  // PRODUCTS
  createProduct: (data: ProductFormData, images: File[]) => Promise<void>;
  updateProduct: (
    id: string,
    data: ProductFormData,
    images?: File[]
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // CATEGORIES
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  // Loading states
  isLoading: boolean;
  operationType: CRUDOperationType;

  // Delete confirmation modal
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

// UPPDATERAD TYP: Lägg till `categories` som en prop
type AdminContextProviderProps = {
  children: React.ReactNode;
  categories: CategoryWithChildren[]; // Tillagd
};

export default function AdminContextProvider({
  children,
  categories, // Ta emot datan som en prop
  //// TODO FLYTTA ANROP FRÅN LAYOUT
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

  // --------------------------------------------------------

  // CRUD FUNKTIONER FÖR PRODUKTER
  const createProduct = async (data: ProductFormData, images: File[]) => {
    setIsLoading(true);
    setOperationType('create');
    try {
      const imageUrls = await uploadProductImages(
        images,
        data.gender,
        data.category
      );

      const productData = {
        ...data,
        images: imageUrls,
      };

      const result = await createProductAction(productData);

      if (result.success) {
        closeSidebar();
        toast.success('Produkt skapad');
      } else {
        toast.error(result.error);
        console.error('Product creation failed:', result.error);
      }
    } catch (error) {
      console.error('Error creating product:', error);

      toast.error(
        'Ett oväntat fel uppstod på servern. Produkten kunde inte sparas.'
      );
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const updateProduct = async (
    id: string,
    data: ProductFormData,
    images?: File[]
  ) => {
    setIsLoading(true);
    setOperationType('update');
    try {
      // Prepare form data (transformation happens in server action)
      const productData: ProductFormData & {images?: string[]} = {...data};

      // Upload new images if provided
      if (images && images.length > 0) {
        const imageUrls = await uploadProductImages(
          images,
          data.gender,
          data.category
        );
        productData.images = imageUrls;
      }

      const result = await updateProductAction(id, productData);

      if (result.success) {
        closeSidebar();
        toast.success('Produkt uppdaterad');
      } else {
        // Display the specific error from server action
        toast.error(result.error);
        console.error('Product update failed:', result.error);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      // Only show generic message for truly unexpected errors
      toast.error(
        'Ett oväntat fel uppstod på servern. Produkten kunde inte uppdateras.'
      );
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
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

  // --------------------------------------------------------

  // CRUD FUNKTIONER FÖR KATEGORIER
  const createCategory = async (data: CategoryFormData) => {
    setIsLoading(true);
    setOperationType('create');
    try {
      const result = await createCategoryAction(data);

      if (result.success) {
        closeSidebar();
        toast.success('Kategori skapad');
      } else {
        toast.error(result.error);
        console.error('Category creation failed:', result.error);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error(
        'Ett oväntat fel uppstod på servern. Kategorin kunde inte sparas.'
      );
    } finally {
      setIsLoading(false);
      setOperationType(null);
    }
  };

  const updateCategory = async (id: string, data: CategoryFormData) => {
    setIsLoading(true);
    setOperationType('update');
    try {
      const result = await updateCategoryAction(parseInt(id), data);

      if (result.success) {
        closeSidebar();
        toast.success('Kategori uppdaterad');
      } else {
        toast.error(result.error);
        console.error('Category update failed:', result.error);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error(
        'Ett oväntat fel uppstod på servern. Kategorin kunde inte uppdateras.'
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

  // --------------------------------------------------------

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
      <Toaster />
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
