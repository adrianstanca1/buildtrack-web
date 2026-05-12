import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useAnalyticsSummary() {
  return useQuery({
    queryKey: ['analytics', 'summary'],
    queryFn: async () => {
      const { data } = await api.get('/analytics/summary');
      return data?.data || null;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useProjectAnalytics(projectId: string) {
  return useQuery({
    queryKey: ['analytics', 'project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const { data } = await api.get(`/analytics/${projectId}`);
      return data?.data || null;
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
  });
}
