import { useQuery } from '@tanstack/react-query';
import { orderService } from '../../api/orderService';
import { api } from '../../api/client';

export function useOrdersQuery(params = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const res = await orderService.getMyOrders(params);
      return res?.data || res?.orders || [];
    },
    enabled: !!token && token !== 'undefined' && token !== 'null',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useOrderTrackingQuery(orderIdOrTracking) {
  return useQuery({
    queryKey: ['order', 'track', orderIdOrTracking],
    queryFn: async () => {
      if (!orderIdOrTracking) return null;
      const res = await orderService.trackOrder(orderIdOrTracking);
      return res?.data || res;
    },
    enabled: !!orderIdOrTracking,
    staleTime: 5 * 60 * 1000,
  });
}
