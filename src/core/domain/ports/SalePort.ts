import type { Sale, PaginatedResponse, SaleMetrics } from '../entities/types';

export interface SalePort {
  getAll(filters?: { page?: number }): Promise<PaginatedResponse<Sale>>;
  create(data: Partial<Sale>): Promise<Sale>;
  getMetrics(): Promise<SaleMetrics>;
}
