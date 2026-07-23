import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Zustand Auth Store
 * Storage Key: fabish_auth
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: localStorage.getItem('token') || null,
      isAuthenticated: !!localStorage.getItem('token'),
      loading: false,
      error: null,

      setAuth: (user, token) => {
        if (token) {
          localStorage.setItem('token', token);
        }
        set({
          user,
          token,
          isAuthenticated: !!token,
          loading: false,
          error: null,
        });
      },

      setUser: (user) => set({ user }),

      setToken: (token) => {
        if (token) {
          localStorage.setItem('token', token);
        } else {
          localStorage.removeItem('token');
        }
        set({ token, isAuthenticated: !!token });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        set({ user: null, token: null, isAuthenticated: false, loading: false, error: null });
      },

      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error, loading: false }),
    }),
    {
      name: 'fabish_auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
