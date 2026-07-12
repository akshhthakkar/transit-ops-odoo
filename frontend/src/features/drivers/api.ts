import { apiClient } from '../../lib/api-client';

export const driversApi = {
  getAll: (filters?: any) =>
    apiClient.get('/drivers', { params: filters }).then((r) => r.data),

  getEligible: () =>
    apiClient.get('/drivers/eligible').then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/drivers/${id}`).then((r) => r.data),

  create: (data: any) =>
    apiClient.post('/drivers', data).then((r) => r.data),

  update: (id: string, data: any) =>
    apiClient.patch(`/drivers/${id}`, data).then((r) => r.data),

  remove: (id: string) =>
    apiClient.delete(`/drivers/${id}`).then((r) => r.data),
};
