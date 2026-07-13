import { api } from './client';
import type { PropertyDraft } from '../../core/domain/entities/types';

export const aiAdapter = {
  /** Convierte un prompt libre en un borrador estructurado de propiedad (requiere sesión) */
  propertyDraft(prompt: string) {
    return api.post<PropertyDraft>('/ai/property-draft', { prompt });
  },
};
