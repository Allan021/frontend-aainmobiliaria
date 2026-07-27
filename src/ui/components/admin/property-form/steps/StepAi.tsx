import { useState } from 'react';
import { IconSparkles, IconSpinner, IconCheck } from '../../../shared/rs-icons';
import { aiAdapter } from '../../../../../infrastructure/api/aiAdapter';
import { useHondurasData } from '../../../../hooks/useHondurasData';
import { useAdminTheme } from '../theme';
import type { PropertyForm, PropertyKind } from '../types';

interface Props {
  onApply: (values: Partial<PropertyForm>, kind?: PropertyKind) => void;
  onSkip: () => void;
}

const EJEMPLO = 'casa de esquina en la 19 de Junio, El Progreso, 3 cuartos, 2 baños, agua y luz, 350 varas, escriturada, 2.5 millones';

/** Campos que la IA puede llenar, con nombre legible para el resumen previo. */
const NOMBRES: Partial<Record<keyof PropertyForm, string>> = {
  title: 'Título', description: 'Descripción', price: 'Precio',
  bedrooms: 'Habitaciones', bathrooms: 'Baños', parking: 'Parqueos',
  area_varas: 'Área en varas', area_m2: 'Área en m²',
  departamento: 'Departamento', municipio: 'Municipio',
  highlights: 'Lo que la destaca',
};

export function StepAi({ onApply, onSkip }: Props) {
  const t = useAdminTheme();
  const { departamentos } = useHondurasData();
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Resultado en espera: se muestra qué se va a llenar ANTES de tocar el
  // formulario. Antes la IA pisaba los campos sin avisar ni permitir deshacer.
  const [pending, setPending] = useState<{ values: Partial<PropertyForm>; kind?: PropertyKind } | null>(null);

  const generar = async () => {
    setError('');
    if (prompt.trim().length < 15) {
      setError('Contanos un poco más — al menos una frase completa.');
      return;
    }
    setLoading(true);
    try {
      const d = await aiAdapter.propertyDraft(prompt);
      const dep = d.departamento
        ? departamentos.find(x => x.nombre.toLowerCase() === d.departamento!.toLowerCase())
        : null;
      const muni = dep && d.municipio
        ? dep.municipios.find(m => m.nombre.toLowerCase() === d.municipio!.toLowerCase())
        : null;

      const values: Partial<PropertyForm> = {};
      if (d.title) values.title = d.title;
      if (d.description) values.description = d.description;
      if (d.price != null) values.price = String(d.price);
      if (d.bedrooms != null) values.bedrooms = String(d.bedrooms);
      if (d.bathrooms != null) values.bathrooms = String(d.bathrooms);
      if (d.parking != null) values.parking = String(d.parking);
      if (d.area_varas) values.area_varas = d.area_varas;
      if (d.area_m2) values.area_m2 = d.area_m2;
      if (d.highlights?.length) values.highlights = d.highlights;
      if (dep) { values.departamento = dep.nombre; values.dep_code = dep.code; }
      if (muni) values.municipio = muni.nombre;
      values.has_water = d.has_water;
      values.has_power = d.has_power;
      values.has_deed = d.has_deed;

      const kind: PropertyKind | undefined =
        d.type === 'Terreno' || d.type === 'Lote' ? 'terreno' : d.type ? 'casa' : undefined;

      setPending({ values, kind });
    } catch (err) {
      setError((err as Error).message || 'No se pudo generar. Podés llenar los campos a mano.');
    } finally {
      setLoading(false);
    }
  };

  const listos = pending
    ? (Object.keys(pending.values) as (keyof PropertyForm)[]).filter(k => NOMBRES[k])
    : [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 620 }}>
      <div>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: t.text, margin: 0 }}>
          Contanos de tu propiedad
        </h3>
        <p style={{ fontSize: 14.5, color: t.textMuted, margin: '8px 0 0', lineHeight: 1.55 }}>
          Escribilo como se lo contarías a un cliente. Nosotros llenamos el formulario
          y después lo revisás.
        </p>
      </div>

      <div>
        <textarea
          className="admin-input"
          rows={5}
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder={`Por ejemplo: ${EJEMPLO}`}
          aria-label="Descripción de la propiedad"
          style={{ resize: 'vertical', fontSize: 15, lineHeight: 1.6 }}
        />
        <button
          type="button"
          onClick={() => setPrompt(EJEMPLO)}
          className="admin-btn admin-btn--ghost"
          style={{ marginTop: 8, fontSize: 12.5 }}
        >
          Usar este ejemplo
        </button>
      </div>

      {error && (
        <div role="alert" style={{ fontSize: 13.5, color: t.danger, fontWeight: 600 }}>{error}</div>
      )}

      {pending ? (
        <div style={{
          border: `1.5px solid ${t.ok}`, borderRadius: 12, padding: 16,
          background: t.isDark ? 'rgba(74,124,89,0.10)' : '#F1F7F2',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10, color: t.ok, fontWeight: 700, fontSize: 14 }}>
            <IconCheck size={17} />
            Listo — esto es lo que vamos a llenar
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, fontSize: 13.5, color: t.textMuted, lineHeight: 1.8 }}>
            {listos.map(k => {
              const v = pending.values[k];
              const texto = Array.isArray(v) ? v.join(', ') : String(v ?? '');
              return (
                <li key={k}>
                  <strong style={{ color: t.text, fontWeight: 600 }}>{NOMBRES[k]}:</strong>{' '}
                  {texto.length > 90 ? `${texto.slice(0, 90)}…` : texto}
                </li>
              );
            })}
          </ul>
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            <button type="button" className="admin-btn admin-btn--primary"
              onClick={() => { onApply(pending.values, pending.kind); setPending(null); }}>
              Usar estos datos
            </button>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => setPending(null)}>
              Descartar
            </button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button type="button" onClick={generar} disabled={loading} className="admin-btn admin-btn--primary">
            {loading ? <IconSpinner size={16} /> : <IconSparkles size={16} />}
            {loading ? 'Leyendo…' : 'Llenar el formulario'}
          </button>
          <button type="button" onClick={onSkip} className="admin-btn admin-btn--ghost">
            Prefiero llenarlo a mano
          </button>
        </div>
      )}
    </div>
  );
}
