'use client';

import {createContext, useContext, useEffect, useState} from 'react';
import {Category, CategoryWithChildren} from '@/lib/types/category';
import {Product} from '@/lib/types/db';
import {ProductFormData, CategoryFormData} from '@/lib/form-validators';
import {uploadProductImages} from '@/actions/admin/admin.image-upload.actions';
import {
  createProduct as createProductAction,
  updateProduct as updateProductAction,
  deleteProduct as deleteProductAction,
} from '@/actions/admin/admin.products.actions';
import {
  createCategory as createCategoryAction,
  updateCategory as updateCategoryAction,
  deleteCategory as deleteCategoryAction,
} from '@/actions/admin/admin.categories.actions';
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
  createProduct: (data: ProductFormData, images: File[]) => Promise<void>;
  updateProduct: (
    id: string,
    data: ProductFormData,
    newImages?: File[],
    existingImages?: string[]
  ) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  createCategory: (data: CategoryFormData) => Promise<void>;
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>;
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

  const createProduct = async (data: ProductFormData, images: File[]) => {
    setIsLoading(true);
    setOperationType('create');
    try {
      // Validera att det finns bilder
      if (images.length === 0) {
        toast.error('Minst en bild måste laddas upp.');
        return;
      }

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
    newImages?: File[],
    existingImages?: string[]
  ) => {
    setIsLoading(true);
    setOperationType('update');
    try {
      // Validera att det finns minst en bild totalt
      const totalImageCount =
        (existingImages?.length || 0) + (newImages?.length || 0);
      if (totalImageCount === 0) {
        toast.error('Minst en bild måste finnas kvar.');
        return;
      }

      const productData: ProductFormData & {images?: string[]} = {...data};

      // Kombinera befintliga bilder med nya uppladdade bilder
      let finalImages: string[] = existingImages || [];

      if (newImages && newImages.length > 0) {
        const newImageUrls = await uploadProductImages(
          newImages,
          data.gender,
          data.category
        );
        finalImages = [...finalImages, ...newImageUrls];
      }

      // Sätt images (vi vet att det finns minst en efter validering)
      productData.images = finalImages;

      const result = await updateProductAction(id, productData);

      if (result.success) {
        closeSidebar();
        toast.success('Produkt uppdaterad');
      } else {
        toast.error(result.error);
        console.error('Product update failed:', result.error);
      }
    } catch (error) {
      console.error('Error updating product:', error);
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

        createProduct,
        updateProduct,
        deleteProduct,

        createCategory,
        updateCategory,
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
