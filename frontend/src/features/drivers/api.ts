import { apiClient } from '../../lib/api-client';

export const driversApi = {
  getAll:     ()   => apiClient.get('/drivers').then((r) => r.data),
  getEligible:()   => apiClient.get('/drivers/eligible').then((r) => r.data),
  getById:    (id: string) => apiClient.get(`/drivers/${id}`).then((r) => r.data),
  create:     (data: unknown) => apiClient.post('/drivers', data).then((r) => r.data),
  update:     (id: string, data: unknown) => apiClient.patch(`/drivers/${id}`, data).then((r) => r.data),
};
