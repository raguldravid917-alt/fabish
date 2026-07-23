import { useQuery } from '@tanstack/react-query';
import { addressService } from '../../api/addressService';

export function useAddressesQuery() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await addressService.getAll();
      return res?.data || res || [];
    },
    enabled: !!token && token !== 'undefined' && token !== 'null',
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}
