import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';
import type { Lote, Pago } from '../../core/domain/entities/types';

export function useLotes(lotificationId: string | undefined) {
  return useQuery<Lote[]>({
    queryKey: ['lotes', lotificationId],
    queryFn: () => api.get(`/lotificaciones/${lotificationId}/lotes`),
    enabled: !!lotificationId,
  });
}

export function useCreateLote(lotificationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lote>) => api.post(`/lotificaciones/${lotificationId}/lotes`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotes', lotificationId] }),
  });
}

export function useUpdateLote(lotificationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Lote> }) => api.put(`/lotes/${id}`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lotes', lotificationId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDeleteLote(lotificationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/lotes/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['lotes', lotificationId] });
      qc.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useAddPago(lotificationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ loteId, data }: { loteId: string; data: Partial<Pago> }) =>
      api.post(`/lotes/${loteId}/pagos`, data),
    onSuccess: (_: unknown, vars: { loteId: string; data: Partial<Pago> }) =>
      qc.invalidateQueries({ queryKey: ['lotes', lotificationId] }),
  });
}

export function useDeletePago(lotificationId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ loteId, pagoId }: { loteId: string; pagoId: string }) =>
      api.delete(`/lotes/${loteId}/pagos/${pagoId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['lotes', lotificationId] }),
  });
}
