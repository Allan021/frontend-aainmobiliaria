import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ConfirmModal } from '../ConfirmModal';
import { Button, Eyebrow } from '../../shared/Button';
import { useAddPago, useDeletePago } from '../../../hooks/useLotes';
import { type Lote, type Pago } from '../../../../core/domain/entities/types';

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

export function PagoModal({ lote, lotificationId, onClose, m }: {
  lote: Lote; lotificationId: string; onClose: () => void; m: M;
}) {
  const [form, setForm] = useState({ monto: '', concepto: 'Abono mensual', metodo_pago: 'efectivo', notas: '', fecha: new Date().toISOString().slice(0, 10) });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmPago, setConfirmPago] = useState<Pago | null>(null);
  const addPago = useAddPago(lotificationId);
  const deletePago = useDeletePago(lotificationId);

  const pagos = lote.pagos || [];
  const totalPagado = pagos.reduce((s, p) => s + p.monto, 0);
  const precioTotal = lote.precio_financiado || lote.precio_contado || 0;
  const saldo = precioTotal - totalPagado;

  const handleAdd = async () => {
    if (!form.monto) return;
    setIsSubmitting(true);
    try {
      await addPago.mutateAsync({ loteId: lote.id, data: { ...form, monto: Number(form.monto) } });
      setForm(f => ({ ...f, monto: '', notas: '' }));
    } finally { setIsSubmitting(false); }
  };

  const handleDeletePago = async () => {
    if (!confirmPago) return;
    await deletePago.mutateAsync({ loteId: lote.id, pagoId: confirmPago.id });
    setConfirmPago(null);
  };

  const handlePrint = () => {
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Recibos — Lote ${lote.numero}</title>
    <style>
      body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; max-width: 680px; margin: 0 auto; }
      h1 { font-size: 22px; margin-bottom: 4px; }
      .sub { font-size: 13px; color: #555; margin-bottom: 24px; }
      table { width: 100%; border-collapse: collapse; margin-top: 16px; }
      th { font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #888; padding: 8px; text-align: left; border-bottom: 2px solid #eee; }
      td { padding: 10px 8px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
      .total { font-weight: 700; font-size: 15px; margin-top: 16px; text-align: right; }
      .saldo { color: ${saldo > 0 ? '#B8862E' : '#4A7C59'}; font-weight: 700; }
      @media print { body { padding: 0; } }
    </style></head><body>
    <h1>A&A Inmobiliaria — Estado de Cuenta</h1>
    <div class="sub">Lote ${lote.numero}${lote.nombre ? ` — ${lote.nombre}` : ''} · ${lote.buyer_name || 'Sin comprador'}</div>
    <table>
      <thead><tr><th>Recibo</th><th>Fecha</th><th>Concepto</th><th>Método</th><th style="text-align:right">Monto</th></tr></thead>
      <tbody>
        ${pagos.map(p => `<tr>
          <td>${p.numero_recibo}</td>
          <td>${new Date(p.fecha).toLocaleDateString('es-HN')}</td>
          <td>${p.concepto}</td>
          <td>${p.metodo_pago}</td>
          <td style="text-align:right">L ${p.monto.toLocaleString('en-US')}</td>
        </tr>`).join('')}
      </tbody>
    </table>
    <div class="total">Total pagado: L ${totalPagado.toLocaleString('en-US')}</div>
    ${precioTotal ? `<div class="total saldo">Saldo pendiente: L ${saldo.toLocaleString('en-US')}</div>` : ''}
    <script>window.print();</script>
    </body></html>`);
    win.document.close();
  };

  const b = m.mainBorder;
  const inp: CSSProperties = {
    width: '100%', padding: '8px 12px', border: `1px solid ${b}`, borderRadius: '6px',
    fontSize: '13px', color: m.mainText, background: m.mainSurface,
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: m.mainBg, borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '640px',
        border: `1px solid ${b}`, maxHeight: '90vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '1.25rem',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Eyebrow>Pagos</Eyebrow>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: m.mainText, marginTop: '0.25rem' }}>
              Lote {lote.numero}{lote.nombre ? ` — ${lote.nombre}` : ''}
            </h3>
            {lote.buyer_name && <div style={{ fontSize: '0.8125rem', color: m.mainTextMuted, marginTop: '2px' }}>{lote.buyer_name}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.mainTextMuted, fontSize: '20px', lineHeight: 1 }}>×</button>
        </div>

        {/* Summary */}
        {precioTotal > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            {[
              { label: 'Precio total', value: `L ${precioTotal.toLocaleString('en-US')}`, color: m.mainText },
              { label: 'Pagado', value: `L ${totalPagado.toLocaleString('en-US')}`, color: '#4A7C59' },
              { label: 'Saldo', value: `L ${saldo.toLocaleString('en-US')}`, color: saldo > 0 ? '#B8862E' : '#4A7C59' },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ padding: '0.875rem', background: m.mainCardBg, borderRadius: '0.625rem', border: `1px solid ${b}` }}>
                <div style={{ fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px' }}>{label}</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {precioTotal > 0 && (
          <div>
            <div style={{ height: '6px', background: m.mainBorder, borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (totalPagado / precioTotal) * 100)}%`, background: '#4A7C59', borderRadius: '999px', transition: 'width 0.6s ease' }} />
            </div>
            <div style={{ fontSize: '0.6875rem', color: m.mainTextDim, marginTop: '4px', textAlign: 'right' }}>
              {Math.round((totalPagado / precioTotal) * 100)}% pagado
            </div>
          </div>
        )}

        {/* Pagos list */}
        {pagos.length > 0 && (
          <div style={{ border: `1px solid ${b}`, borderRadius: '0.625rem', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
              <div style={{ minWidth: '460px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 120px 80px 28px', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: m.mainTextDim, borderBottom: `1px solid ${b}` }}>
                  <div>Concepto</div><div>Fecha</div><div>Método</div><div style={{ textAlign: 'right' }}>Monto</div><div></div>
                </div>
                {pagos.map((p, i) => (
                  <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 120px 80px 28px', gap: '0.5rem', padding: '0.625rem 0.75rem', alignItems: 'center', borderBottom: i < pagos.length - 1 ? `1px solid ${b}` : 'none' }}>
                    <div>
                      <div style={{ fontSize: '0.8125rem', color: m.mainText, fontWeight: 500 }}>{p.concepto}</div>
                      <div style={{ fontSize: '0.625rem', color: m.mainTextDim }}>{p.numero_recibo}</div>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: m.mainTextMuted }}>{new Date(p.fecha).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })}</div>
                    <div style={{ fontSize: '0.75rem', color: m.mainTextMuted, textTransform: 'capitalize' }}>{p.metodo_pago}</div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#4A7C59', textAlign: 'right', fontFeatureSettings: "'tnum' 1" }}>L {p.monto.toLocaleString('en-US')}</div>
                    <button onClick={() => setConfirmPago(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#8C3A2E', fontSize: '14px', padding: '2px', lineHeight: 1 }}>×</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Add payment form */}
        <div style={{ padding: '1rem', background: m.mainCardBg, borderRadius: '0.625rem', border: `1px solid ${b}`, display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <Eyebrow>Registrar pago</Eyebrow>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px' }}>Monto (L)</div>
              <input style={inp} value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} placeholder="Ej: 5000" type="number" />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px' }}>Fecha</div>
              <input style={inp} value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} type="date" />
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px' }}>Concepto</div>
              <select style={inp} value={form.concepto} onChange={e => setForm(f => ({ ...f, concepto: e.target.value }))}>
                {['Abono mensual', 'Prima', 'Enganche', 'Pago total', 'Otro'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px' }}>Método</div>
              <select style={inp} value={form.metodo_pago} onChange={e => setForm(f => ({ ...f, metodo_pago: e.target.value }))}>
                {['efectivo', 'transferencia', 'cheque', 'tarjeta'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="primary" size="md" onClick={handleAdd}>
              {isSubmitting ? 'Guardando…' : 'Registrar pago'}
            </Button>
            {pagos.length > 0 && (
              <Button variant="ghost" size="md" onClick={handlePrint}>Imprimir estado</Button>
            )}
          </div>
        </div>
      </div>

      {confirmPago && (
        <ConfirmModal
          title={`¿Eliminar recibo ${confirmPago.numero_recibo}?`}
          message="Este pago será eliminado permanentemente del historial del lote."
          onConfirm={handleDeletePago}
          onCancel={() => setConfirmPago(null)}
          m={m}
        />
      )}
    </div>
  );
}
