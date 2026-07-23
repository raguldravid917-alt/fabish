import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Zustand Wishlist Store
 * Storage Key: fabish_wishlist
 */
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistItems: [],
      togglingIds: [],
      loading: false,

      setWishlist: (items) => set({ wishlistItems: Array.isArray(items) ? items : [], loading: false }),

      toggleWishlist: (product) => {
        if (!product) return;
        const currentItems = get().wishlistItems;
        const productId = (product._id || product.id || product).toString();
        const exists = currentItems.some((x) => (x._id || x.id || x).toString() === productId);

        let updated;
        if (exists) {
          updated = currentItems.filter((x) => (x._id || x.id || x).toString() !== productId);
        } else {
          updated = [...currentItems, product];
        }

        set({ wishlistItems: updated });
        const token = localStorage.getItem('token');
        if (!token) {
          try {
            localStorage.setItem('guest_wishlistItems', JSON.stringify(updated));
          } catch (e) {
            // ignore storage quota error
          }
        }
      },

      removeFromWishlist: (productId) => {
        if (!productId) return;
        const idStr = productId.toString();
        const updated = get().wishlistItems.filter((x) => (x._id || x.id || x).toString() !== idStr);
        set({ wishlistItems: updated });

        const token = localStorage.getItem('token');
        if (!token) {
          try {
            localStorage.setItem('guest_wishlistItems', JSON.stringify(updated));
          } catch (e) {
            // ignore
          }
        }
      },

      isInWishlist: (id) => {
        if (!id) return false;
        const idStr = id.toString();
        return get().wishlistItems.some((x) => {
          if (!x) return false;
          const itemId = x._id || x.id || x;
          return itemId.toString() === idStr;
        });
      },

      setToggling: (id, isToggling) => {
        if (!id) return;
        const idStr = id.toString();
        const current = get().togglingIds;
        if (isToggling) {
          if (!current.includes(idStr)) {
            set({ togglingIds: [...current, idStr] });
          }
        } else {
          set({ togglingIds: current.filter((item) => item !== idStr) });
        }
      },

      isToggling: (id) => {
        if (!id) return false;
        return get().togglingIds.includes(id.toString());
      },

      clearWishlist: () => {
        set({ wishlistItems: [], togglingIds: [], loading: false });
        localStorage.removeItem('guest_wishlistItems');
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'fabish_wishlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        wishlistItems: state.wishlistItems,
      }),
    }
  )
);
