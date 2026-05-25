import { useState } from 'react';
import { useUpdateLote } from '../../../hooks/useLotes';
import { formatPrice, type Lote } from '../../../../core/domain/entities/types';
import { PagoModal } from './PagoModal';

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  disponible: { bg: 'rgba(74,124,89,0.12)', text: '#4A7C59' },
  apartado:   { bg: 'rgba(184,134,46,0.12)', text: '#B8862E' },
  vendido:    { bg: 'rgba(140,58,46,0.12)',  text: '#8C3A2E' },
};
const statusLabels = { disponible: 'Disponible', apartado: 'Apartado', vendido: 'Vendido' };

export function LoteCard({ lote, lotificationId, onEdit, m }: {
  lote: Lote; lotificationId: string; onEdit: (l: Lote) => void; m: M;
}) {
  const [showPagos, setShowPagos] = useState(false);
  const updateLote = useUpdateLote(lotificationId);
  const sc = statusColors[lote.status] || statusColors.disponible;
  const pagos = lote.pagos || [];
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const precioTotal = lote.precio_financiado || lote.precio_contado || 0;

  const setStatus = async (status: Lote['status']) => {
    await updateLote.mutateAsync({ id: lote.id, data: { status } });
  };

  return (
    <>
      <div style={{
        background: m.mainCardBg, border: `1px solid ${m.mainBorder}`,
        borderRadius: '0.75rem', padding: '1rem',
        transition: 'background 0.3s ease, border-color 0.3s ease',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D4B254' }}>
              Lote {lote.numero}
            </div>
            {lote.nombre && <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: m.mainText, marginTop: '2px' }}>{lote.nombre}</div>}
            {lote.area_varas && <div style={{ fontSize: '0.6875rem', color: m.mainTextDim, marginTop: '2px' }}>📐 {lote.area_varas} varas²</div>}
          </div>
          <span style={{ padding: '3px 10px', borderRadius: '999px', fontSize: '0.6875rem', fontWeight: 600, background: sc.bg, color: sc.text }}>
            {statusLabels[lote.status]}
          </span>
        </div>

        {/* Prices */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginBottom: '0.75rem' }}>
          {lote.precio_contado && (
            <div style={{ fontSize: '0.75rem', color: m.mainTextMuted }}>
              Contado: <span style={{ fontWeight: 700, color: m.mainText }}>L {lote.precio_contado.toLocaleString('en-US')}</span>
            </div>
          )}
          {lote.precio_financiado && (
            <div style={{ fontSize: '0.75rem', color: m.mainTextMuted }}>
              Financiado: <span style={{ fontWeight: 700, color: '#B8862E' }}>L {lote.precio_financiado.toLocaleString('en-US')}</span>
              {lote.plazo_meses && <span style={{ fontSize: '0.625rem', color: m.mainTextDim }}> · {lote.plazo_meses / 12} años</span>}
            </div>
          )}
          {lote.prima_monto && (
            <div style={{ fontSize: '0.75rem', color: m.mainTextDim }}>
              Prima: {lote.prima_es_fija ? `L ${lote.prima_monto.toLocaleString('en-US')}` : `${lote.prima_monto}%`}
            </div>
          )}
        </div>

        {/* Buyer */}
        {lote.buyer_name && (
          <div style={{ fontSize: '0.75rem', color: m.mainTextMuted, marginBottom: '0.75rem', padding: '6px 8px', background: 'rgba(74,124,89,0.08)', borderRadius: '6px' }}>
            👤 {lote.buyer_name}
            {lote.buyer_phone && <span style={{ color: m.mainTextDim }}> · {lote.buyer_phone}</span>}
          </div>
        )}

        {/* Payment progress */}
        {precioTotal > 0 && pagos.length > 0 && (
          <div style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.625rem', color: m.mainTextDim }}>Pagado</span>
              <span style={{ fontSize: '0.625rem', fontWeight: 700, color: '#4A7C59' }}>L {totalPagado.toLocaleString('en-US')}</span>
            </div>
            <div style={{ height: '3px', background: m.mainBorder, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (totalPagado / precioTotal) * 100)}%`, background: '#4A7C59', borderRadius: '999px' }} />
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={() => setShowPagos(true)} style={{
            flex: 1, padding: '6px 10px', borderRadius: '0.375rem',
            background: 'rgba(212,178,84,0.08)', border: '1px solid rgba(212,178,84,0.2)',
            color: '#D4B254', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>
            💰 Pagos {pagos.length > 0 ? `(${pagos.length})` : ''}
          </button>
          <button onClick={() => onEdit(lote)} style={{
            padding: '6px 10px', borderRadius: '0.375rem',
            background: m.mainSurface, border: `1px solid ${m.mainBorder}`,
            color: m.mainTextMuted, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
          }}>Editar</button>
          {lote.status === 'disponible' && (
            <button onClick={() => setStatus('vendido')} style={{
              padding: '6px 10px', borderRadius: '0.375rem',
              background: 'rgba(140,58,46,0.08)', border: '1px solid rgba(140,58,46,0.2)',
              color: '#8C3A2E', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Vender</button>
          )}
          {lote.status === 'vendido' && (
            <button onClick={() => setStatus('disponible')} style={{
              padding: '6px 10px', borderRadius: '0.375rem',
              background: 'rgba(74,124,89,0.08)', border: '1px solid rgba(74,124,89,0.2)',
              color: '#4A7C59', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
            }}>Disponible</button>
          )}
        </div>
      </div>

      {showPagos && (
        <PagoModal lote={lote} lotificationId={lotificationId} onClose={() => setShowPagos(false)} m={m} />
      )}
    </>
  );
}
