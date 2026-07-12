import { apiClient } from '../../lib/api-client';

export const tripsApi = {
  getAll: (filters?: any) =>
    apiClient.get('/trips', { params: filters }).then((r) => r.data),

  getById: (id: string) =>
    apiClient.get(`/trips/${id}`).then((r) => r.data),

  create: (data: any) =>
    apiClient.post('/trips', data).then((r) => r.data),

  dispatch: (id: string) =>
    apiClient.post(`/trips/${id}/dispatch`).then((r) => r.data),

  complete: (id: string, data: any) =>
    apiClient.post(`/trips/${id}/complete`, data).then((r) => r.data),

  cancel: (id: string) =>
    apiClient.post(`/trips/${id}/cancel`).then((r) => r.data),
};

export const locationsApi = {
  getAll: () =>
    apiClient.get('/locations').then((r) => r.data),
};
