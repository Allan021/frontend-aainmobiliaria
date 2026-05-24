import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadAdapter } from '../../infrastructure/api/leadAdapter';

export function useLeads(filters?: { status?: string; page?: number }) {
  return useQuery({
    queryKey: ['leads', filters],
    queryFn: () => leadAdapter.getAll(filters),
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: leadAdapter.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => leadAdapter.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['leads'] }),
  });
}
