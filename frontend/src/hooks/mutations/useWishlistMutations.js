import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useWishlistStore } from '../../store/wishlist.store';

export function useWishlistMutations() {
  const queryClient = useQueryClient();
  const setWishlist = useWishlistStore((state) => state.setWishlist);
  const toggleWishlistStore = useWishlistStore((state) => state.toggleWishlist);
  const removeFromWishlistStore = useWishlistStore((state) => state.removeFromWishlist);
  const setToggling = useWishlistStore((state) => state.setToggling);
  const clearWishlistStore = useWishlistStore((state) => state.clearWishlist);

  const fetchWishlistMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        const localData = localStorage.getItem('guest_wishlistItems');
        return localData ? JSON.parse(localData) : [];
      }
      const result = await api.get('/wishlist');
      if (result.success && result.data) {
        return result.data.products || [];
      }
      return [];
    },
    onSuccess: (products) => {
      setWishlist(products);
      queryClient.setQueryData(['wishlist'], products);
    },
  });

  const toggleWishlistMutation = useMutation({
    mutationFn: async (product) => {
      const productId = product._id || product.id || product;
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        toggleWishlistStore(product);
        return { success: true, isGuest: true };
      }

      setToggling(productId, true);
      try {
        const result = await api.post('/wishlist/toggle', { productId });
        if (!result.success) {
          throw new Error(result.message || 'Failed to toggle wishlist');
        }
        return result;
      } finally {
        setToggling(productId, false);
      }
    },
    onMutate: async (product) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = useWishlistStore.getState().wishlistItems;
      toggleWishlistStore(product);
      return { previousWishlist };
    },
    onError: (err, product, context) => {
      if (context?.previousWishlist) {
        setWishlist(context.previousWishlist);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data && !result.isGuest) {
        const products = result.data.products || [];
        setWishlist(products);
        queryClient.setQueryData(['wishlist'], products);
      }
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        removeFromWishlistStore(productId);
        return { success: true, isGuest: true };
      }

      setToggling(productId, true);
      try {
        const result = await api.post('/wishlist/toggle', { productId });
        if (!result.success) {
          throw new Error(result.message || 'Failed to remove from wishlist');
        }
        return result;
      } finally {
        setToggling(productId, false);
      }
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previousWishlist = useWishlistStore.getState().wishlistItems;
      removeFromWishlistStore(productId);
      return { previousWishlist };
    },
    onError: (err, productId, context) => {
      if (context?.previousWishlist) {
        setWishlist(context.previousWishlist);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data && !result.isGuest) {
        const products = result.data.products || [];
        setWishlist(products);
        queryClient.setQueryData(['wishlist'], products);
      }
    },
  });

  const syncGuestWishlistAfterLogin = async () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return;

    try {
      const localData = localStorage.getItem('guest_wishlistItems');
      if (!localData) return;
      const guestItems = JSON.parse(localData);
      if (!guestItems || guestItems.length === 0) return;

      const dbResult = await api.get('/wishlist');
      const dbProducts = dbResult?.data?.products || [];
      const dbIds = new Set(dbProducts.map((p) => (p._id || p).toString()));

      for (const item of guestItems) {
        const itemId = (item._id || item).toString();
        if (!dbIds.has(itemId)) {
          await api.post('/wishlist/toggle', { productId: itemId });
        }
      }

      localStorage.removeItem('guest_wishlistItems');
      fetchWishlistMutation.mutate();
    } catch (error) {
      console.error('Error syncing guest wishlist after login:', error);
    }
  };

  const clearWishlistMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        clearWishlistStore();
        return { success: true, isGuest: true };
      }

      const result = await api.delete('/wishlist');
      if (!result.success) {
        throw new Error(result.message || 'Failed to clear wishlist');
      }
      return result;
    },
    onSuccess: () => {
      clearWishlistStore();
      queryClient.setQueryData(['wishlist'], []);
    },
  });

  return {
    fetchWishlistMutation,
    toggleWishlistMutation,
    removeFromWishlistMutation,
    clearWishlistMutation,
    syncGuestWishlistAfterLogin,
  };
}
