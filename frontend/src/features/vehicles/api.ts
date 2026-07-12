import { apiClient } from '../../lib/api-client';

export const vehiclesApi = {
  getAll:      ()   => apiClient.get('/vehicles').then((r) => r.data),
  getAvailable:()   => apiClient.get('/vehicles/available').then((r) => r.data),
  getById:     (id: string) => apiClient.get(`/vehicles/${id}`).then((r) => r.data),
  create:      (data: unknown) => apiClient.post('/vehicles', data).then((r) => r.data),
  update:      (id: string, data: unknown) => apiClient.patch(`/vehicles/${id}`, data).then((r) => r.data),
  remove:      (id: string) => apiClient.delete(`/vehicles/${id}`).then((r) => r.data),
};
