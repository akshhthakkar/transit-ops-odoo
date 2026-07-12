import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from './api';

export const VEHICLES_KEY = ['vehicles'] as const;

export function useVehicles(filters?: any) {
  return useQuery({
    queryKey: filters ? [...VEHICLES_KEY, filters] : VEHICLES_KEY,
    queryFn: () => vehiclesApi.getAll(filters),
  });
}

export function useAvailableVehicles() {
  return useQuery({
    queryKey: [...VEHICLES_KEY, 'available'],
    queryFn: vehiclesApi.getAvailable,
  });
}

export function useVehicle(id: string) {
  return useQuery({
    queryKey: [...VEHICLES_KEY, id],
    queryFn: () => vehiclesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => vehiclesApi.update(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: VEHICLES_KEY });
      qc.invalidateQueries({ queryKey: [...VEHICLES_KEY, variables.id] });
    },
  });
}

export function useDeleteVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: vehiclesApi.remove,
    onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }),
  });
}
