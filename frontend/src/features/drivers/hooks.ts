import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from './api';

export const DRIVERS_KEY = ['drivers'] as const;

export function useDrivers()         { return useQuery({ queryKey: DRIVERS_KEY, queryFn: driversApi.getAll }); }
export function useEligibleDrivers() { return useQuery({ queryKey: [...DRIVERS_KEY, 'eligible'], queryFn: driversApi.getEligible }); }
export function useDriver(id: string){ return useQuery({ queryKey: [...DRIVERS_KEY, id], queryFn: () => driversApi.getById(id), enabled: !!id }); }

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: driversApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: DRIVERS_KEY }) });
}
