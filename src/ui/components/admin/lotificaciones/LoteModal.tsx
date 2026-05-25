import { useState } from 'react';
import type { CSSProperties } from 'react';
import { ConfirmModal } from '../ConfirmModal';
import { Button } from '../../shared/Button';
import { useCreateLote, useUpdateLote, useDeleteLote } from '../../../hooks/useLotes';
import { type Lote } from '../../../../core/domain/entities/types';

interface M {
  mainBg: string; mainSurface: string; mainBorder: string;
  mainText: string; mainTextMuted: string; mainTextDim: string;
  mainCardBg: string; mainTopbarBg: string;
}

export function LoteModal({ lotificationId, lote, onClose, m }: {
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
        status: form.status as Lote['status'],
        buyer_name: form.buyer_name || null,
        buyer_phone: form.buyer_phone || null,
        notes: form.notes || null,
      };
      if (lote) await updateLote.mutateAsync({ id: lote.id, data });
      else await createLote.mutateAsync(data);
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
