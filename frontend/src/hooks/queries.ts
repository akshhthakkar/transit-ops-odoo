import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import {
  mapVehicle,
  mapDriver,
  mapTrip,
  mapMaintenance,
  mapExpense,
  mapFuelLogToExpense,
} from "@/lib/mappers";
import type { Vehicle, Driver, Trip, MaintenanceRecord, Expense } from "@/lib/transit-data";

// ─── Vehicles ────────────────────────────────────────────────────────────────

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      const res = await apiClient.get("/vehicles");
      const list = res.data.items ?? res.data.data ?? res.data;
      return Array.isArray(list) ? list.map(mapVehicle) : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/vehicles", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

export function useUpdateVehicle() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Record<string, unknown>) =>
      apiClient.patch(`/vehicles/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["vehicles"] }),
  });
}

// ─── Drivers ─────────────────────────────────────────────────────────────────

export function useDrivers() {
  return useQuery<Driver[]>({
    queryKey: ["drivers"],
    queryFn: async () => {
      const res = await apiClient.get("/drivers");
      const list = res.data.items ?? res.data.data ?? res.data;
      return Array.isArray(list) ? list.map(mapDriver) : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/drivers", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["drivers"] }),
  });
}

// ─── Trips ───────────────────────────────────────────────────────────────────

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: ["trips"],
    queryFn: async () => {
      const res = await apiClient.get("/trips");
      const list = res.data.items ?? res.data.data ?? res.data;
      return Array.isArray(list) ? list.map(mapTrip) : [];
    },
    staleTime: 30_000,
  });
}

export function useCreateTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/trips", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useUpdateTripStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiClient.patch(`/trips/${id}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useCancelTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/trips/${id}/cancel`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

export function useDispatchTrip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/trips/${id}/dispatch`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trips"] }),
  });
}

// ─── Maintenance ─────────────────────────────────────────────────────────────

export function useMaintenance() {
  return useQuery<MaintenanceRecord[]>({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const res = await apiClient.get("/maintenance");
      return (res.data.data ?? res.data).map(mapMaintenance);
    },
    staleTime: 30_000,
  });
}

export function useCreateMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient.post("/maintenance", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}

export function useCloseMaintenance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/maintenance/${id}/close`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["maintenance"] }),
  });
}

// ─── Expenses (Expenses + Fuel Logs combined) ─────────────────────────────────

export function useExpenses() {
  return useQuery<Expense[]>({
    queryKey: ["expenses"],
    queryFn: async () => {
      const [expensesRes, fuelRes] = await Promise.all([
        apiClient.get("/fuel/expenses"),
        apiClient.get("/fuel/logs"),
      ]);
      const expenses: Expense[] = (expensesRes.data.data ?? expensesRes.data).map(mapExpense);
      const fuelLogs: Expense[] = (fuelRes.data.data ?? fuelRes.data).map(mapFuelLogToExpense);
      return [...expenses, ...fuelLogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    },
    staleTime: 30_000,
  });
}

// ─── Dashboard / Reports ──────────────────────────────────────────────────────

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await apiClient.get("/reports/summary");
      return res.data;
    },
    staleTime: 60_000,
  });
}

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: async () => {
      const res = await apiClient.get("/locations");
      return res.data;
    },
    staleTime: 300_000,
  });
}
