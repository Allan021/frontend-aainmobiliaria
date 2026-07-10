import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyAdapter } from '../../infrastructure/api/propertyAdapter';
import type { PropertyFilters, Property } from '../../core/domain/entities/types';

export function useProperties(filters?: PropertyFilters) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyAdapter.getAll(filters),
  });
}

export function useProperty(id: string) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyAdapter.getById(id),
    enabled: !!id,
  });
}

export function useMyProperties() {
  return useQuery({
    queryKey: ['myProperties'],
    queryFn: () => propertyAdapter.getMine(),
    retry: false,
  });
}

export function usePropertyStats() {
  return useQuery({
    queryKey: ['propertyStats'],
    queryFn: () => propertyAdapter.getStats(),
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Property>) => propertyAdapter.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Property> }) => propertyAdapter.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => propertyAdapter.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['properties'] }),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => propertyAdapter.uploadImage(id, file),
  });
}
