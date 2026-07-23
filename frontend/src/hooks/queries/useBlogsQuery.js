import { useQuery } from '@tanstack/react-query';
import { api } from '../../api/client';

export function useBlogsQuery(params = {}) {
  return useQuery({
    queryKey: ['blogs', params],
    queryFn: async () => {
      try {
        const res = await api.get('/blogs', { params });
        if (res && res.success) {
          const list = res.data || res.blogs;
          return Array.isArray(list) ? list : [];
        }
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Error fetching blogs:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useBlogDetailQuery(slug) {
  return useQuery({
    queryKey: ['blogs', 'detail', slug],
    queryFn: async () => {
      if (!slug) return null;
      try {
        const res = await api.get(`/blogs/${slug}`);
        if (res && res.success && res.data) {
          return res.data;
        }
        return res || null;
      } catch (err) {
        console.error(`Error fetching blog detail for ${slug}:`, err);
        return null;
      }
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
}

export function useBlogCategoriesQuery() {
  return useQuery({
    queryKey: ['blogs', 'categories'],
    queryFn: async () => {
      try {
        const res = await api.get('/blogs/categories');
        if (res && res.success && Array.isArray(res.data)) {
          return res.data;
        }
        return Array.isArray(res) ? res : [];
      } catch (err) {
        console.error('Error fetching blog categories:', err);
        return [];
      }
    },
    staleTime: 15 * 60 * 1000,
  });
}
