import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Button, Eyebrow } from '../shared/Button';
import { SidebarMobileToggle } from './AdminSidebar';
import { useProperties, useDeleteProperty } from '../../hooks/useProperties';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { LotificationDetail } from './lotificaciones/LotificationDetail';

/* ── Theme type ────────────────────────────────────────── */
interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

const statusColors2: Record<string, { bg: string; text: string }> = {
  disponible: { bg: 'rgba(74,124,89,0.12)', text: '#4A7C59' },
  apartado:   { bg: 'rgba(184,134,46,0.12)', text: '#B8862E' },
  vendido:    { bg: 'rgba(140,58,46,0.12)',  text: '#8C3A2E' },
  borrador:   { bg: 'rgba(90,90,99,0.12)',   text: '#5A5A63' },
};

const statusLabels: Record<string, string> = {
  disponible: 'Disponible',
  apartado: 'Apartado',
  vendido: 'Vendido',
  borrador: 'Borrador',
};

/* ── Main Lotificaciones View ──────────────────────────── */
export function LotificacionesView({ onNew, onEdit, onToggleSidebar, isOpen = false, m, hideTopbar }: {
  onNew: () => void; onEdit: (p: any) => void; onToggleSidebar: () => void;
  isOpen?: boolean;
  m: M; hideTopbar?: boolean;
}) {
  const { data: allData } = useProperties({ limit: 100 });
  const [selected, setSelected] = useState<Property | null>(null);
  const [confirmDeleteLot, setConfirmDeleteLot] = useState<Property | null>(null);
  const deleteProperty = useDeleteProperty();

  const lotificaciones = (allData?.data || []).filter((p: any) => p.property_type === 'lotificadora');

  const handleDeleteLot = async () => {
    if (!confirmDeleteLot) return;
    await deleteProperty.mutateAsync(confirmDeleteLot.id);
    setConfirmDeleteLot(null);
  };

  if (selected) {
    return (
      <LotificationDetail
        lotification={selected}
        m={m}
        onBack={() => setSelected(null)}
        onEditLotification={p => { onEdit(p); setSelected(null); }}
        onToggleSidebar={onToggleSidebar}
        isOpen={isOpen}
      />
    );
  }

  return (
    <div>
      {!hideTopbar && (
        <div className="admin-topbar" style={{
          borderBottom: `1px solid ${m.mainBorder}`,
          background: m.mainTopbarBg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SidebarMobileToggle isOpen={isOpen} toggle={onToggleSidebar} isDark={m.mainBg === '#111113'} />
            <div>
              <Eyebrow>Catálogo</Eyebrow>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '0.375rem', letterSpacing: '-0.025em', color: m.mainText, lineHeight: 1.1 }}>Lotificaciones</h1>
            </div>
          </div>
          <Button variant="primary" size="md" onClick={onNew}>+ Nueva lotificación</Button>
        </div>
      )}

      <div className="admin-content-area">
        {lotificaciones.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: m.mainTextDim, fontSize: '0.875rem' }}>
            Sin lotificaciones registradas.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
            {lotificaciones.map((lot: any) => {
              const thumb = lot.images?.[0]?.url;
              const sc = statusColors2[lot.status] || statusColors2.disponible;
              const availPct = lot.total_lots ? Math.round((lot.available_lots / lot.total_lots) * 100) : 0;

              return (
                <div key={lot.id}
                  onClick={() => setSelected(lot)}
                  style={{
                    background: m.mainCardBg, border: `1px solid ${m.mainBorder}`, borderRadius: '1rem',
                    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#D4B254')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = m.mainBorder)}
                >
                  {/* Thumbnail */}
                  <div style={{ height: '160px', background: m.mainBorder, position: 'relative', overflow: 'hidden' }}>
                    {thumb ? (
                      <img src={thumb} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '3rem' }}>🏗️</div>
                    )}
                    <span style={{ position: 'absolute', top: '10px', right: '10px', padding: '3px 10px', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 600, background: sc.bg, color: sc.text, backdropFilter: 'blur(4px)' }}>
                      {statusLabels[lot.status] || lot.status}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: m.mainText, marginBottom: '4px' }}>{lot.title}</div>
                    <div style={{ fontSize: '0.75rem', color: m.mainTextDim, marginBottom: '0.875rem' }}>📍 {lot.municipio}, {lot.departamento}</div>

                    {/* Lot progress */}
                    {lot.total_lots > 0 && (
                      <div style={{ marginBottom: '0.875rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.6875rem', color: m.mainTextMuted }}>Lotes disponibles</span>
                          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#4A7C59' }}>{lot.available_lots} / {lot.total_lots}</span>
                        </div>
                        <div style={{ height: '4px', background: m.mainBorder, borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${availPct}%`, background: '#4A7C59', borderRadius: '999px' }} />
                        </div>
                      </div>
                    )}

                    {/* Price */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: m.mainText }}>
                        {formatPrice(lot.price, lot.currency || 'L')}
                      </div>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={e => { e.stopPropagation(); onEdit(lot); }} style={{
                          padding: '5px 12px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                          background: m.mainSurface, border: `1px solid ${m.mainBorder}`,
                          color: m.mainTextMuted, cursor: 'pointer', fontFamily: 'inherit',
                        }}>Editar</button>
                        <button onClick={e => { e.stopPropagation(); setConfirmDeleteLot(lot); }} style={{
                          padding: '5px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                          background: 'none', border: `1px solid rgba(140,58,46,0.2)`,
                          color: '#8C3A2E', cursor: 'pointer', fontFamily: 'inherit',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }} title="Eliminar lotificación">
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
        )}
      </div>
      {confirmDeleteLot && (
        <ConfirmModal
          title={`¿Eliminar lotificación "${confirmDeleteLot.title}"?`}
          message="Se eliminarán todos los lotes y los pagos asociados a esta lotificación. Esta acción no se puede deshacer."
          onConfirm={handleDeleteLot}
          onCancel={() => setConfirmDeleteLot(null)}
          m={m}
        />
      )}
    </div>
  );
}
