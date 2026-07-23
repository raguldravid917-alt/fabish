import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../api/productService';

export const PRODUCT_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_KEYS.all, 'list'],
  list: (params) => [...PRODUCT_KEYS.lists(), params],
  details: () => [...PRODUCT_KEYS.all, 'detail'],
  detail: (slug) => [...PRODUCT_KEYS.details(), slug],
  categories: () => ['categories'],
};

export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: async () => {
      try {
        const res = await productService.getAll(params);
        if (res && res.success) {
          const list = res.data || res.products;
          return Array.isArray(list) ? list : [];
        }
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Error fetching products in useProductsQuery:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

export function useProductDetailQuery(slug) {
  return useQuery({
    queryKey: PRODUCT_KEYS.detail(slug),
    queryFn: async () => {
      if (!slug) return null;
      const res = await productService.getBySlug(slug);
      if (!res || res.success === false) {
        throw new Error(res?.message || 'Product not found');
      }
      return res.data || res.product || res;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useRelatedProductsQuery(productId, limit = 4) {
  return useQuery({
    queryKey: ['products', 'related', productId, limit],
    queryFn: async () => {
      if (!productId) return [];
      const res = await productService.getRelated(productId, limit);
      return res?.data || res?.products || [];
    },
    enabled: !!productId,
    staleTime: 5 * 60 * 1000,
  });
}

export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (slug) => {
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
}
