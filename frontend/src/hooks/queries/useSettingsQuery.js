import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export function useSettingsQuery() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res?.data || res;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAdminSettingsQuery() {
  return useQuery({
    queryKey: ['settings', 'admin'],
    queryFn: async () => {
      const res = await api.get('/settings/admin', { auth: true });
      return res?.data || res;
    },
    staleTime: 5 * 60 * 1000,
  });
}
