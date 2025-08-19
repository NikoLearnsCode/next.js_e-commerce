'use client';

import {usePathname, useSearchParams} from 'next/navigation';

export function useSaveCurrentUrl() {
  const pathname = usePathname();
  const searchParams = useSearchParams();


  return () => {
    const isAuthPage =
      pathname === '/sign-in' ||
      pathname === '/sign-up' ||
      pathname === '/forgot-password';

    if (!isAuthPage) {
      const current =
        pathname + (searchParams.toString() ? `?${searchParams}` : '');
      sessionStorage.setItem('postLoginRedirect', current);
    }
  };
}
