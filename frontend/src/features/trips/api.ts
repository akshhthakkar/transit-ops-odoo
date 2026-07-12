import { apiClient } from '../../lib/api-client';

export const tripsApi = {
  getAll:   ()   => apiClient.get('/trips').then((r) => r.data),
  getById:  (id: string) => apiClient.get(`/trips/${id}`).then((r) => r.data),
  create:   (data: unknown) => apiClient.post('/trips', data).then((r) => r.data),
  dispatch: (id: string) => apiClient.post(`/trips/${id}/dispatch`).then((r) => r.data),
  complete: (id: string, data: unknown) => apiClient.post(`/trips/${id}/complete`, data).then((r) => r.data),
  cancel:   (id: string) => apiClient.post(`/trips/${id}/cancel`).then((r) => r.data),
};
