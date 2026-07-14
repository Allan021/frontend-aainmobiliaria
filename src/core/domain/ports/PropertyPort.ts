import type { Property, PropertyFilters, PaginatedResponse, PropertyStats } from '../entities/types';

export interface PropertyPort {
  getAll(filters?: PropertyFilters): Promise<PaginatedResponse<Property>>;
  getById(id: string): Promise<Property>;
  getMine(): Promise<PaginatedResponse<Property>>;
  create(data: Partial<Property>): Promise<Property>;
  update(id: string, data: Partial<Property>): Promise<Property>;
  remove(id: string): Promise<void>;
  uploadImage(id: string, file: File): Promise<{ url: string }>;
  removeImage(id: string, imageId: string): Promise<void>;
  generateHousePreview(id: string, imageUrl: string): Promise<{ url: string }>;
  getStats(): Promise<PropertyStats>;
}
