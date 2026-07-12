import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fuelExpenseApi } from './api';

export const FUEL_KEY    = ['fuel']    as const;
export const EXPENSE_KEY = ['expense'] as const;

export function useFuelLogs(vehicleId?: string)  { return useQuery({ queryKey: [...FUEL_KEY, vehicleId],    queryFn: () => fuelExpenseApi.getFuelLogs(vehicleId) }); }
export function useExpenses(vehicleId?: string)  { return useQuery({ queryKey: [...EXPENSE_KEY, vehicleId], queryFn: () => fuelExpenseApi.getExpenses(vehicleId) }); }

export function useCreateFuelLog() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fuelExpenseApi.createFuelLog, onSuccess: () => qc.invalidateQueries({ queryKey: FUEL_KEY }) });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fuelExpenseApi.createExpense, onSuccess: () => qc.invalidateQueries({ queryKey: EXPENSE_KEY }) });
}
