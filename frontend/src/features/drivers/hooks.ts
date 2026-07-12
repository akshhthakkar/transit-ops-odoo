import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { driversApi } from './api';

export const DRIVERS_KEY = ['drivers'] as const;

export function useDrivers(filters?: any) {
  return useQuery({
    queryKey: filters ? [...DRIVERS_KEY, filters] : DRIVERS_KEY,
    queryFn: () => driversApi.getAll(filters),
  });
}

export function useEligibleDrivers() {
  return useQuery({
    queryKey: [...DRIVERS_KEY, 'eligible'],
    queryFn: driversApi.getEligible,
  });
}

export function useDriver(id: string) {
  return useQuery({
    queryKey: [...DRIVERS_KEY, id],
    queryFn: () => driversApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driversApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: DRIVERS_KEY }),
  });
}

export function useUpdateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => driversApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: DRIVERS_KEY });
      qc.invalidateQueries({ queryKey: [...DRIVERS_KEY, variables.id] });
    },
  });
}

export function useDeleteDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: driversApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: DRIVERS_KEY }),
  });
}
