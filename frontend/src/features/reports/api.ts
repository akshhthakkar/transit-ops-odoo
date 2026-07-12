import { apiClient } from '../../lib/api-client';

export const reportsApi = {
  getDashboard:   () => apiClient.get('/reports/dashboard').then((r) => r.data),
  getVehicles:    () => apiClient.get('/reports/vehicles').then((r) => r.data),
  getTrips:       () => apiClient.get('/reports/trips').then((r) => r.data),
  getRoi:         () => apiClient.get('/reports/roi').then((r) => r.data),
  exportCsv: (type: string) =>
    apiClient.get('/reports/export/csv', { params: { type }, responseType: 'blob' }).then((r) => r.data),
};
