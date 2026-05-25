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

function ActionMenu({ property, onEdit, m }: { property: Property; onEdit?: (p: Property) => void; m?: M }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const deleteProperty = useDeleteProperty();

  const handleDelete = async () => {
    await deleteProperty.mutateAsync(property.id);
    setDeleting(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: deleting ? '#D4B254' : (m?.mainTextDim || '#9A9383'),
          fontSize: '1.25rem', fontWeight: 700, padding: '4px 8px',
          borderRadius: '0.375rem', lineHeight: 1,
        }}
      >{deleting ? '…' : '···'}</button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', right: 0, top: 'calc(100% + 4px)',
            background: m?.mainCardBg || '#FFFFFF',
            border: `1px solid ${m?.mainBorder || '#E6E0D2'}`,
            borderRadius: '0.625rem', padding: '0.375rem',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)', zIndex: 50,
            minWidth: '156px',
          }}>
            <button onClick={() => { onEdit?.(property); setOpen(false); }} style={{
              display: 'block', width: '100%', padding: '0.5rem 0.75rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left',
              color: m?.mainText || '#111113', borderRadius: '0.375rem',
              fontFamily: 'inherit',
            }}>Editar</button>
            <button onClick={() => { window.open(`/propiedad/${property.id}`, '_blank'); setOpen(false); }} style={{
              display: 'block', width: '100%', padding: '0.5rem 0.75rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left',
              color: m?.mainText || '#111113', borderRadius: '0.375rem',
              fontFamily: 'inherit',
            }}>Ver en sitio</button>
            <div style={{ height: 1, background: m?.mainBorder || '#E6E0D2', margin: '3px 0' }} />
            <button onClick={() => { setOpen(false); setConfirmOpen(true); }} style={{
              display: 'block', width: '100%', padding: '0.5rem 0.75rem',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.8125rem', fontWeight: 500, textAlign: 'left',
              color: '#8C3A2E', borderRadius: '0.375rem',
              fontFamily: 'inherit',
            }}>Eliminar</button>
          </div>
        </>
      )}

      {confirmOpen && (
        <ConfirmModal
          title={`¿Eliminar "${property.title}"?`}
          message="Si fue publicada en Facebook, también se eliminará ese post. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirmOpen(false)}
          m={m}
        />
      )}
    </div>
  );
}

export function ListingsTable({ properties, onEdit, m }: Props) {
  const border = `1px solid ${m?.mainBorder || '#E6E0D2'}`;
  const thStyle: React.CSSProperties = {
    padding: '0.75rem 1rem', fontSize: '0.625rem', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4B254',
    borderBottom: border, textAlign: 'left', whiteSpace: 'nowrap',
  };
  const tdStyle: React.CSSProperties = {
    padding: '0.875rem 1rem', fontSize: '0.8125rem',
    color: m?.mainText || '#111113', borderBottom: border,
  };

  return (
    <div style={{
      background: m?.mainCardBg || '#FFFFFF', borderRadius: '0.875rem',
      border, overflow: 'hidden',
      transition: 'background 0.3s ease, border-color 0.3s ease',
    }}>
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ background: m?.mainCardBg || '#FFFFFF' }}>
              <th style={{ ...thStyle, width: 48, paddingRight: 0 }}></th>
              <th style={thStyle}>Propiedad</th>
              <th style={thStyle}>Depto.</th>
              <th style={{ ...thStyle, textAlign: 'right' }}>Precio</th>
              <th style={thStyle}>Pago</th>
              <th style={thStyle}>Estado</th>
              <th style={{ ...thStyle, textAlign: 'right', width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {properties.map((r, idx) => {
              const thumb = r.images?.[0]?.url;
              const sc = statusColors[r.status] || statusColors.borrador;
              const isLast = idx === properties.length - 1;
              return (
                <tr key={r.id}
                  onClick={() => onEdit?.(r)}
                  style={{ cursor: 'pointer', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = m?.mainSurface === m?.mainCardBg ? (m?.mainBorder ? 'rgba(212,178,84,0.04)' : '#F9F6EE') : 'rgba(212,178,84,0.04)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Thumbnail */}
                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, paddingRight: 0, width: 48, verticalAlign: 'middle' }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: '0.375rem', overflow: 'hidden',
                      background: m?.mainBorder || '#E6E0D2', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {thumb ? (
                        <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1rem' }}>🏗️</span>
                      )}
                    </div>
                  </td>

                  {/* Title */}
                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, fontWeight: 600, maxWidth: 220 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1, minWidth: 0 }}>
                        {r.title}
                      </div>
                      <a
                        href={`/propiedad/${r.id}`}
                        target="_blank"
                        rel="noopener"
                        onClick={e => e.stopPropagation()}
                        title="Ver en web"
                        style={{
                          color: m?.mainTextDim || '#9A9383', flexShrink: 0,
                          display: 'flex', alignItems: 'center',
                          opacity: 0.5, transition: 'opacity 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </a>
                    </div>
                    {r.municipio && (
                      <div style={{ fontSize: '0.6875rem', color: m?.mainTextDim || '#9A9383', marginTop: '2px' }}>
                        {r.municipio}
                      </div>
                    )}
                  </td>

                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, color: m?.mainTextMuted || '#5A5A63' }}>
                    {r.dep_code}
                  </td>

                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, textAlign: 'right', fontWeight: 600, fontFeatureSettings: "'tnum' 1", whiteSpace: 'nowrap' }}>
                    {formatPrice(r.price, r.currency)}
                  </td>

                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, color: m?.mainTextMuted || '#5A5A63' }}>
                    {r.financing ? 'Financiado' : 'Contado'}
                  </td>

                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      padding: '3px 10px', borderRadius: '999px',
                      fontSize: '0.6875rem', fontWeight: 600,
                      background: sc.bg, color: sc.text,
                    }}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </td>

                  <td style={{ ...tdStyle, borderBottom: isLast ? 'none' : border, textAlign: 'right' }}
                    onClick={e => e.stopPropagation()}>
                    <ActionMenu property={r} onEdit={onEdit} m={m} />
                  </td>
                </tr>
              );
            })}

            {properties.length === 0 && (
              <tr>
                <td colSpan={7} style={{
                  padding: '3rem', textAlign: 'center',
                  color: m?.mainTextDim || '#9A9383', fontSize: '0.875rem',
                }}>Sin propiedades</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
