'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import {
  getCart,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '@/actions/cart.actions';
import {AddToCartItem, CartItemWithProduct} from '@/lib/types/db';
// import {useAuth} from '@/hooks/useAuth';

interface CartContextType {
  cartItems: CartItemWithProduct[];
  itemCount: number;
  loading: boolean;
  totalPrice: number;
  isCartOpen: boolean;
  updatingItems: Record<string, boolean>;
  removingItems: Record<string, boolean>;
  refreshCart: () => Promise<void>;
  addItem: (item: AddToCartItem) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({children}: {children: React.ReactNode}) {
  const [cartItems, setCartItems] = useState<CartItemWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPrice, setTotalPrice] = useState(0);
  const [itemCount, setItemCount] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
    {}
  );

  // const {user} = useAuth();
  // const userIdRef = useRef<string | undefined>(user?.id);
  const isRefreshing = useRef(false);

  const refreshCart = useCallback(async () => {
    if (isRefreshing.current) return;
    try {
      isRefreshing.current = true;
      const result = await getCart();
      if (result.cartItems) {
        setCartItems(result.cartItems);
        setTotalPrice(result.totalPrice || 0);
        setItemCount(result.itemCount || 0);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  // Hjälpfunktion för att hantera alla state-uppdateringar
  const handleActionResult = useCallback(
    (result: any) => {
      if (result?.success) {
        setCartItems(result.cartItems || []);
        setTotalPrice(result.totalPrice || 0);
        setItemCount(result.itemCount || 0);
      } else {
        console.error(
          'Cart action failed, refreshing from server',
          result?.error
        );
        refreshCart(); // Fallback
      }
    },
    [refreshCart]
  );

  const addItem = useCallback(
    async (item: AddToCartItem) => {
      try {
        setUpdatingItems((prev) => ({...prev, [item.product_id]: true}));
        const result = await addToCart(item);
        handleActionResult(result);
      } catch (error) {
        console.error('Error adding item to cart:', error);
        await refreshCart();
      } finally {
        setUpdatingItems((prev) => ({...prev, [item.product_id]: false}));
      }
    },
    [handleActionResult, refreshCart]
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      try {
        setRemovingItems((prev) => ({...prev, [itemId]: true}));
        const result = await removeFromCart(itemId);
        handleActionResult(result);
      } catch (error) {
        console.error('Error removing item from cart:', error);
        await refreshCart();
      } finally {
        setRemovingItems((prev) => ({...prev, [itemId]: false}));
      }
    },
    [handleActionResult, refreshCart]
  );

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;
      try {
        setUpdatingItems((prev) => ({...prev, [itemId]: true}));
        const result = await updateCartItemQuantity(itemId, quantity);
        handleActionResult(result);
      } catch (error) {
        console.error('Error updating item quantity:', error);
        await refreshCart();
      } finally {
        setUpdatingItems((prev) => ({...prev, [itemId]: false}));
      }
    },
    [handleActionResult, refreshCart]
  );

  const clearCartAction = useCallback(async () => {
    try {
      const result = await clearCart();
      if (result.success) {
        setCartItems([]);
        setTotalPrice(0);
        setItemCount(0);
      } else {
        console.error('Error clearing cart:', result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  useEffect(() => {
    refreshCart();
  }, []);

  /*   useEffect(() => {
    if (userIdRef.current !== user?.id) {
      userIdRef.current = user?.id;
      refreshCart();
    }
  }, [user?.id, refreshCart]);
 */
  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemCount,
        loading,
        totalPrice,
        isCartOpen,
        updatingItems,
        removingItems,
        refreshCart,
        addItem,
        removeItem,
        updateItemQuantity,
        clearCart: clearCartAction,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
