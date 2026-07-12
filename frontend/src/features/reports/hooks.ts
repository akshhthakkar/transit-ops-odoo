import { useQuery } from '@tanstack/react-query';
import { reportsApi } from './api';

export const REPORTS_KEY = ['reports'] as const;

export function useDashboard()   { return useQuery({ queryKey: [...REPORTS_KEY, 'dashboard'], queryFn: reportsApi.getDashboard }); }
export function useVehicleReport(){ return useQuery({ queryKey: [...REPORTS_KEY, 'vehicles'],  queryFn: reportsApi.getVehicles }); }
export function useTripReport()  { return useQuery({ queryKey: [...REPORTS_KEY, 'trips'],     queryFn: reportsApi.getTrips }); }
export function useRoiReport()   { return useQuery({ queryKey: [...REPORTS_KEY, 'roi'],       queryFn: reportsApi.getRoi }); }
