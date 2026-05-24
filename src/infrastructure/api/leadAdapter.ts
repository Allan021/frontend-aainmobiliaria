import { api } from './client';
import type { LeadPort } from '../../core/domain/ports/LeadPort';
import type { Lead, PaginatedResponse } from '../../core/domain/entities/types';

export const leadAdapter: LeadPort = {
  getAll(filters) {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api.get<PaginatedResponse<Lead>>(`/leads${qs ? `?${qs}` : ''}`);
  },

  create(data) {
    return api.post<Lead>('/leads', data);
  },

  updateStatus(id: string, status: string) {
    return api.patch<Lead>(`/leads/${id}/status`, { status });
  },

  remove(id: string) {
    return api.delete(`/leads/${id}`);
  },
};
