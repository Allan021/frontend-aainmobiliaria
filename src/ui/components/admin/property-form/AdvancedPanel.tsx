import { SelectField } from '../../shared/SelectField';
import { TextField } from './fields/TextField';
import { FieldShell } from './fields/FieldShell';
import { ToggleChips } from './fields/ToggleChips';
import { useAdminTheme } from './theme';
import type { PropertyForm, PropertyKind } from './types';

interface Props {
  form: PropertyForm;
  set: <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) => void;
  kind: PropertyKind;
  propertyId?: string;
}

const PAGOS = [
  { key: 'contado' as const, label: 'Al contado' },
  { key: 'financing' as const, label: 'A cuotas' },
];

/**
 * Todo lo que la mayoría no necesita tocar: cuotas, lotificación y los textos
 * de Facebook. Plegado por defecto — antes estaba siempre a la vista y era la
 * mitad del formulario.
 */
export function AdvancedPanel({ form, set, kind, propertyId }: Props) {
  const t = useAdminTheme();
  const enlace = propertyId ? `https://www.aabienes.com/propiedad/${propertyId}` : '';
  const yaTieneEnlace = enlace ? form.facebook_description.includes(`/propiedad/${propertyId}`) : false;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <details className="admin-details">
        <summary>Formas de pago y cuotas</summary>
        <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <ToggleChips
            legend="¿Cómo se puede pagar?"
            options={PAGOS}
            isOn={k => form[k]}
            onToggle={(k, next) => set(k, next)}
          />

          {form.financing && (
            <>
              <TextField
                label="Precio a cuotas"
                hint="Solo si es distinto al precio de contado."
                prefix="L"
                inputMode="numeric"
                placeholder={form.price || 'Mismo que contado'}
                value={form.precio_financiado}
                onChange={v => set('precio_financiado', v.replace(/[^\d.]/g, ''))}
              />

              <FieldShell label="La prima se cobra como">
                <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  {[{ v: false, label: 'Porcentaje del precio' }, { v: true, label: 'Monto fijo' }].map(({ v, label }) => (
                    <button key={String(v)} type="button" onClick={() => set('prima_es_fija', v)}
                      aria-pressed={form.prima_es_fija === v}
                      className="admin-chip"
                      style={{
                        border: `1.5px solid ${form.prima_es_fija === v ? t.accent : t.border}`,
                        background: form.prima_es_fija === v ? (t.isDark ? 'rgba(127,181,150,0.12)' : '#EEF5F0') : 'transparent',
                        color: form.prima_es_fija === v ? t.accent : t.textMuted,
                      }}>{label}</button>
                  ))}
                </div>
                {form.prima_es_fija ? (
                  <input className="admin-input" inputMode="numeric" placeholder="50000"
                    value={form.prima_monto} onChange={e => set('prima_monto', e.target.value.replace(/[^\d.]/g, ''))} />
                ) : (
                  <input className="admin-input" inputMode="numeric" placeholder="20"
                    value={form.financing_prima} onChange={e => set('financing_prima', e.target.value.replace(/[^\d.]/g, ''))} />
                )}
              </FieldShell>

              <div className="field-row-2">
                <FieldShell label="Plazo">
                  <SelectField
                    options={[5, 8, 10, 12, 15, 20, 25, 30].map(y => ({ value: String(y), label: `${y} años` }))}
                    value={form.plazo_anios}
                    onChange={v => set('plazo_anios', v)}
                    theme={t.isDark ? 'dark' : 'light'}
                  />
                </FieldShell>
                <TextField label="Interés anual (%)" inputMode="decimal" placeholder="12"
                  value={form.financing_tasa_anual}
                  onChange={v => set('financing_tasa_anual', v.replace(/[^\d.]/g, ''))} />
              </div>
            </>
          )}
        </div>
      </details>

      {kind === 'lotificacion' && (
        <details className="admin-details">
          <summary>Lotes del proyecto</summary>
          <div style={{ paddingTop: 14 }} className="field-row-2">
            <TextField label="Lotes en total" inputMode="numeric" value={form.total_lots}
              onChange={v => set('total_lots', v.replace(/\D/g, ''))} />
            <TextField label="Lotes disponibles" inputMode="numeric" value={form.available_lots}
              onChange={v => set('available_lots', v.replace(/\D/g, ''))} />
          </div>
        </details>
      )}

      <details className="admin-details">
        <summary>Texto para el post de Facebook</summary>
        <div style={{ paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <TextField
            label="Título del post"
            hint="Si lo dejás vacío usamos el titular de la propiedad."
            value={form.facebook_title}
            onChange={v => set('facebook_title', v)}
          />
          <TextField
            label="Texto del post"
            hint="Si lo dejás vacío usamos la descripción completa."
            multiline
            value={form.facebook_description}
            onChange={v => set('facebook_description', v)}
          />
          {enlace ? (
            <button
              type="button"
              disabled={yaTieneEnlace}
              onClick={() => set('facebook_description', `${form.facebook_description.trimEnd()}\n\nVer propiedad: ${enlace}`)}
              className="admin-btn admin-btn--ghost"
              style={{ alignSelf: 'flex-start' }}
            >
              {yaTieneEnlace ? 'Enlace ya agregado' : 'Agregar el enlace de la propiedad'}
            </button>
          ) : (
            <div style={{ fontSize: 12.5, color: t.textDim, fontStyle: 'italic' }}>
              El enlace se puede agregar después de guardar.
            </div>
          )}
        </div>
      </details>
    </div>
  );
}
