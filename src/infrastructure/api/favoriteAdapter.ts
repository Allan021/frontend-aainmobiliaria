import { api } from './client';
import type { Favorite } from '../../core/domain/entities/types';

export const favoriteAdapter = {
  getAll() {
    return api.get<Favorite[]>('/favorites');
  },

  add(propertyId: string) {
    return api.post<Favorite>(`/favorites/${propertyId}`);
  },

  remove(propertyId: string) {
    return api.delete(`/favorites/${propertyId}`);
  },
};
