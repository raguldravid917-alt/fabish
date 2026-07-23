import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Zustand UI Store
 * Storage Key: fabish_ui
 */
export const useUIStore = create(
  persist(
    (set) => ({
      isMobileMenuOpen: false,
      isSearchOpen: false,
      isCartDrawerOpen: false,
      activeModal: null,

      toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
      setMobileMenuOpen: (isOpen) => set({ isMobileMenuOpen: isOpen }),
      toggleSearch: () => set((state) => ({ isSearchOpen: !state.isSearchOpen })),
      setSearchOpen: (isOpen) => set({ isSearchOpen: isOpen }),
      toggleCartDrawer: () => set((state) => ({ isCartDrawerOpen: !state.isCartDrawerOpen })),
      setCartDrawerOpen: (isOpen) => set({ isCartDrawerOpen: isOpen }),
      setActiveModal: (modalName) => set({ activeModal: modalName }),
      closeAll: () => set({ isMobileMenuOpen: false, isSearchOpen: false, isCartDrawerOpen: false, activeModal: null }),
    }),
    {
      name: 'fabish_ui',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
