import { apiClient } from '../../lib/api-client';

export const maintenanceApi = {
  getAll:  ()   => apiClient.get('/maintenance').then((r) => r.data),
  getById: (id: string) => apiClient.get(`/maintenance/${id}`).then((r) => r.data),
  create:  (data: unknown) => apiClient.post('/maintenance', data).then((r) => r.data),
  close:   (id: string)   => apiClient.post(`/maintenance/${id}/close`).then((r) => r.data),
};
