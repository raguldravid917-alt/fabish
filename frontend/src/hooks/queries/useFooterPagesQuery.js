import { useQuery } from '@tanstack/react-query';
import { footerPageService } from '../../api/footerPageService';

export function useFooterPagesQuery() {
  return useQuery({
    queryKey: ['footerPages'],
    queryFn: async () => {
      const res = await footerPageService.getAll();
      return res?.data || res || [];
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useFooterPageDetailQuery(slug) {
  return useQuery({
    queryKey: ['footerPages', slug],
    queryFn: async () => {
      if (!slug) return null;
      const res = await footerPageService.getBySlug(slug);
      return res?.data || res;
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });
}
