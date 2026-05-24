import { api } from './client';
import type { SalePort } from '../../core/domain/ports/SalePort';
import type { Sale, PaginatedResponse, SaleMetrics } from '../../core/domain/entities/types';

export const saleAdapter: SalePort = {
  getAll(filters) {
    const params = new URLSearchParams();
    if (filters?.page) params.set('page', String(filters.page));
    const qs = params.toString();
    return api.get<PaginatedResponse<Sale>>(`/sales${qs ? `?${qs}` : ''}`);
  },

  create(data) {
    return api.post<Sale>('/sales', data);
  },

  getMetrics() {
    return api.get<SaleMetrics>('/sales/metrics');
  },
};
