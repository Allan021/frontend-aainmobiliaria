import { useState } from 'react';
import { useLotes } from '../../../hooks/useLotes';
import { useDeleteProperty } from '../../../hooks/useProperties';
import { type Property, type Lote } from '../../../../core/domain/entities/types';
import { LoteCard } from './LoteCard';
import { LoteModal } from './LoteModal';
import { ConfirmModal } from '../ConfirmModal';
import { Button, Eyebrow } from '../../shared/Button';
import { SidebarMobileToggle } from '../AdminSidebar';

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

export function LotificationDetail({ lotification, m, onBack, onEditLotification, onToggleSidebar, isOpen = false }: {
  lotification: Property; m: M; onBack: () => void; onEditLotification: (p: Property) => void;
  onToggleSidebar?: () => void; isOpen?: boolean;
}) {
  const { data: lotes = [], isLoading } = useLotes(lotification.id);
  const [loteModal, setLoteModal] = useState<Lote | null | 'new'>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const deleteProperty = useDeleteProperty();

  const disponibles = lotes.filter(l => l.status === 'disponible').length;
  const vendidos = lotes.filter(l => l.status === 'vendido').length;
  const apartados = lotes.filter(l => l.status === 'apartado').length;

  const handleDelete = async () => {
    await deleteProperty.mutateAsync(lotification.id);
    onBack();
  };

  return (
    <div>
      {/* Topbar */}
      <div className="admin-topbar" style={{
        borderBottom: `1px solid ${m.mainBorder}`,
        background: m.mainTopbarBg,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {onToggleSidebar && (
            <SidebarMobileToggle isOpen={isOpen} toggle={onToggleSidebar} isDark={m.mainBg === '#111113'} />
          )}
          <div>
            <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.mainTextMuted, fontSize: '13px', fontWeight: 500, padding: 0, marginBottom: '0.5rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
              ← Lotificaciones
            </button>
            <Eyebrow>Lotificación</Eyebrow>
            <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '0.375rem', letterSpacing: '-0.025em', color: m.mainText, lineHeight: 1.1 }}>{lotification.title}</h1>
            <div style={{ fontSize: '0.8125rem', color: m.mainTextDim, marginTop: '4px' }}>{lotification.municipio}, {lotification.departamento}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => setConfirmDelete(true)} style={{
            padding: '8px 14px', background: 'none', border: `1px solid rgba(140,58,46,0.3)`,
            color: '#8C3A2E', borderRadius: '6px', cursor: 'pointer', fontSize: '13px',
            fontWeight: 600, fontFamily: 'inherit', transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(140,58,46,0.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
          >
            Eliminar
          </button>
          <Button variant="ghost" size="md" onClick={() => onEditLotification(lotification)}>Editar info</Button>
          <Button variant="primary" size="md" onClick={() => setLoteModal('new')}>+ Agregar lote</Button>
        </div>
      </div>

      <div className="admin-content-area">
        {/* Stats */}
        <div className="admin-metrics-grid">
          {[
            { label: 'Total lotes', value: lotes.length, color: m.mainText },
            { label: 'Disponibles', value: disponibles, color: '#4A7C59' },
            { label: 'Apartados', value: apartados, color: '#B8862E' },
            { label: 'Vendidos', value: vendidos, color: '#8C3A2E' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ padding: '1.25rem', background: m.mainCardBg, borderRadius: '0.875rem', border: `1px solid ${m.mainBorder}` }}>
              <div style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#D4B254', marginBottom: '0.5rem' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Lotes grid */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: m.mainTextDim }}>Cargando lotes…</div>
        ) : lotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: m.mainTextDim, fontSize: '0.875rem' }}>
            Sin lotes registrados. Agrega el primer lote.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {lotes.map(lote => (
              <LoteCard key={lote.id} lote={lote} lotificationId={lotification.id} onEdit={l => setLoteModal(l)} m={m} />
            ))}
          </div>
        )}
      </div>

      {loteModal !== null && (
        <LoteModal
          lotificationId={lotification.id}
          lote={loteModal === 'new' ? null : loteModal}
          onClose={() => setLoteModal(null)}
          m={m}
        />
      )}

      {confirmDelete && (
        <ConfirmModal
          title={`¿Eliminar lotificación "${lotification.title}"?`}
          message="Se eliminarán todos los lotes y los pagos asociados a esta lotificación. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          m={m}
        />
      )}
    </div>
  );
}
