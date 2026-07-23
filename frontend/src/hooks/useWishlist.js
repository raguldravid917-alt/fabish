import { useEffect, useCallback } from 'react';
import { useWishlistStore } from '../store/wishlist.store';
import { useWishlistMutations } from './mutations/useWishlistMutations';

/**
 * Backward-compatible facade hook for Wishlist.
 * Replaces WishlistContext with Zustand Client State + TanStack React Query.
 */
export const useWishlist = () => {
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const loading = useWishlistStore((state) => state.loading);
  const isInWishlistStore = useWishlistStore((state) => state.isInWishlist);
  const isTogglingStore = useWishlistStore((state) => state.isToggling);

  const {
    fetchWishlistMutation,
    toggleWishlistMutation,
    removeFromWishlistMutation,
    clearWishlistMutation,
    syncGuestWishlistAfterLogin,
  } = useWishlistMutations();

  const fetchWishlist = useCallback(async () => {
    await fetchWishlistMutation.mutateAsync();
  }, [fetchWishlistMutation]);

  useEffect(() => {
    fetchWishlist();

    const handleAuthChange = (e) => {
      const { type } = e.detail || {};
      if (type === 'login') {
        syncGuestWishlistAfterLogin();
      } else {
        fetchWishlist();
      }
    };

    window.addEventListener('wishlist-auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('wishlist-auth-change', handleAuthChange);
    };
  }, []);

  const toggleWishlist = useCallback(async (product) => {
    try {
      await toggleWishlistMutation.mutateAsync(product);
      return true;
    } catch (err) {
      console.error('Error in toggleWishlist:', err);
      return false;
    }
  }, [toggleWishlistMutation]);

  const removeFromWishlist = useCallback(async (productId) => {
    try {
      await removeFromWishlistMutation.mutateAsync(productId);
      return true;
    } catch (err) {
      console.error('Error in removeFromWishlist:', err);
      return false;
    }
  }, [removeFromWishlistMutation]);

  const isInWishlist = useCallback((id) => {
    return isInWishlistStore(id);
  }, [isInWishlistStore]);

  const isToggling = useCallback((id) => {
    return isTogglingStore(id);
  }, [isTogglingStore]);

  const clearWishlist = useCallback(async () => {
    try {
      await clearWishlistMutation.mutateAsync();
      return true;
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      return false;
    }
  }, [clearWishlistMutation]);

  return {
    wishlistItems,
    toggleWishlist,
    removeFromWishlist,
    isInWishlist,
    isToggling,
    clearWishlist,
    syncGuestWishlistAfterLogin,
    fetchWishlist,
    loading,
  };
};
