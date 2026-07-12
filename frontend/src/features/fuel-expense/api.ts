import { apiClient } from '../../lib/api-client';

export const fuelExpenseApi = {
  getFuelLogs:   (vehicleId?: string) => apiClient.get('/fuel/logs',     { params: { vehicleId } }).then((r) => r.data),
  createFuelLog: (data: unknown)      => apiClient.post('/fuel/logs',     data).then((r) => r.data),
  getExpenses:   (vehicleId?: string) => apiClient.get('/fuel/expenses',  { params: { vehicleId } }).then((r) => r.data),
  createExpense: (data: unknown)      => apiClient.post('/fuel/expenses', data).then((r) => r.data),
};
