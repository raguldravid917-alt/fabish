import { useQuery, useQueryClient } from '@tanstack/react-query';
import { productService } from '../api/productService';
import { categoryService } from '../api/categoryService';

export const PRODUCT_KEYS = {
  all: ['products'],
  lists: () => [...PRODUCT_KEYS.all, 'list'],
  list: (params) => [...PRODUCT_KEYS.lists(), params],
  details: () => [...PRODUCT_KEYS.all, 'detail'],
  detail: (slug) => [...PRODUCT_KEYS.details(), slug],
  categories: () => ['categories'],
};

/**
 * Custom hook to fetch product listings with TanStack Query caching.
 * Stale time: 5 minutes. Cache time: 30 minutes.
 */
export function useProductsQuery(params = {}) {
  return useQuery({
    queryKey: PRODUCT_KEYS.list(params),
    queryFn: async () => {
      const res = await productService.getAll(params);
      if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch products');
      }
      return res.data || res.products || res;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,   // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
}

/**
 * Custom hook to fetch a single product by slug with TanStack Query caching.
 */
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
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 60 * 60 * 1000,   // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Custom hook to fetch category list with infinite cache (static).
 */
export function useCategoriesQuery() {
  return useQuery({
    queryKey: PRODUCT_KEYS.categories(),
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (!res || res.success === false) {
        throw new Error(res?.message || 'Failed to fetch categories');
      }
      return res.data || res.categories || [];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000,   // 1 hour
    refetchOnWindowFocus: false,
  });
}

/**
 * Hook returning a function to prefetch product detail data on hover.
 */
export function usePrefetchProduct() {
  const queryClient = useQueryClient();

  return (slug) => {
    if (!slug) return;
    queryClient.prefetchQuery({
      queryKey: PRODUCT_KEYS.detail(slug),
      queryFn: async () => {
        const res = await productService.getBySlug(slug);
        return res.data || res.product || res;
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}
