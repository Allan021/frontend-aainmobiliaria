import { api } from './client';
import type { PropertyPort } from '../../core/domain/ports/PropertyPort';
import type { Property, PropertyFilters, PaginatedResponse, PropertyStats } from '../../core/domain/entities/types';

export const propertyAdapter: PropertyPort = {
  getAll(filters?: PropertyFilters) {
    const params = new URLSearchParams();
    if (filters?.dep) params.set('dep', filters.dep);
    if (filters?.pay) params.set('pay', filters.pay);
    if (filters?.status) params.set('status', filters.status);
    if (filters?.search) params.set('search', filters.search);
    if (filters?.page) params.set('page', String(filters.page));
    if (filters?.limit) params.set('limit', String(filters.limit));
    const qs = params.toString();
    return api.get<PaginatedResponse<Property>>(`/properties${qs ? `?${qs}` : ''}`);
  },

  getById(id: string) {
    return api.get<Property>(`/properties/${id}`);
  },

  getMine() {
    return api.get<PaginatedResponse<Property>>('/properties/mine');
  },

  create(data: Partial<Property>) {
    return api.post<Property>('/properties', data);
  },

  update(id: string, data: Partial<Property>) {
    return api.put<Property>(`/properties/${id}`, data);
  },

  remove(id: string) {
    return api.delete(`/properties/${id}`);
  },

  uploadImage(id: string, file: File) {
    return api.upload<{ url: string }>(`/properties/${id}/images`, file);
  },

  removeImage(id: string, imageId: string) {
    return api.delete(`/properties/${id}/images/${imageId}`);
  },

  generateHousePreview(id: string, imageUrl: string) {
    return api.post<{ url: string }>(`/properties/${id}/house-preview`, { imageUrl });
  },

  getStats() {
    return api.get<PropertyStats>('/properties/stats');
  },
};
