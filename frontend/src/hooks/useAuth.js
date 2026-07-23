import { useEffect } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useAuthMutations } from './mutations/useAuthMutations';
import { authService } from '../api/authService';

/**
 * Backward-compatible facade hook for Auth.
 * Replaces AuthContext with Zustand Client State + TanStack React Query.
 */
export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const loading = useAuthStore((state) => state.loading);
  const error = useAuthStore((state) => state.error);
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const setLoading = useAuthStore((state) => state.setLoading);
  const setError = useAuthStore((state) => state.setError);
  const zustandLogout = useAuthStore((state) => state.logout);

  const {
    loginMutation,
    googleLoginMutation,
    registerMutation,
    logoutMutation,
    updateProfileMutation,
    uploadAvatarMutation,
    removeAvatarMutation,
  } = useAuthMutations();

  // Initial session check on mount / token change
  useEffect(() => {
    const fetchProfile = async () => {
      const storedToken = localStorage.getItem('token');
      if (!storedToken || storedToken === 'undefined' || storedToken === 'null') {
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        if (token) zustandLogout();
        return;
      }

      try {
        const res = await authService.getMe();
        if (res.success && res.data) {
          setAuth(res.data, storedToken);
        } else {
          if (res.status === 401 || res.status === 403) {
            zustandLogout();
            localStorage.removeItem('userInfo');
          }
        }
      } catch (err) {
        console.error('Error fetching profile in useAuth hook:', err);
      }
    };

    fetchProfile();
  }, [token, setAuth, zustandLogout]);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ email, password });
      const data = result.data;
      setLoading(false);
      window.dispatchEvent(new CustomEvent('wishlist-auth-change', { detail: { type: 'login' } }));
      return { success: true, user: data.user || data };
    } catch (err) {
      const msg = err.message || 'Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const googleLogin = async (idToken) => {
    setError(null);
    setLoading(true);
    try {
      const result = await googleLoginMutation.mutateAsync(idToken);
      const data = result.data;
      setLoading(false);
      window.dispatchEvent(new CustomEvent('wishlist-auth-change', { detail: { type: 'login' } }));
      return { success: true, user: data.user || data };
    } catch (err) {
      const msg = err.message || 'Google Login failed';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    setLoading(true);
    try {
      const result = await registerMutation.mutateAsync({ name, email, password });
      const data = result.data;
      setLoading(false);
      return { success: true, user: data.user || data };
    } catch (err) {
      const msg = err.message || 'Registration failed';
      setError(msg);
      setLoading(false);
      return { success: false, message: msg };
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      window.dispatchEvent(new CustomEvent('wishlist-auth-change', { detail: { type: 'logout' } }));
    }
  };

  const updateProfile = async (name, email, phone, password) => {
    setError(null);
    try {
      const result = await updateProfileMutation.mutateAsync({ name, email, phone, password });
      const data = result.data;
      const actualUser = data.user || data;
      return { success: true, user: actualUser };
    } catch (err) {
      return { success: false, message: err.message || 'Update failed' };
    }
  };

  const forgotPassword = async (email) => {
    try {
      return await authService.forgotPassword(email);
    } catch (err) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  };

  const resetPassword = async (resetToken, password) => {
    try {
      return await authService.resetPassword(resetToken, password);
    } catch (err) {
      return { success: false, message: err.message || 'Connection failed' };
    }
  };

  const uploadAvatar = async (file) => {
    try {
      await uploadAvatarMutation.mutateAsync(file);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Upload failed' };
    }
  };

  const removeAvatar = async () => {
    try {
      await removeAvatarMutation.mutateAsync();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Removal failed' };
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    googleLogin,
    register,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    uploadAvatar,
    removeAvatar,
    setUser,
  };
};
