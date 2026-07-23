import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Zustand Cart Store
 * Storage Key: fabish_cart
 */
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      loading: false,
      appliedCoupon: null,
      couponError: '',
      couponLoading: false,

      // Derived totals computation
      calculateTotals: (items = get().cartItems, coupon = get().appliedCoupon) => {
        const safeItems = Array.isArray(items) ? items : [];
        const itemsCount = safeItems.reduce((acc, item) => acc + (item.qty || item.quantity || 1), 0);
        const itemsPrice = safeItems.reduce((acc, item) => {
          const price = item.price ?? item.product?.price ?? 0;
          const qty = item.qty || item.quantity || 1;
          return acc + price * qty;
        }, 0);

        let discountAmount = 0;
        if (coupon) {
          if (coupon.discountType === 'Percentage') {
            const pctVal = coupon.discountPercentage !== undefined ? coupon.discountPercentage : coupon.discountValue;
            let pctDiscount = itemsPrice * ((pctVal || 0) / 100);
            if (coupon.maxDiscountCap) {
              pctDiscount = Math.min(pctDiscount, coupon.maxDiscountCap);
            }
            discountAmount = pctDiscount;
          } else if (coupon.discountType === 'Fixed') {
            discountAmount = Math.min(coupon.discountValue || 0, itemsPrice);
          }
        }

        let shippingPrice = 0;
        if (itemsPrice > 0) {
          if (coupon && coupon.discountType === 'FreeShipping') {
            shippingPrice = 0;
          } else {
            shippingPrice = itemsPrice > 2000 ? 0 : 150;
          }
        }

        const totalPrice = Math.max(0, itemsPrice + shippingPrice - discountAmount);

        return {
          itemsCount,
          itemsPrice,
          discountAmount,
          shippingPrice,
          totalPrice,
        };
      },

      setCart: (items) => {
        const safeItems = Array.isArray(items) ? items : [];
        set({ cartItems: safeItems, loading: false });
      },

      addToCart: (product, qty = 1, selectedVariant = null) => {
        const currentItems = get().cartItems;
        const productId = product._id || product.id;
        const existIndex = currentItems.findIndex((x) => {
          const xId = x._id || x.id || x.product?._id || x.product;
          return xId === productId;
        });

        let updated;
        if (existIndex > -1) {
          updated = currentItems.map((item, idx) => {
            if (idx === existIndex) {
              const currentQty = item.qty || item.quantity || 1;
              const maxStock = product.stock || item.stock || Infinity;
              return { ...item, qty: Math.min(currentQty + qty, maxStock), quantity: Math.min(currentQty + qty, maxStock) };
            }
            return item;
          });
        } else {
          const maxStock = product.stock || Infinity;
          updated = [
            ...currentItems,
            {
              ...product,
              _id: productId,
              qty: Math.min(qty, maxStock),
              quantity: Math.min(qty, maxStock),
              selectedVariant,
            },
          ];
        }

        set({ cartItems: updated });
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        }
      },

      removeFromCart: (productId) => {
        const updated = get().cartItems.filter((x) => {
          const xId = x._id || x.id || x.product?._id || x.product;
          return xId !== productId && x._id !== productId;
        });
        set({ cartItems: updated });
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        }
      },

      updateQty: (productId, qty) => {
        if (qty <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const updated = get().cartItems.map((x) => {
          const xId = x._id || x.id || x.product?._id || x.product;
          if (xId === productId || x._id === productId) {
            const maxStock = x.stock || Infinity;
            const newQty = Math.max(1, Math.min(qty, maxStock));
            return { ...x, qty: newQty, quantity: newQty };
          }
          return x;
        });

        set({ cartItems: updated });
        const token = localStorage.getItem('token');
        if (!token) {
          localStorage.setItem('guest_cartItems', JSON.stringify(updated));
        }
      },

      clearCart: () => {
        set({ cartItems: [], appliedCoupon: null, couponError: '', loading: false });
        localStorage.removeItem('guest_cartItems');
        localStorage.removeItem('appliedCouponCode');
      },

      setAppliedCoupon: (coupon) => set({ appliedCoupon: coupon }),
      setCouponError: (error) => set({ couponError: error, couponLoading: false }),
      setCouponLoading: (loading) => set({ couponLoading: loading }),
      removeCoupon: () => {
        set({ appliedCoupon: null, couponError: '' });
        localStorage.removeItem('appliedCouponCode');
      },
      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'fabish_cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cartItems: state.cartItems,
        appliedCoupon: state.appliedCoupon,
      }),
    }
  )
);
