import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { QueryProvider } from '../../providers/QueryProvider';
import { useMyProperties } from '../../hooks/useProperties';
import { isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { propertyAdapter } from '../../../infrastructure/api/propertyAdapter';
import { formatPrice, cleanTitle, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { IconHome, IconEdit, IconEye, IconTrash, IconPlus, IconLogout, IconPause, IconPlay } from '../shared/rs-icons';

const STATUS_BADGE: Record<string, { text: string; bg: string; fg: string }> = {
  disponible: { text: 'Publicada', bg: '#E8F0EA', fg: '#2F6B45' },
  borrador: { text: 'Pausada', bg: '#F3EFE6', fg: '#7A7364' },
  apartado: { text: 'Apartada', bg: '#FBF1D9', fg: '#96701F' },
  vendido: { text: 'Vendida', bg: '#DCE7F3', fg: '#2E5C8C' },
};

function RowSkeleton() {
  return (
    <div className="rs-card" style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 14 }}>
      <div className="rs-skeleton" style={{ width: 104, height: 78, flexShrink: 0 }} />
      <div style={{ flex: 1 }}>
        <div className="rs-skeleton" style={{ height: 16, width: '60%', marginBottom: 8 }} />
        <div className="rs-skeleton" style={{ height: 12, width: '40%' }} />
      </div>
      <div className="rs-skeleton" style={{ height: 36, width: 180 }} />
    </div>
  );
}

function MyPropertiesInner() {
  const { data, isLoading } = useMyProperties();
  const qc = useQueryClient();

  useEffect(() => {
    if (!isLoggedIn()) requireLogin();
  }, []);

  const toggleStatus = useMutation({
    mutationFn: (p: Property) =>
      propertyAdapter.update(p.id, { status: p.status === 'disponible' ? 'borrador' : 'disponible' }),
    onSettled: () => qc.invalidateQueries({ queryKey: ['myProperties'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => propertyAdapter.remove(id),
    onSettled: () => qc.invalidateQueries({ queryKey: ['myProperties'] }),
  });

  const properties = data?.data || [];

  return (
    <div className="rs-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 14 }}>
        <div>
          <div className="rs-page__eyebrow">Mi cuenta</div>
          <h1 className="rs-page__title">Mis propiedades</h1>
          <p className="rs-page__sub" style={{ marginTop: 4 }}>
            {isLoading ? 'Cargando…' : `${properties.length} ${properties.length === 1 ? 'publicación' : 'publicaciones'}`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <a href="/publicar" className="rs-btn rs-btn--primary"><IconPlus size={16} /> Publicar nueva</a>
          <button
            onClick={() => { localStorage.removeItem('aa_token'); window.location.href = '/'; }}
            className="rs-btn rs-btn--ghost rs-btn--sm"
            title="Cerrar sesión"
          >
            <IconLogout size={15} /> Salir
          </button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: '1.75rem' }}>
        {isLoading && <><RowSkeleton /><RowSkeleton /><RowSkeleton /></>}

        {!isLoading && properties.length === 0 && (
          <div className="rs-empty">
            <div className="rs-empty__icon"><IconHome size={28} /></div>
            <div className="rs-empty__title">Aún no publica propiedades</div>
            <div className="rs-empty__sub">Publique gratis — es anónimo y nosotros atendemos a los interesados.</div>
            <a href="/publicar" className="rs-btn rs-btn--primary" style={{ marginTop: 18 }}>
              <IconPlus size={16} /> Publicar mi primera propiedad
            </a>
          </div>
        )}

        {properties.map(p => {
          const badge = STATUS_BADGE[p.status] || STATUS_BADGE.borrador;
          const paused = p.status === 'borrador';
          return (
            <div key={p.id} className="rs-card rs-card--hover" style={{
              display: 'flex', gap: 14, alignItems: 'center', padding: 14, flexWrap: 'wrap',
              opacity: paused ? 0.85 : 1,
            }}>
              <img
                src={p.images?.[0]?.url ? optimizeCloudinaryUrl(p.images[0].url, 220) : '/montana.jpg'}
                alt="" width={104} height={78}
                style={{ width: 104, height: 78, objectFit: 'cover', borderRadius: 11, flexShrink: 0, filter: paused ? 'grayscale(0.6)' : 'none' }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--main-text, #111113)', letterSpacing: '-0.01em' }}>
                  {cleanTitle(p.title)}
                </div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 3, fontFeatureSettings: "'tnum' 1" }}>
                  {p.municipio}, {p.departamento} · <b style={{ color: 'var(--main-text-muted, #5A5A63)' }}>{formatPrice(p.price, p.currency)}</b>
                </div>
                <span className="rs-badge" style={{ background: badge.bg, color: badge.fg, marginTop: 8 }}>
                  <span className="rs-badge__dot" />{badge.text}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`/publicar?id=${p.id}`} className="rs-btn rs-btn--secondary rs-btn--sm">
                  <IconEdit size={14} /> Editar
                </a>
                <a href={`/propiedad/${p.id}`} className="rs-btn rs-btn--secondary rs-btn--sm">
                  <IconEye size={14} /> Ver
                </a>
                {(p.status === 'disponible' || p.status === 'borrador') && (
                  <button onClick={() => toggleStatus.mutate(p)} disabled={toggleStatus.isPending}
                    className="rs-btn rs-btn--secondary rs-btn--sm">
                    {p.status === 'disponible' ? <><IconPause size={14} /> Pausar</> : <><IconPlay size={14} /> Publicar</>}
                  </button>
                )}
                <button
                  onClick={() => { if (window.confirm('¿Eliminar esta publicación? No se puede deshacer.')) remove.mutate(p.id); }}
                  disabled={remove.isPending}
                  className="rs-btn rs-btn--danger rs-btn--sm"
                  aria-label={`Eliminar ${cleanTitle(p.title)}`}
                >
                  <IconTrash size={14} /> Eliminar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function MyPropertiesApp() {
  return (
    <QueryProvider>
      <MyPropertiesInner />
    </QueryProvider>
  );
}
