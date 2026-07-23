import { useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/productService';
import { authService } from '../api/authService';
import { api } from '../api/client';
import { PRODUCT_KEYS } from './queries/useProductsQuery';

export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetchProduct = (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: PRODUCT_KEYS.detail(slug),
      queryFn: async () => {
        const res = await productService.getBySlug(slug);
        return res?.data || res?.product || res;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCategory = (categorySlug) => {
    if (!categorySlug) return;
    queryClient.prefetchQuery({
      queryKey: PRODUCT_KEYS.list({ category: categorySlug }),
      queryFn: async () => {
        const res = await productService.getAll({ category: categorySlug });
        return res?.data || res?.products || res;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchCart = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return;
    queryClient.prefetchQuery({
      queryKey: ['cart'],
      queryFn: async () => {
        const result = await api.get('/cart');
        return result?.data || [];
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const prefetchProfile = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'undefined' || token === 'null') return;
    queryClient.prefetchQuery({
      queryKey: ['profile'],
      queryFn: async () => {
        const res = await authService.getMe();
        return res?.data || null;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  return {
    prefetchProduct,
    prefetchCategory,
    prefetchCart,
    prefetchProfile,
  };
}
