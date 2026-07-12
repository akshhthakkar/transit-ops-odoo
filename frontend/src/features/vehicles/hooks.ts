import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehiclesApi } from './api';

export const VEHICLES_KEY = ['vehicles'] as const;

export function useVehicles()    { return useQuery({ queryKey: VEHICLES_KEY, queryFn: vehiclesApi.getAll }); }
export function useAvailableVehicles() { return useQuery({ queryKey: [...VEHICLES_KEY, 'available'], queryFn: vehiclesApi.getAvailable }); }
export function useVehicle(id: string) { return useQuery({ queryKey: [...VEHICLES_KEY, id], queryFn: () => vehiclesApi.getById(id), enabled: !!id }); }

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: vehiclesApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: VEHICLES_KEY }) });
}
