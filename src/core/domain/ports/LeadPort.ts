import type { Lead, PaginatedResponse } from '../entities/types';

export interface LeadPort {
  getAll(filters?: { status?: string; page?: number }): Promise<PaginatedResponse<Lead>>;
  create(data: { name: string; email: string; phone?: string; property_id?: string; property_title?: string; visit_date?: string; visit_time?: string }): Promise<Lead>;
  updateStatus(id: string, status: string): Promise<Lead>;
  remove(id: string): Promise<void>;
}
