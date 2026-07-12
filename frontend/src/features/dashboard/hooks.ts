import { useQuery } from '@tanstack/react-query';
import { reportsApi } from '../reports/api';

export function useDashboardKpis() {
  return useQuery({ queryKey: ['reports', 'dashboard'], queryFn: reportsApi.getDashboard });
}
