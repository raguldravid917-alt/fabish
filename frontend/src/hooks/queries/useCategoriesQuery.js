import { useQuery } from '@tanstack/react-query';
import { categoryService } from '../../api/categoryService';

export const CATEGORY_KEYS = {
  all: ['categories'],
};

export function useCategoriesQuery() {
  return useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: async () => {
      const res = await categoryService.getAll();
      if (res && res.success && Array.isArray(res.data)) {
        return res.data;
      }
      if (Array.isArray(res?.data)) {
        return res.data;
      }
      if (Array.isArray(res)) {
        return res;
      }
      return [];
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
