import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tripsApi } from './api';

export const TRIPS_KEY = ['trips'] as const;

export function useTrips()         { return useQuery({ queryKey: TRIPS_KEY, queryFn: tripsApi.getAll }); }
export function useTrip(id: string){ return useQuery({ queryKey: [...TRIPS_KEY, id], queryFn: () => tripsApi.getById(id), enabled: !!id }); }

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: tripsApi.create, onSuccess: () => qc.invalidateQueries({ queryKey: TRIPS_KEY }) });
}

export function useDispatchTrip() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => tripsApi.dispatch(id), onSuccess: () => qc.invalidateQueries({ queryKey: TRIPS_KEY }) });
}

export function useCompleteTrip() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: unknown }) => tripsApi.complete(id, data), onSuccess: () => qc.invalidateQueries({ queryKey: TRIPS_KEY }) });
}

export function useCancelTrip() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => tripsApi.cancel(id), onSuccess: () => qc.invalidateQueries({ queryKey: TRIPS_KEY }) });
}
