'use client';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {useState} from 'react';

export default function QueryProvider({children}: {children: React.ReactNode}) {
  // Create QueryClient instance with optimal settings for e-commerce
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache data for 5 minutes 
            staleTime: 5 * 60 * 1000,
            // Keep data in cache for 10 minutes
            gcTime: 10 * 60 * 1000,
            // Retry failed requests 2 times
            retry: 2,
            // Don't refetch on window focus for better UX
            refetchOnWindowFocus: false,
            // Refetch on reconnect is useful for mobile users
            refetchOnReconnect: true,
          },
          mutations: {
            // Retry mutations once (for adding to cart, etc.)
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
