import { IconCheck, IconAlert, IconFacebook } from '../../../shared/rs-icons';
import { AdvancedPanel } from '../AdvancedPanel';
import { useAdminTheme } from '../theme';
import type { ImageItem, PropertyForm, PropertyKind } from '../types';

interface Props {
  form: PropertyForm;
  set: <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) => void;
  kind: PropertyKind;
  images: ImageItem[];
  propertyId?: string;
  onGoToStep: (index: number) => void;
}

const ETIQUETA_TIPO: Record<PropertyKind, string> = {
  casa: 'Casa', terreno: 'Terreno', lotificacion: 'Lotificación',
};

export function StepReview({ form, set, kind, images, propertyId, onGoToStep }: Props) {
  const t = useAdminTheme();

  // "Qué falta" en lugar de dejar que el guardado falle con un error suelto
  const faltantes = [
    !form.title.trim() && { texto: 'Falta el titular', paso: 1 },
    !form.price && { texto: 'Falta el precio', paso: 1 },
    !form.municipio && { texto: 'Falta el municipio', paso: 2 },
    form.lat == null && { texto: 'Falta marcar el punto en el mapa — sin esto no sale en el buscador', paso: 2 },
    images.length === 0 && { texto: 'No hay ni una foto', paso: 3 },
  ].filter(Boolean) as { texto: string; paso: number }[];

  const publicaAhora = form.status === 'disponible';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 620 }}>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>Revisá antes de publicar</h3>
      </div>

      {faltantes.length > 0 ? (
        <div style={{
          border: `1.5px solid ${t.danger}`, borderRadius: 12, padding: 16,
          background: t.isDark ? 'rgba(140,58,46,0.12)' : '#FCF3F1',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.danger, fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
            <IconAlert size={16} /> Falta esto
          </div>
          <ul style={{ margin: 0, paddingLeft: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {faltantes.map(f => (
              <li key={f.texto}>
                <button type="button" onClick={() => onGoToStep(f.paso)} className="admin-link-btn">
                  {f.texto}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 7, color: t.ok, fontWeight: 700, fontSize: 14 }}>
          <IconCheck size={17} /> Todo listo
        </div>
      )}

      <dl className="review-summary">
        <div><dt>Tipo</dt><dd>{ETIQUETA_TIPO[kind]}</dd></div>
        <div><dt>Titular</dt><dd>{form.title || '—'}</dd></div>
        <div><dt>Precio</dt><dd>{form.price ? `L ${Number(form.price).toLocaleString('es-HN')}` : '—'}</dd></div>
        <div><dt>Dónde</dt><dd>{[form.municipio, form.departamento].filter(Boolean).join(', ') || '—'}</dd></div>
        <div><dt>Fotos</dt><dd>{images.length}</dd></div>
        {kind === 'casa' && (
          <div><dt>Distribución</dt><dd>
            {[form.bedrooms && `${form.bedrooms} hab`, form.bathrooms && `${form.bathrooms} baños`, form.parking && `${form.parking} parqueos`]
              .filter(Boolean).join(' · ') || '—'}
          </dd></div>
        )}
      </dl>

      {/* Publicar en Facebook era el label de una opción dentro de un desplegable
          de estado. Acá es una decisión visible y explicada. */}
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend style={{ fontSize: 13.5, fontWeight: 600, color: t.text, marginBottom: 8, padding: 0 }}>
          ¿Qué hacemos al guardar?
        </legend>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { v: 'disponible', label: 'Publicarla ya', hint: 'Sale en el sitio y se postea en Facebook.' },
            { v: 'borrador', label: 'Guardarla como borrador', hint: 'Solo la ves vos. No se publica en ningún lado.' },
            { v: 'apartado', label: 'Marcarla como apartada', hint: 'Visible, pero sin recibir consultas nuevas.' },
            { v: 'vendido', label: 'Marcarla como vendida', hint: 'Se postea el aviso de vendida en Facebook.' },
          ].map(({ v, label, hint }) => {
            const on = form.status === v;
            return (
              <label key={v} className="radio-card" style={{
                borderColor: on ? t.accent : t.border,
                background: on ? (t.isDark ? 'rgba(127,181,150,0.10)' : '#EEF5F0') : t.surface,
              }}>
                <input type="radio" name="estado" value={v} checked={on}
                  onChange={() => set('status', v)} />
                <span>
                  <span style={{ display: 'block', fontSize: 14, fontWeight: 700, color: on ? t.accent : t.text }}>{label}</span>
                  <span style={{ display: 'block', fontSize: 12.5, color: t.textDim, marginTop: 2 }}>{hint}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {publicaAhora && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '11px 13px', borderRadius: 10,
          background: t.isDark ? 'rgba(66,103,178,0.12)' : 'rgba(66,103,178,0.07)',
          border: `1px solid ${t.isDark ? 'rgba(66,103,178,0.28)' : 'rgba(66,103,178,0.18)'}`,
          color: t.isDark ? '#8BA8E8' : '#3B5998', fontSize: 13, fontWeight: 600,
        }}>
          <IconFacebook size={15} />
          Se va a postear en la página de Facebook al guardar.
        </div>
      )}

      <AdvancedPanel form={form} set={set} kind={kind} propertyId={propertyId} />
    </div>
  );
}
