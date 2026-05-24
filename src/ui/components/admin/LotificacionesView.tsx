import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ConfirmModal } from './ConfirmModal';
import { Button, Eyebrow } from '../shared/Button';
import { SidebarMobileToggle } from './AdminSidebar';
import { useProperties } from '../../hooks/useProperties';
import { useLotes, useCreateLote, useUpdateLote, useDeleteLote, useAddPago, useDeletePago } from '../../hooks/useLotes';
import { formatPrice, type Property, type Lote, type Pago } from '../../../core/domain/entities/types';

/* ── Theme type ────────────────────────────────────────── */
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

/* ── Payment Modal ─────────────────────────────────────── */
function PagoModal({ lote, lotificationId, onClose, m }: {
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 120px 80px 28px', gap: '0.5rem', padding: '0.5rem 0.75rem', fontSize: '0.625rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4B254', borderBottom: `1px solid ${b}` }}>
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
              <Button variant="ghost" size="md" onClick={handlePrint}>🖨 Imprimir estado</Button>
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

/* ── Lote Card ─────────────────────────────────────────── */
function LoteCard({ lote, lotificationId, onEdit, m }: {
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

/* ── Lote Form Modal ───────────────────────────────────── */
function LoteModal({ lotificationId, lote, onClose, m }: {
  lotificationId: string; lote?: Lote | null; onClose: () => void; m: M;
}) {
  const createLote = useCreateLote(lotificationId);
  const updateLote = useUpdateLote(lotificationId);
  const deleteLote = useDeleteLote(lotificationId);

  const [form, setForm] = useState({
    numero: lote?.numero ? String(lote.numero) : '',
    nombre: lote?.nombre || '',
    area_varas: lote?.area_varas || '',
    precio_contado: lote?.precio_contado ? String(lote.precio_contado) : '',
    precio_financiado: lote?.precio_financiado ? String(lote.precio_financiado) : '',
    prima_es_fija: lote?.prima_es_fija ?? false,
    prima_monto: lote?.prima_monto ? String(lote.prima_monto) : '',
    plazo_meses: lote?.plazo_meses ? String(Math.round(lote.plazo_meses / 12)) : '10',
    status: lote?.status || 'disponible',
    buyer_name: lote?.buyer_name || '',
    buyer_phone: lote?.buyer_phone || '',
    notes: lote?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const b = m.mainBorder;
  const inp: CSSProperties = {
    width: '100%', padding: '8px 12px', border: `1px solid ${b}`, borderRadius: '6px',
    fontSize: '13px', color: m.mainText, background: m.mainSurface,
    boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
  };
  const lbl: CSSProperties = { fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: m.mainTextDim, marginBottom: '4px', display: 'block' };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data = {
        numero: Number(form.numero) || 0,
        nombre: form.nombre || null,
        area_varas: form.area_varas || null,
        precio_contado: Number(form.precio_contado) || null,
        precio_financiado: Number(form.precio_financiado) || null,
        prima_es_fija: form.prima_es_fija,
        prima_monto: Number(form.prima_monto) || null,
        plazo_meses: Number(form.plazo_meses) * 12 || null,
        status: form.status,
        buyer_name: form.buyer_name || null,
        buyer_phone: form.buyer_phone || null,
        notes: form.notes || null,
      };
      if (lote) await updateLote.mutateAsync({ id: lote.id, data });
      else await createLote.mutateAsync(data as any);
      onClose();
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!lote) return;
    await deleteLote.mutateAsync(lote.id);
    onClose();
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: m.mainBg, borderRadius: '1rem', padding: '2rem', width: '100%', maxWidth: '540px',
        border: `1px solid ${b}`, maxHeight: '90vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column', gap: '1rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: m.mainText }}>{lote ? `Editar Lote ${lote.numero}` : 'Nuevo Lote'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.mainTextMuted, fontSize: '20px' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '10px' }}>
          <div><span style={lbl}>Número</span><input style={inp} type="number" value={form.numero} onChange={e => setForm(f => ({ ...f, numero: e.target.value }))} /></div>
          <div><span style={lbl}>Nombre (opcional)</span><input style={inp} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} placeholder="Ej: Lote A frente" /></div>
        </div>
        <div><span style={lbl}>Área (varas²)</span><input style={inp} value={form.area_varas} onChange={e => setForm(f => ({ ...f, area_varas: e.target.value }))} placeholder="Ej: 200" /></div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><span style={lbl}>Precio contado (L)</span><input style={inp} value={form.precio_contado} onChange={e => setForm(f => ({ ...f, precio_contado: e.target.value }))} /></div>
          <div><span style={lbl}>Precio financiado (L)</span><input style={inp} value={form.precio_financiado} onChange={e => setForm(f => ({ ...f, precio_financiado: e.target.value }))} /></div>
        </div>

        <div>
          <span style={lbl}>Prima</span>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
            {[{ v: false, label: '% Porcentaje' }, { v: true, label: 'L Monto fijo' }].map(({ v, label }) => (
              <button key={String(v)} onClick={() => setForm(f => ({ ...f, prima_es_fija: v }))} style={{
                padding: '4px 12px', borderRadius: '999px', fontSize: '11px', fontWeight: 600,
                border: `1px solid ${form.prima_es_fija === v ? '#D4B254' : b}`,
                background: form.prima_es_fija === v ? 'rgba(212,178,84,0.1)' : m.mainSurface,
                color: form.prima_es_fija === v ? '#D4B254' : m.mainTextMuted,
                cursor: 'pointer', fontFamily: 'inherit',
              }}>{label}</button>
            ))}
          </div>
          <input style={inp} value={form.prima_monto} onChange={e => setForm(f => ({ ...f, prima_monto: e.target.value }))}
            placeholder={form.prima_es_fija ? 'Ej: 50000' : 'Ej: 20'} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div>
            <span style={lbl}>Plazo (años)</span>
            <select style={inp} value={form.plazo_meses} onChange={e => setForm(f => ({ ...f, plazo_meses: e.target.value }))}>
              {[5,8,10,12,15,20,25,30].map(y => <option key={y} value={String(y)}>{y} años</option>)}
            </select>
          </div>
          <div>
            <span style={lbl}>Estado</span>
            <select style={inp} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Lote['status'] }))}>
              <option value="disponible">Disponible</option>
              <option value="apartado">Apartado</option>
              <option value="vendido">Vendido</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div><span style={lbl}>Nombre comprador</span><input style={inp} value={form.buyer_name} onChange={e => setForm(f => ({ ...f, buyer_name: e.target.value }))} /></div>
          <div><span style={lbl}>Teléfono</span><input style={inp} value={form.buyer_phone} onChange={e => setForm(f => ({ ...f, buyer_phone: e.target.value }))} /></div>
        </div>

        <div><span style={lbl}>Notas</span><textarea style={{ ...inp, resize: 'vertical' } as CSSProperties} rows={2} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} /></div>

        <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
          <Button variant="primary" size="md" onClick={handleSave}>{saving ? 'Guardando…' : (lote ? 'Guardar cambios' : 'Crear lote')}</Button>
          <Button variant="ghost" size="md" onClick={onClose}>Cancelar</Button>
          {lote && <button onClick={() => setConfirmDelete(true)} style={{ marginLeft: 'auto', padding: '8px 14px', background: 'none', border: `1px solid rgba(140,58,46,0.3)`, color: '#8C3A2E', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}>Eliminar lote</button>}
        </div>
      </div>

      {confirmDelete && lote && (
        <ConfirmModal
          title={`¿Eliminar Lote ${lote.numero}?`}
          message="Se eliminarán todos los pagos asociados. Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
          m={m}
        />
      )}
    </div>
  );
}

/* ── Lotification Detail ───────────────────────────────── */
function LotificationDetail({ lotification, m, onBack, onEditLotification }: {
  lotification: Property; m: M; onBack: () => void; onEditLotification: (p: Property) => void;
}) {
  const { data: lotes = [], isLoading } = useLotes(lotification.id);
  const [loteModal, setLoteModal] = useState<Lote | null | 'new'>(null);

  const disponibles = lotes.filter(l => l.status === 'disponible').length;
  const vendidos = lotes.filter(l => l.status === 'vendido').length;
  const apartados = lotes.filter(l => l.status === 'apartado').length;

  return (
    <div>
      {/* Topbar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        padding: '2rem 2.5rem 1.5rem', borderBottom: `1px solid ${m.mainBorder}`,
        background: m.mainTopbarBg,
      }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: m.mainTextMuted, fontSize: '13px', fontWeight: 500, padding: 0, marginBottom: '0.5rem', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: '4px' }}>
            ← Lotificaciones
          </button>
          <Eyebrow>Lotificación</Eyebrow>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '0.375rem', letterSpacing: '-0.025em', color: m.mainText, lineHeight: 1.1 }}>{lotification.title}</h1>
          <div style={{ fontSize: '0.8125rem', color: m.mainTextDim, marginTop: '4px' }}>{lotification.municipio}, {lotification.departamento}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="ghost" size="md" onClick={() => onEditLotification(lotification)}>Editar info</Button>
          <Button variant="primary" size="md" onClick={() => setLoteModal('new')}>+ Agregar lote</Button>
        </div>
      </div>

      <div style={{ padding: '1.75rem 2.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
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

      {(loteModal === 'new' || (loteModal && loteModal !== 'new')) && (
        <LoteModal
          lotificationId={lotification.id}
          lote={loteModal === 'new' ? null : loteModal as Lote}
          onClose={() => setLoteModal(null)}
          m={m}
        />
      )}
    </div>
  );
}

/* ── Main Lotificaciones View ──────────────────────────── */
export function LotificacionesView({ onNew, onEdit, onToggleSidebar, m, hideTopbar }: {
  onNew: () => void; onEdit: (p: any) => void; onToggleSidebar: () => void;
  m: M; hideTopbar?: boolean;
}) {
  const { data: allData } = useProperties({ limit: 100 });
  const [selected, setSelected] = useState<Property | null>(null);
  const lotificaciones = (allData?.data || []).filter((p: any) => p.property_type === 'lotificadora');

  const statusColors2: Record<string, { bg: string; text: string }> = {
    disponible: { bg: 'rgba(74,124,89,0.12)', text: '#4A7C59' },
    apartado:   { bg: 'rgba(184,134,46,0.12)', text: '#B8862E' },
    vendido:    { bg: 'rgba(140,58,46,0.12)',  text: '#8C3A2E' },
  };

  if (selected) {
    return (
      <LotificationDetail
        lotification={selected}
        m={m}
        onBack={() => setSelected(null)}
        onEditLotification={p => { onEdit(p); setSelected(null); }}
      />
    );
  }

  return (
    <div>
      {!hideTopbar && (
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
          padding: '2rem 2.5rem 1.5rem', borderBottom: `1px solid ${m.mainBorder}`,
          background: m.mainTopbarBg,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SidebarMobileToggle isOpen={false} toggle={onToggleSidebar} isDark={m.mainBg === '#111113'} />
            <div>
              <Eyebrow>Catálogo</Eyebrow>
              <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 700, marginTop: '0.375rem', letterSpacing: '-0.025em', color: m.mainText, lineHeight: 1.1 }}>Lotificaciones</h1>
            </div>
          </div>
          <Button variant="primary" size="md" onClick={onNew}>+ Nueva lotificación</Button>
        </div>
      )}

      <div style={{ padding: '1.75rem 2.5rem' }}>
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
                      <button onClick={e => { e.stopPropagation(); onEdit(lot); }} style={{
                        padding: '5px 12px', borderRadius: '0.375rem', fontSize: '11px', fontWeight: 600,
                        background: m.mainSurface, border: `1px solid ${m.mainBorder}`,
                        color: m.mainTextMuted, cursor: 'pointer', fontFamily: 'inherit',
                      }}>Editar</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
