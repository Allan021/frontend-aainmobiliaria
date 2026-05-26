import { useState } from 'react';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { useDeleteProperty } from '../../hooks/useProperties';
import { ConfirmModal } from './ConfirmModal';

const statusColors: Record<string, { bg: string; text: string }> = {
  disponible: { bg: 'rgba(74,124,89,0.12)', text: '#4A7C59' },
  apartado:   { bg: 'rgba(184,134,46,0.12)', text: '#B8862E' },
  vendido:    { bg: 'rgba(140,58,46,0.12)', text: '#8C3A2E' },
  borrador:   { bg: 'rgba(90,90,99,0.12)', text: '#5A5A63' },
};

const statusLabels: Record<string, string> = {
  disponible: 'Disponible',
  apartado: 'Apartado',
  vendido: 'Vendido',
  borrador: 'Borrador',
};

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

interface Props {
  properties: Property[];
  onEdit?: (property: Property) => void;
  m?: M;
}

export function ListingsTable({ properties, onEdit, m }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<Property | null>(null);
  const deleteProperty = useDeleteProperty();

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteProperty.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  const themeM = m || {
    mainBg: '#FAF8F3', mainSurface: '#FFFFFF', mainBorder: '#E6E0D2',
    mainText: '#111113', mainTextMuted: '#5A5A63', mainTextDim: '#9A9383',
    mainCardBg: '#FFFFFF', mainTopbarBg: '#FAF8F3',
  };

  if (properties.length === 0) {
    return (
      <div style={{
        background: themeM.mainCardBg, borderRadius: '1rem', border: `1px solid ${themeM.mainBorder}`,
        padding: '4rem', textAlign: 'center', color: themeM.mainTextDim, fontSize: '0.875rem'
      }}>
        Sin propiedades registradas.
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {properties.map((p) => {
          const thumb = p.images?.[0]?.url;
          const sc = statusColors[p.status] || statusColors.borrador;
          const typeLabel = p.type || 'Propiedad';
          const paymentLabel = p.financing ? 'Financiado' : 'Contado';

          return (
            <div key={p.id}
              onClick={() => onEdit?.(p)}
              style={{
                background: themeM.mainCardBg, border: `1px solid ${themeM.mainBorder}`, borderRadius: '1rem',
                overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                display: 'flex', flexDirection: 'column', height: '100%',
              }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4B254')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = themeM.mainBorder)}
            >
              {/* Thumbnail */}
              <div style={{ height: '160px', background: themeM.mainBorder, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
                {thumb ? (
                  <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>🏗️</div>
                )}
                
                {/* Badges on Thumbnail */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', display: 'flex', gap: '4px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    background: 'rgba(17,17,19,0.65)', color: '#FAF8F3', backdropFilter: 'blur(4px)'
                  }}>
                    {typeLabel}
                  </span>
                  <span style={{
                    padding: '3px 8px', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 700,
                    letterSpacing: '0.05em', textTransform: 'uppercase',
                    background: p.financing ? 'rgba(184,134,46,0.85)' : 'rgba(74,124,89,0.85)', color: '#FAF8F3', backdropFilter: 'blur(4px)'
                  }}>
                    {paymentLabel}
                  </span>
                </div>

                <span style={{
                  position: 'absolute', top: '10px', right: '10px',
                  padding: '3px 10px', borderRadius: '999px',
                  fontSize: '0.6875rem', fontWeight: 600,
                  background: sc.bg, color: sc.text, backdropFilter: 'blur(4px)'
                }}>
                  {statusLabels[p.status] || p.status}
                </span>
              </div>

              {/* Content */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: themeM.mainText, marginBottom: '4px', lineBreak: 'anywhere' }}>
                  {p.title}
                </div>
                <div style={{ fontSize: '0.75rem', color: themeM.mainTextDim, marginBottom: '1.25rem' }}>
                  📍 {p.municipio || 'N/A'}, {p.departamento || p.dep_code || 'N/A'}
                </div>

                {/* Bottom space spacer to push buttons down */}
                <div style={{ flex: 1 }} />

                {/* Price and Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: themeM.mainText }}>
                    {formatPrice(p.price, p.currency || 'L')}
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button onClick={e => { e.stopPropagation(); window.open(`/propiedad/${p.id}`, '_blank'); }} style={{
                      padding: '5px 12px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                      background: themeM.mainSurface, border: `1px solid ${themeM.mainBorder}`,
                      color: themeM.mainTextMuted, cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }} title="Ver en web">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                      Web
                    </button>
                    <button onClick={e => { e.stopPropagation(); onEdit?.(p); }} style={{
                      padding: '5px 12px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                      background: themeM.mainSurface, border: `1px solid ${themeM.mainBorder}`,
                      color: themeM.mainTextMuted, cursor: 'pointer', fontFamily: 'inherit',
                    }}>Editar</button>
                    <button onClick={e => { e.stopPropagation(); setConfirmDelete(p); }} style={{
                      padding: '5px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                      background: 'none', border: `1px solid rgba(140,58,46,0.2)`,
                      color: '#8C3A2E', cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }} title="Eliminar propiedad">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {confirmDelete && (
        <ConfirmModal
          title={`¿Eliminar "${confirmDelete.title}"?`}
          message="Si fue publicada en Facebook, también se eliminará ese post. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
          m={themeM}
        />
      )}
    </div>
  );
}
