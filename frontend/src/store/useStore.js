import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// 1. AUTH STORE
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token'),
      loading: false,

      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({ user, token, isAuthenticated: !!token, loading: false });
      },

      setUser: (user) => set({ user }),

      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false, loading: false });
      },

      setLoading: (loading) => set({ loading }),
    }),
    {
      name: 'fabish_auth_storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);

// 2. CART STORE
export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      totalPrice: 0,
      totalItemsCount: 0,

      calculateTotals: (items) => {
        const totalItemsCount = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
        const totalPrice = items.reduce((acc, item) => {
          const price = item.product?.price ?? item.price ?? 0;
          return acc + price * (item.quantity || 1);
        }, 0);
        return { totalItemsCount, totalPrice };
      },

      setCart: (items) => {
        const safeItems = Array.isArray(items) ? items : [];
        const { totalItemsCount, totalPrice } = get().calculateTotals(safeItems);
        set({ cartItems: safeItems, totalItemsCount, totalPrice });
      },

      addToCart: (product, quantity = 1, selectedVariant = null) => {
        const currentItems = get().cartItems;
        const productId = product._id || product.id;
        
        const existingIndex = currentItems.findIndex((item) => {
          const itemProdId = item.product?._id || item.product || item._id;
          return itemProdId === productId;
        });

        let updatedItems;
        if (existingIndex > -1) {
          updatedItems = currentItems.map((item, idx) => {
            if (idx === existingIndex) {
              return { ...item, quantity: item.quantity + quantity };
            }
            return item;
          });
        } else {
          updatedItems = [
            ...currentItems,
            {
              _id: `temp_${Date.now()}_${Math.random()}`,
              product: product,
              price: product.price,
              quantity: quantity,
              selectedVariant: selectedVariant,
            },
          ];
        }

        const { totalItemsCount, totalPrice } = get().calculateTotals(updatedItems);
        set({ cartItems: updatedItems, totalItemsCount, totalPrice });
      },

      removeFromCart: (productId) => {
        const updatedItems = get().cartItems.filter((item) => {
          const itemProdId = item.product?._id || item.product || item._id;
          return itemProdId !== productId && item._id !== productId;
        });
        const { totalItemsCount, totalPrice } = get().calculateTotals(updatedItems);
        set({ cartItems: updatedItems, totalItemsCount, totalPrice });
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        const updatedItems = get().cartItems.map((item) => {
          const itemProdId = item.product?._id || item.product || item._id;
          if (itemProdId === productId || item._id === productId) {
            return { ...item, quantity };
          }
          return item;
        });
        const { totalItemsCount, totalPrice } = get().calculateTotals(updatedItems);
        set({ cartItems: updatedItems, totalItemsCount, totalPrice });
      },

      clearCart: () => set({ cartItems: [], totalPrice: 0, totalItemsCount: 0 }),
    }),
    {
      name: 'fabish_cart_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// 3. WISHLIST STORE
export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistItems: [],

      setWishlist: (items) => set({ wishlistItems: Array.isArray(items) ? items : [] }),

      toggleWishlist: (product) => {
        const currentItems = get().wishlistItems;
        const productId = product._id || product.id;
        const exists = currentItems.some((item) => (item._id || item.id || item) === productId);

        let updatedItems;
        if (exists) {
          updatedItems = currentItems.filter((item) => (item._id || item.id || item) !== productId);
        } else {
          updatedItems = [...currentItems, product];
        }
        set({ wishlistItems: updatedItems });
      },

      isInWishlist: (productId) => {
        return get().wishlistItems.some((item) => (item._id || item.id || item) === productId);
      },

      clearWishlist: () => set({ wishlistItems: [] }),
    }),
    {
      name: 'fabish_wishlist_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

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

// 5. THEME STORE
export const useThemeStore = create(
  persist(
    (set) => ({
      theme: 'light',
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'fabish_theme_storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
