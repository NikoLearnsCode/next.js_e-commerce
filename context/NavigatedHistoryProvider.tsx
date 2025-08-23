'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';

type NavigatedProduct = {
  slug: string;
  image: string;
  name: string;
};

type NavigatedHistoryContextType = {
  navigatedProducts: NavigatedProduct[];
  handleSaveNavigated: (product: {slug: string; image: string, name: string}) => void;
  searchHistory: string[];
  handleSaveSearch: (searchTerm: string) => void;
  handleRemoveAllSearches: () => void;
};

const NavigatedHistoryContext = createContext<
  NavigatedHistoryContextType | undefined
>(undefined);

export const NavigatedHistoryProvider = ({children}: {children: ReactNode}) => {
  const [navigatedProducts, setNavigatedProducts] = useState<
    NavigatedProduct[]
  >([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Loading navigated and search history from localStorage on initial load
  useEffect(() => {
    try {
      const savedNavigated = localStorage.getItem('navigated');
      const parsedSavedNavigated = savedNavigated
        ? JSON.parse(savedNavigated)
        : [];
      setNavigatedProducts(parsedSavedNavigated);

      const savedSearches = localStorage.getItem('searchHistory');
      const parsedSavedSearches = savedSearches
        ? JSON.parse(savedSearches)
        : [];
      setSearchHistory(parsedSavedSearches);
    } catch (error) {
      console.error(
        'Failed to parse items from localStorage on initial load',
        error
      );
      setNavigatedProducts([]);
      setSearchHistory([]);
    }
  }, []);

  // Using in ProductCard.tsx - saves clicked product to navigated history
  const handleSaveNavigated = (product: {slug: string; image: string, name: string}) => {
    setNavigatedProducts((prevNavigatedProducts) => {
      const newNavigatedList = [
        product,
        ...prevNavigatedProducts.filter((p) => p.slug !== product.slug),
      ].slice(0, 9);
      try {
        localStorage.setItem('navigated', JSON.stringify(newNavigatedList));
      } catch (error) {
        console.error('Failed to save navigated items to localStorage', error);
      }
      return newNavigatedList;
    });
  };

  // Using in SearchDropdown.tsx - saves search term to search history
  const handleSaveSearch = (searchTerm: string) => {
    setSearchHistory((prevSearchHistory) => {
      const newSearchHistory = [
        searchTerm,
        ...prevSearchHistory.filter((s) => s !== searchTerm),
      ].slice(0, 7);
      try {
        localStorage.setItem('searchHistory', JSON.stringify(newSearchHistory));
      } catch (error) {
        console.error('Failed to save search history to localStorage', error);
      }
      return newSearchHistory;
    });
  };

  // Using in SearchDropdown.tsx - deletes all search history
  const handleRemoveAllSearches = () => {
    setSearchHistory(() => {
      const newSearchHistory: string[] = [];
      try {
        localStorage.setItem('searchHistory', JSON.stringify(newSearchHistory));
      } catch (error) {
        console.error('Failed to remove search term from localStorage', error);
      }
      return newSearchHistory;
    });
  };

  return (
    <NavigatedHistoryContext.Provider
      value={{
        navigatedProducts,
        handleSaveNavigated,
        searchHistory,
        handleSaveSearch,
        handleRemoveAllSearches,
      }}
    >
      {children}
    </NavigatedHistoryContext.Provider>
  );
};

export const useNavigatedHistory = () => {
  const context = useContext(NavigatedHistoryContext);
  if (context === undefined) {
    throw new Error(
      'useNavigatedHistory must be used within a NavigatedHistoryProvider'
    );
  }
  return context;
};
