import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../api/client';
import { useCartStore } from '../../store/cart.store';

const mapBackendCartToFrontend = (backendCart) => {
  if (!backendCart || !backendCart.items) return [];
  return backendCart.items
    .map((item) => {
      if (!item.product) return null;
      return {
        ...item.product,
        qty: item.quantity,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);
};

// Module-level snapshot variable persists across React component re-renders & hook invocations
let globalPreMutationCartSnapshot = null;

export function useCartMutations() {
  const queryClient = useQueryClient();
  const setCart = useCartStore((state) => state.setCart);
  const addToCartStore = useCartStore((state) => state.addToCart);
  const removeFromCartStore = useCartStore((state) => state.removeFromCart);
  const updateQtyStore = useCartStore((state) => state.updateQty);
  const clearCartStore = useCartStore((state) => state.clearCart);

  const fetchCartMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        const localData = localStorage.getItem('guest_cartItems');
        return localData ? JSON.parse(localData) : [];
      }
      const result = await api.get('/cart');
      if (result.success && result.data) {
        return mapBackendCartToFrontend(result.data);
      }
      return [];
    },
    onSuccess: (items) => {
      setCart(items);
      queryClient.setQueryData(['cart'], items);
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ product, qty = 1, selectedVariant = null }) => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        addToCartStore(product, qty, selectedVariant);
        return { success: true, isGuest: true };
      }

      // Use pre-mutation snapshot captured in onMutate prior to optimistic addition
      const targetId = product._id || product.id;
      const baseCart = globalPreMutationCartSnapshot !== null
        ? globalPreMutationCartSnapshot
        : useCartStore.getState().cartItems;

      const existItem = baseCart.find((x) => {
        const xId = x._id || x.id || x.product?._id || x.product;
        return xId === targetId;
      });

      const currentQty = existItem ? (existItem.qty || existItem.quantity || 0) : 0;
      const maxStock = product.stock || Infinity;
      const newQty = Math.min(currentQty + qty, maxStock);

      const result = await api.put('/cart', { productId: targetId, quantity: newQty });
      if (!result.success) {
        throw new Error(result.message || 'Failed to update cart');
      }
      return result;
    },
    onMutate: async ({ product, qty = 1, selectedVariant = null }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = useCartStore.getState().cartItems;
      globalPreMutationCartSnapshot = previousCart;
      addToCartStore(product, qty, selectedVariant);
      return { previousCart };
    },
    onError: (err, variables, context) => {
      globalPreMutationCartSnapshot = null;
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (result) => {
      globalPreMutationCartSnapshot = null;
      if (result.success && result.data && !result.isGuest) {
        const mapped = mapBackendCartToFrontend(result.data);
        setCart(mapped);
        queryClient.setQueryData(['cart'], mapped);
      }
    },
  });

  const removeFromCartMutation = useMutation({
    mutationFn: async (productId) => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        removeFromCartStore(productId);
        return { success: true, isGuest: true };
      }

      const result = await api.delete(`/cart/${productId}`);
      if (!result.success) {
        throw new Error(result.message || 'Failed to remove item');
      }
      return result;
    },
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = useCartStore.getState().cartItems;
      removeFromCartStore(productId);
      return { previousCart };
    },
    onError: (err, productId, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data && !result.isGuest) {
        const mapped = mapBackendCartToFrontend(result.data);
        setCart(mapped);
        queryClient.setQueryData(['cart'], mapped);
      }
    },
  });

  const updateQtyMutation = useMutation({
    mutationFn: async ({ productId, qty }) => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        updateQtyStore(productId, qty);
        return { success: true, isGuest: true };
      }

      const result = await api.put('/cart', { productId, quantity: qty });
      if (!result.success) {
        throw new Error(result.message || 'Failed to update quantity');
      }
      return result;
    },
    onMutate: async ({ productId, qty }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = useCartStore.getState().cartItems;
      updateQtyStore(productId, qty);
      return { previousCart };
    },
    onError: (err, variables, context) => {
      if (context?.previousCart) {
        setCart(context.previousCart);
      }
    },
    onSuccess: (result) => {
      if (result.success && result.data && !result.isGuest) {
        const mapped = mapBackendCartToFrontend(result.data);
        setCart(mapped);
        queryClient.setQueryData(['cart'], mapped);
      }
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (!token || token === 'undefined' || token === 'null') {
        clearCartStore();
        return { success: true, isGuest: true };
      }

      const result = await api.delete('/cart');
      if (!result.success) {
        throw new Error(result.message || 'Failed to clear cart');
      }
      return result;
    },
    onSuccess: () => {
      clearCartStore();
      queryClient.setQueryData(['cart'], []);
    },
  });

  return {
    fetchCartMutation,
    addToCartMutation,
    removeFromCartMutation,
    updateQtyMutation,
    clearCartMutation,
  };
}
