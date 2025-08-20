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
import {getCart, removeFromCart, updateCartItemQuantity} from '@/actions/cart';
import {CartItem} from '@/lib/validators';
import {useAuth} from './AuthProvider';

//TS
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

// Standardvärden
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

  // Hämta användarinformation från AuthContext
  const {user} = useAuth();
  // Spara userId i en ref för att undvika onödiga renderingar
  const userIdRef = useRef<string | undefined>(user?.id);

  //Förhindrar samtidiga anrop
  const isRefreshing = useRef(false);

  // Använd useMemo för att förhindra onödiga beräkningar vid varje rendering
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

  // memoriserar funktionen så att samma instans används mellan renderingar.
  const refreshCart = useCallback(async () => {
    // Förhindra parallella uppdateringar av varukorgen
    if (isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      const {cartItems: freshCartItems} = await getCart();
      // Uppdatera lokal state med den hämtade datan
      setCartItems(freshCartItems);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  // Funktion för att ta bort en artikel från varukorgen
  const removeItem = useCallback(async (itemId: string) => {
    try {
      setRemovingItems((prev) => ({...prev, [itemId]: true}));
      const result = await removeFromCart(itemId);
      if (result.success) {
        setCartItems(result.cartItems || []);
      } else {
        console.error('Error removing item via backend:', result.error);
        // fallback
        await refreshCart();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // fallback
      await refreshCart();
    } finally {
      setRemovingItems((prev) => ({...prev, [itemId]: false}));
    }
  }, []);

  // Funktion för att uppdatera kvantitet av en artikel i varukorgen
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
    // Kontrollera om användar-ID faktiskt har ändrats
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
      setLoading(true);
      // await clearCart();
      await refreshCart();
      setLoading(false);
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
