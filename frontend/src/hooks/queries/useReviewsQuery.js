import { useQuery } from '@tanstack/react-query';
import { reviewService } from '../../api/reviewService';
import { api } from '../../api/client';

export function useProductReviewsQuery(productId) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      if (!productId) return [];
      const res = await reviewService.getProductReviews(productId);
      return res?.data || res?.reviews || [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAdminReviewsQuery() {
  return useQuery({
    queryKey: ['reviews', 'admin'],
    queryFn: async () => {
      const res = await api.get('/reviews');
      return res?.data || res || [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
