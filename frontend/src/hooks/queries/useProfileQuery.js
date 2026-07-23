import { useQuery } from '@tanstack/react-query';
import { authService } from '../../api/authService';

export function useProfileQuery(enabled = true) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const res = await authService.getMe();
      if (res && res.success && res.data) {
        return res.data;
      }
      return null;
    },
    enabled: enabled && !!token && token !== 'undefined' && token !== 'null',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
