import { useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '../../api/productService';

export function useProductMutations() {
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (formData) => {
      const res = await productService.create(formData);
      if (!res.success) {
        throw new Error(res.message || 'Failed to create product');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, formData }) => {
      const res = await productService.update(id, formData);
      if (!res.success) {
        throw new Error(res.message || 'Failed to update product');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      const res = await productService.delete(id);
      if (!res.success) {
        throw new Error(res.message || 'Failed to delete product');
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  return {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation,
  };
}
