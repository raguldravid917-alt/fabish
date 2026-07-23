import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export function usePublicCouponsQuery() {
  return useQuery({
    queryKey: ['coupons', 'public'],
    queryFn: async () => {
      const res = await api.get(`/coupons/public?_cb=${Date.now()}`);
      return res?.data || res || [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useAdminCouponsQuery() {
  return useQuery({
    queryKey: ['coupons', 'admin'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res?.data || res || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
