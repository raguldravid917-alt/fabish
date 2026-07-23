import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '../../api/categoryService';

export function useCategoryMutations() {
  const queryClient = useQueryClient();

  const createCategoryMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await categoryService.create(formData);
      if (!res.success) {
        throw new Error(res.message || 'Failed to create category');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await categoryService.update(id, formData);
      if (!res.success) {
        throw new Error(res.message || 'Failed to update category');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id) => {
      const res = await categoryService.delete(id);
      if (!res.success) {
        throw new Error(res.message || 'Failed to delete category');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });

  return {
    createCategoryMutation,
    updateCategoryMutation,
    deleteCategoryMutation,
  };
}
