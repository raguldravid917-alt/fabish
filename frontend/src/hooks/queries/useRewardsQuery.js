import { useQuery } from '@tanstack/react-query';
import { rewardService } from '../../api/rewardService';

export function useRewardsQuery() {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  return useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const res = await rewardService.getRewards();
      return res?.data || { points: 0, tier: 'Bronze', transactions: [] };
    },
    enabled: !!token && token !== 'undefined' && token !== 'null',
    staleTime: 5 * 60 * 1000,
  });
}
