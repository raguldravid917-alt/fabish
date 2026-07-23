import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authService } from '../../api/authService';
import { profileService } from '../../api/profileService';
import { useAuthStore } from '../../store/auth.store';

export function useAuthMutations() {
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setUser = useAuthStore((state) => state.setUser);
  const zustandLogout = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: async ({ email, password }) => {
      const result = await authService.login(email, password);
      if (!result.success) {
        throw new Error(result.message || 'Login failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const data = result.data;
      const actualToken = data?.token || data?.accessToken || result?.token || result?.accessToken;
      if (actualToken) {
        setAuth(data.user || data, actualToken);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      }
    },
  });

  const googleLoginMutation = useMutation({
    mutationFn: async (idToken) => {
      const result = await authService.googleLogin(idToken);
      if (!result.success) {
        throw new Error(result.message || 'Google Login failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const data = result.data;
      const actualToken = data?.token || data?.accessToken || result?.token || result?.accessToken;
      if (actualToken) {
        setAuth(data.user || data, actualToken);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async ({ name, email, password }) => {
      const result = await authService.register(name, email, password);
      if (!result.success) {
        throw new Error(result.message || 'Registration failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const data = result.data;
      if (data?.token) {
        setAuth(data.user || data, data.token);
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch (err) {
        console.warn('Backend logout cleanup warning:', err.message);
      }
      return true;
    },
    onSettled: () => {
      zustandLogout();
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ name, email, phone, password }) => {
      const result = await authService.updateProfile({ name, email, phone, password });
      if (!result.success) {
        throw new Error(result.message || 'Profile update failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const data = result.data;
      const actualUser = data.user || data;
      setUser(actualUser);
      queryClient.setQueryData(['profile'], actualUser);
    },
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file) => {
      const result = await profileService.uploadPhoto(file);
      if (!result.success) {
        throw new Error(result.message || 'Avatar upload failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const actualUser = result.data.user || result.data;
      setUser(actualUser);
      queryClient.setQueryData(['profile'], actualUser);
    },
  });

  const removeAvatarMutation = useMutation({
    mutationFn: async () => {
      const result = await profileService.removePhoto();
      if (!result.success) {
        throw new Error(result.message || 'Avatar removal failed');
      }
      return result;
    },
    onSuccess: (result) => {
      const actualUser = result.data.user || result.data;
      setUser(actualUser);
      queryClient.setQueryData(['profile'], actualUser);
    },
  });

  return {
    loginMutation,
    googleLoginMutation,
    registerMutation,
    logoutMutation,
    updateProfileMutation,
    uploadAvatarMutation,
    removeAvatarMutation,
  };
}
