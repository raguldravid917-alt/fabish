import { useEffect } from 'react';
import { useCartStore } from '../store/cart.store';
import { useCartMutations } from './mutations/useCartMutations';
import { api } from '../api/client';

/**
 * Backward-compatible facade hook for Cart.
 * Replaces CartContext with Zustand Client State + TanStack React Query.
 */
export const useCart = () => {
  const cartItems = useCartStore((state) => state.cartItems);
  const loading = useCartStore((state) => state.loading);
  const appliedCoupon = useCartStore((state) => state.appliedCoupon);
  const couponError = useCartStore((state) => state.couponError);
  const couponLoading = useCartStore((state) => state.couponLoading);
  const setAppliedCoupon = useCartStore((state) => state.setAppliedCoupon);
  const setCouponError = useCartStore((state) => state.setCouponError);
  const setCouponLoading = useCartStore((state) => state.setCouponLoading);
  const removeCouponStore = useCartStore((state) => state.removeCoupon);
  const calculateTotals = useCartStore((state) => state.calculateTotals);

  const {
    fetchCartMutation,
    addToCartMutation,
    removeFromCartMutation,
    updateQtyMutation,
    clearCartMutation,
  } = useCartMutations();

  // Fetch cart on initial load
  useEffect(() => {
    fetchCartMutation.mutate();
  }, []);

  // Validate saved coupon when cart changes
  useEffect(() => {
    const savedCode = localStorage.getItem('appliedCouponCode');
    if (savedCode && cartItems.length > 0) {
      const itemsPrice = cartItems.reduce((acc, item) => {
        const price = item.price ?? item.product?.price ?? 0;
        const qty = item.qty || item.quantity || 1;
        return acc + price * qty;
      }, 0);

      const validateAndApply = async () => {
        try {
          const res = await api.post('/coupons/apply', { code: savedCode, cartTotal: itemsPrice });
          if (res.success && res.data) {
            setAppliedCoupon(res.data);
          } else {
            setAppliedCoupon(null);
            localStorage.removeItem('appliedCouponCode');
          }
        } catch (err) {
          setAppliedCoupon(null);
          localStorage.removeItem('appliedCouponCode');
        }
      };
      validateAndApply();
    } else if (!savedCode || cartItems.length === 0) {
      setAppliedCoupon(null);
    }
  }, [cartItems]);

  const addToCart = async (product, qty = 1, selectedVariant = null) => {
    try {
      await addToCartMutation.mutateAsync({ product, qty, selectedVariant });
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  };

  const removeFromCart = async (id) => {
    try {
      await removeFromCartMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  };

  const updateQty = async (id, qty) => {
    try {
      await updateQtyMutation.mutateAsync({ productId: id, qty });
      return true;
    } catch (error) {
      console.error('Error updating quantity:', error);
      return false;
    }
  };

  const clearCart = async () => {
    try {
      await clearCartMutation.mutateAsync();
      return true;
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  };

  const applyCoupon = async (code) => {
    if (!code || !code.trim()) {
      setCouponError('Please enter a coupon code.');
      return { success: false, message: 'Please enter a coupon code.' };
    }
    setCouponLoading(true);
    setCouponError('');
    try {
      const itemsPrice = cartItems.reduce((acc, item) => {
        const price = item.price ?? item.product?.price ?? 0;
        const qty = item.qty || item.quantity || 1;
        return acc + price * qty;
      }, 0);

      const res = await api.post('/coupons/apply', { code: code.trim().toUpperCase(), cartTotal: itemsPrice });
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        localStorage.setItem('appliedCouponCode', res.data.code);
        setCouponLoading(false);
        return { success: true, message: 'Coupon applied successfully!', coupon: res.data };
      } else {
        const msg = res.message || 'Invalid coupon code.';
        setCouponError(msg);
        setCouponLoading(false);
        return { success: false, message: msg };
      }
    } catch (err) {
      const msg = err.message || 'Failed to apply coupon.';
      setCouponError(msg);
      setCouponLoading(false);
      return { success: false, message: msg };
    }
  };

  const removeCoupon = () => {
    removeCouponStore();
  };

  const { itemsCount, itemsPrice, discountAmount, shippingPrice, totalPrice } = calculateTotals(cartItems, appliedCoupon);

  return {
    cartItems,
    addToCart,
    removeFromCart,
    updateQty,
    clearCart,
    itemsCount,
    itemsPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    loading,
    appliedCoupon,
    couponError,
    couponLoading,
    applyCoupon,
    removeCoupon,
  };
};
