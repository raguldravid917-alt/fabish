import { useQueryClient } from '@tanstack/react-query';
import { useCategoriesQuery } from './queries/useCategoriesQuery';

/**
 * Backward-compatible hook for Categories powered by TanStack React Query.
 * Replaces CategoryContext.
 */
export const useCategories = () => {
  const queryClient = useQueryClient();
  const { data: categories = [], isLoading, isFetching, refetch } = useCategoriesQuery();

  const refreshCategories = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    return refetch();
  };

  return {
    categories,
    loading: isLoading || isFetching,
    refreshCategories,
  };
};
