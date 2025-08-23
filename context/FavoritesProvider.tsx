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
  getFavorites,
  addToFavorites,
  removeFromFavorites,
  toggleFavorite,
} from '@/actions/favorites';
import {Favorite, Product} from '@/lib/validators';
import {useAuth} from '@/hooks/useAuth';

interface FavoritesContextType {
  favorites: Favorite[];

  favoriteCount: number;
  loading: boolean;
  refreshFavorites: () => Promise<void>;
  addFavorite: (product: Product) => Promise<void>;
  removeFavorite: (productId: string) => Promise<void>;
  toggleFavoriteItem: (product: Product) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  updatingItems: Record<string, boolean>;
}

const FavoritesContext = createContext<FavoritesContextType>({
  favorites: [],
  favoriteCount: 0,
  loading: true,
  refreshFavorites: async () => {},
  addFavorite: async () => {},
  removeFavorite: async () => {},
  toggleFavoriteItem: async () => {},
  isFavorite: () => false,
  updatingItems: {},
});

export function FavoritesProvider({children}: {children: React.ReactNode}) {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Record<string, boolean>>(
    {}
  );

  const {user} = useAuth();

  const userIdRef = useRef<string | undefined>(user?.id);
  const isRefreshing = useRef(false);

  const favoriteCount = useMemo(() => favorites.length, [favorites]);

  const favoriteProductIds = useMemo(
    () => new Set(favorites.map((fav) => fav.product_id)),
    [favorites]
  );

  const refreshFavorites = useCallback(async () => {
    if (isRefreshing.current) return;

    try {
      isRefreshing.current = true;
      const {favorites: freshFavorites} = await getFavorites();
      setFavorites(freshFavorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
      isRefreshing.current = false;
    }
  }, []);

  const addFavorite = useCallback(
    async (product: Product) => {
      try {
        setUpdatingItems((prev) => ({...prev, [product.id]: true}));
        const result = await addToFavorites(product);
        if (result.success) {
          setFavorites(result.favorites || []);
        } else {
          // Handle error silently and refresh favorites
          await refreshFavorites();
        }
      } catch (error) {
        console.error('Error adding favorite:', error);
        await refreshFavorites();
      } finally {
        setUpdatingItems((prev) => ({...prev, [product.id]: false}));
      }
    },
    [refreshFavorites]
  );

  const removeFavorite = useCallback(
    async (productId: string) => {
      try {
        setUpdatingItems((prev) => ({...prev, [productId]: true}));
        const result = await removeFromFavorites(productId);
        if (result.success) {
          setFavorites(result.favorites || []);
        } else {
          // Handle error silently and refresh favorites
          await refreshFavorites();
        }
      } catch (error) {
        console.error('Error removing favorite:', error);
        await refreshFavorites();
      } finally {
        setUpdatingItems((prev) => ({...prev, [productId]: false}));
      }
    },
    [refreshFavorites]
  );

  const toggleFavoriteItem = useCallback(
    async (product: Product) => {
      try {
        setUpdatingItems((prev) => ({...prev, [product.id]: true}));
        const result = await toggleFavorite(product);
        if (result.success) {
          setFavorites(result.favorites || []);
        } else {
          // Handle error silently and refresh favorites
          await refreshFavorites();
        }
      } catch (error) {
        console.error('Error toggling favorite:', error);
        await refreshFavorites();
      } finally {
        setUpdatingItems((prev) => ({...prev, [product.id]: false}));
      }
    },
    [refreshFavorites]
  );

  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favoriteProductIds.has(productId);
    },
    [favoriteProductIds]
  );

  // Fetch favorites on first render
  useEffect(() => {
    refreshFavorites();
  }, [refreshFavorites]);

  // When user logs in or out
  useEffect(() => {
    if (userIdRef.current !== user?.id) {
      userIdRef.current = user?.id;
      refreshFavorites();
    }
  }, [user?.id, refreshFavorites]);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteCount,
        loading,
        refreshFavorites,
        addFavorite,
        removeFavorite,
        toggleFavoriteItem,
        isFavorite,
        updatingItems,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  return useContext(FavoritesContext);
}
