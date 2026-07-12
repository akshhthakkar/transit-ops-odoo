import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { maintenanceApi } from './api';

export const MAINTENANCE_KEY = ['maintenance'] as const;

export function useMaintenance() {
  return useQuery({ queryKey: MAINTENANCE_KEY, queryFn: maintenanceApi.getAll });
}

export function useMaintenanceLog(id: string) {
  return useQuery({
    queryKey: [...MAINTENANCE_KEY, id],
    queryFn: () => maintenanceApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: maintenanceApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MAINTENANCE_KEY });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useCloseMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => maintenanceApi.close(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: MAINTENANCE_KEY });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}
