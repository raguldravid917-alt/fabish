import { useQuery } from '@tanstack/react-query';
import { recentlyViewedService } from '../../api/recentlyViewedService';

export function useRecentlyViewedQuery() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return useQuery({
    queryKey: ['recentlyViewed'],
    queryFn: async () => {
      const res = await recentlyViewedService.getRecentlyViewed();
      return res?.data || [];
    },
    enabled: !!token && token !== 'undefined' && token !== 'null',
    staleTime: 5 * 60 * 1000,
  });
}
