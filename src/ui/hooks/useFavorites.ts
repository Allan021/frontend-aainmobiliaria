import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoriteAdapter } from '../../infrastructure/api/favoriteAdapter';
import type { Favorite } from '../../core/domain/entities/types';

export function isLoggedIn(): boolean {
  return typeof window !== 'undefined' && !!localStorage.getItem('aa_token');
}

/** Redirige a login público conservando la ruta actual */
export function requireLogin() {
  window.location.href = `/acceder?next=${encodeURIComponent(window.location.pathname + window.location.search)}`;
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => favoriteAdapter.getAll(),
    enabled: isLoggedIn(),
    retry: false,
  });
}

/** Set de property_ids favoritos para lookup O(1) en cards */
export function useFavoriteIds(): Set<string> {
  const { data } = useFavorites();
  return new Set((data || []).map(f => f.property_id));
}

export function useToggleFavorite() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ propertyId, saved }: { propertyId: string; saved: boolean }) =>
      saved ? favoriteAdapter.remove(propertyId) : favoriteAdapter.add(propertyId),
    // Optimista: el corazón responde al instante
    onMutate: async ({ propertyId, saved }) => {
      await qc.cancelQueries({ queryKey: ['favorites'] });
      const prev = qc.getQueryData<Favorite[]>(['favorites']);
      qc.setQueryData<Favorite[]>(['favorites'], (old = []) =>
        saved
          ? old.filter(f => f.property_id !== propertyId)
          : [...old, { id: `tmp-${propertyId}`, property_id: propertyId, created_at: '' }],
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['favorites'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['favorites'] }),
  });
}
