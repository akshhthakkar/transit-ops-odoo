import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi, locationsApi } from './api';

export const TRIPS_KEY = ['trips'] as const;

export function useTrips(filters?: any) {
  return useQuery({
    queryKey: filters ? [...TRIPS_KEY, filters] : TRIPS_KEY,
    queryFn: () => tripsApi.getAll(filters),
  });
}

export function useTrip(id: string) {
  return useQuery({
    queryKey: [...TRIPS_KEY, id],
    queryFn: () => tripsApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: tripsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useDispatchTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.dispatch(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      qc.invalidateQueries({ queryKey: [...TRIPS_KEY, id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useCompleteTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => tripsApi.complete(id, data),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      qc.invalidateQueries({ queryKey: [...TRIPS_KEY, variables.id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useCancelTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => tripsApi.cancel(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: TRIPS_KEY });
      qc.invalidateQueries({ queryKey: [...TRIPS_KEY, id] });
      qc.invalidateQueries({ queryKey: ['vehicles'] });
      qc.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: locationsApi.getAll,
  });
}
