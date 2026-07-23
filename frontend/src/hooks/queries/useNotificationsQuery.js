import { useQuery } from '@tanstack/react-query';
import { notificationService } from '../../api/notificationService';

export function useNotificationsQuery() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await notificationService.getNotifications();
      return res?.data || [];
    },
    enabled: !!token && token !== 'undefined' && token !== 'null',
    staleTime: 2 * 60 * 1000,
  });
}
