'use client';

import {useEffect, useRef} from 'react';
import {usePathname, useSearchParams} from 'next/navigation';

/**
 * Custom hook for scroll position restoration across navigation
 * Works alongside React Query to maintain scroll position when data is cached
 */
export function useScrollRestoration() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasRestoredRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Generate unique key for this page + filters combination
  const scrollKey = `scroll:${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;

  /**
   * Save current scroll position to sessionStorage
   */
  const saveScrollPosition = () => {
    try {
      const scrollY = window.scrollY;
      if (scrollY > 0) {
        // Only save if scrolled
        sessionStorage.setItem(scrollKey, scrollY.toString());
        /* console.log(
          `Scroll position saved: ${scrollY}px for key: ${scrollKey}`
        ); */
      }
    } catch (error) {
      console.warn('Failed to save scroll position:', error);
    }
  };

  /**
   * Restore scroll position from sessionStorage with better timing and validation
   */
  const restoreScrollPosition = () => {
    try {
      const savedPosition = sessionStorage.getItem(scrollKey);

      if (!savedPosition || hasRestoredRef.current) {
        /*  console.log(
          `No scroll position to restore or already restored. Key: ${scrollKey}`
        ); */
        return;
      }

      const scrollY = parseInt(savedPosition, 10);

      if (isNaN(scrollY) || scrollY <= 0) {
        console.warn(`Invalid scroll position: ${savedPosition}`);
        return;
      }

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      /* console.log(`Attempting to restore scroll to: ${scrollY}px`); */

      // Use multiple attempts with increasing delays to ensure DOM is ready
      const attemptRestore = (
        attempt: number = 1,
        maxAttempts: number = 15
      ) => {
        if (attempt > maxAttempts) {
          console.warn(
            `Failed to restore scroll position after ${maxAttempts} attempts`
          );
          return;
        }

        // Check if document height is sufficient for the scroll position
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );

        const viewportHeight = window.innerHeight;
        const requiredHeight = scrollY + viewportHeight;

        /* console.log(
          `Attempt ${attempt}: documentHeight=${documentHeight}, requiredHeight=${requiredHeight}`
        ); */

        if (documentHeight >= requiredHeight) {
          // DOM is ready, restore scroll position
          window.scrollTo({top: scrollY, behavior: 'instant'});
          hasRestoredRef.current = true;
          /* console.log(
            `Scroll restored to ${scrollY}px on attempt ${attempt}`
          ); */

          // Verify scroll position was actually set
          setTimeout(() => {
            const actualScrollY = window.scrollY;
            if (Math.abs(actualScrollY - scrollY) > 10) {
              console.warn(
                `Scroll position verification failed. Expected: ${scrollY}, Actual: ${actualScrollY}`
              );
            } else {
              /*  console.log(`Scroll position verified: ${actualScrollY}px`); */
            }
          }, 100);
        } else {
          // DOM not ready yet, try again with exponential backoff
          const delay = Math.min(100 * Math.pow(1.2, attempt - 1), 500);
          /* console.log(`DOM not ready, retrying in ${delay}ms...`); */

          timeoutRef.current = setTimeout(() => {
            attemptRestore(attempt + 1, maxAttempts);
          }, delay);
        }
      };

      // Start restoration attempts with a small initial delay
      setTimeout(() => {
        attemptRestore();
      }, 100);
    } catch (error) {
      console.warn('Failed to restore scroll position:', error);
    }
  };

  /**
   * Clear scroll position from sessionStorage
   */
  const clearScrollPosition = () => {
    try {
      sessionStorage.removeItem(scrollKey);
      /* console.log(`Scroll position cleared for key: ${scrollKey}`); */
    } catch (error) {
      console.warn('Failed to clear scroll position:', error);
    }
  };

  // Save scroll position before navigation
  useEffect(() => {
    const handleBeforeUnload = () => {
      saveScrollPosition();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveScrollPosition();
      }
    };

    // Also save periodically while scrolling (debounced)
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(saveScrollPosition, 150);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('scroll', handleScroll, {passive: true});

    // Also save on route changes (for SPA navigation)
    return () => {
      saveScrollPosition();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);

      // Clear any pending timeouts
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [scrollKey]);

  // Reset restoration flag when key changes (new page/filters)
  useEffect(() => {
    hasRestoredRef.current = false;

    // Clear any existing timeout when route changes
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [scrollKey]);

  return {
    saveScrollPosition,
    restoreScrollPosition,
    clearScrollPosition,
    scrollKey,
  };
}
