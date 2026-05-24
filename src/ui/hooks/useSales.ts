import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { saleAdapter } from '../../infrastructure/api/saleAdapter';
import type { Sale } from '../../core/domain/entities/types';

export function useSales(filters?: { page?: number }) {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: () => saleAdapter.getAll(filters),
  });
}

export function useSaleMetrics() {
  return useQuery({
    queryKey: ['saleMetrics'],
    queryFn: () => saleAdapter.getMetrics(),
  });
}

export function useCreateSale() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Sale>) => saleAdapter.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['sales'] }),
  });
}
