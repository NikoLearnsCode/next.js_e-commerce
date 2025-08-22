'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  getCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart,
} from '@/actions/cart';
import {CartItem} from '@/lib/validators';
import {useAuth} from '@/hooks/useAuth';

interface CartContextType {
  cartItems: CartItem[];
  itemCount: number;
  loading: boolean;
  refreshCart: () => Promise<void>;
  totalPrice: number;
  removeItem: (itemId: string) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  updateCartItems: (updatedCartItems: CartItem[]) => Promise<void>;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  clearCartAction: () => Promise<void>;
  updatingItems: Record<string, boolean>;
  removingItems: Record<string, boolean>;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  itemCount: 0,
  loading: true,
  totalPrice: 0,
  refreshCart: async () => {},
  removeItem: async () => {},
  updateItemQuantity: async () => {},
  isCartOpen: false,
  openCart: () => {},
  closeCart: () => {},
  updateCartItems: async () => {},
  clearCartAction: async () => {},
  updatingItems: {},
  removingItems: {},
});

export function CartProvider({children}: {children: React.ReactNode}) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );
  const [removingItems, setRemovingItems] = useState<Record<string, boolean>>(
    {}
  );

  const {user} = useAuth();

  const userIdRef = useRef<string | undefined>(user?.id);

  const isRefreshing = useRef(false);

  const itemCount = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: CartItem) => total + item.quantity,
        0
      ),
    [cartItems]
  );

  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: CartItem) =>
          total + Number(item.price) * item.quantity,
        0
      ),
    [cartItems]
  );

  const refreshCart = useCallback(async () => {
    if (isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      const {cartItems: freshCartItems} = await getCart();
      setCartItems(freshCartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  const removeItem = useCallback(async (itemId: string) => {
    try {
      setRemovingItems((prev) => ({...prev, [itemId]: true}));
      const result = await removeFromCart(itemId);
      if (result.success) {
        setCartItems(result.cartItems || []);
      } else {
        console.error('Error removing item via backend:', result.error);
        await refreshCart();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      await refreshCart();
    } finally {
      setRemovingItems((prev) => ({...prev, [itemId]: false}));
    }
  }, []);

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      if (quantity < 1) return;

      try {
        setUpdatingItems((prev) => ({...prev, [itemId]: true}));

        const result = await updateCartItemQuantity(itemId, quantity);
        if (result.success) {
          setCartItems(result.cartItems || []);
        } else {
          console.error('Error updating quantity via backend:', result.error);
          await refreshCart();
        }
      } catch (error) {
        console.error('Error updating item quantity:', error);
        await refreshCart();
      } finally {
        setUpdatingItems((prev) => ({...prev, [itemId]: false}));
      }
    },
    []
  );

  // Hämta varukorgen vid första rendering
  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  // När användaren loggar in eller ut
  useEffect(() => {
    if (userIdRef.current !== user?.id) {
      userIdRef.current = user?.id;
      refreshCart();
    }
  }, [user?.id, refreshCart]);

  const updateCartItems = useCallback(async (updatedCartItems: CartItem[]) => {
    setCartItems(updatedCartItems);
  }, []);

  const openCart = () => {
    setIsCartOpen(true);
  };

  const closeCart = () => {
    setIsCartOpen(false);
  };

  const clearCartAction = async () => {
    try {
      const result = await clearCart();
      if (result.success) {
        setCartItems([]);
      } else {
        console.error('Error clearing cart:', result.error);
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        clearCartAction,
        cartItems,
        updateCartItems,
        itemCount,
        loading,
        totalPrice,
        refreshCart,
        removeItem,
        updateItemQuantity,
        isCartOpen,
        openCart,
        closeCart,
        updatingItems,
        removingItems,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
