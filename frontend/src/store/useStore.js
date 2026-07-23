import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export { useAuthStore } from './auth.store';
export { useCartStore } from './cart.store';
export { useWishlistStore } from './wishlist.store';
export { useUIStore } from './ui.store';
export { useThemeStore } from './theme.store';

// 4. RECENTLY VIEWED STORE
export const useRecentlyViewedStore = create(
  persist(
    (set, get) => ({
      recentlyViewed: [],
      addRecentlyViewed: (product) => {
        if (!product || !product._id) return;
        const current = get().recentlyViewed.filter((item) => item._id !== product._id);
        set({ recentlyViewed: [product, ...current].slice(0, 20) });
      },
    }),
    {
      name: 'fabish_recently_viewed_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
