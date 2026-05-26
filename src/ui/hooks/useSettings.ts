import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../infrastructure/api/client';

export interface SiteSettings {
  id: number;
  whatsapp_phone: string;
  updated_at: string;
}

export function useSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['settings'],
    queryFn: () => api.get<SiteSettings>('/settings'),
    staleTime: 1000 * 60 * 5, // Cache settings for 5 minutes
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { whatsapp_phone: string }) => api.put<SiteSettings>('/settings', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['settings'] }),
  });
}
