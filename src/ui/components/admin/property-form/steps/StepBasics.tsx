import { IconHome, IconMountain, IconGrid, IconDroplet, IconZap, IconScroll, IconBed, IconBath, IconCar } from '../../../shared/rs-icons';
import { TextField } from '../fields/TextField';
import { ChoiceCards } from '../fields/ChoiceCards';
import { ToggleChips } from '../fields/ToggleChips';
import { TagInput } from '../fields/TagInput';
import { useAdminTheme } from '../theme';
import type { PropertyForm, PropertyKind } from '../types';

interface Props {
  form: PropertyForm;
  set: <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) => void;
  patch: (values: Partial<PropertyForm>) => void;
  kind: PropertyKind;
  setKind: (k: PropertyKind) => void;
}

const TIPOS = [
  { value: 'casa' as const, label: 'Una casa', hint: 'Vivienda construida, con cuartos y baños', Icon: IconHome },
  { value: 'terreno' as const, label: 'Un terreno', hint: 'Lote o solar sin construir', Icon: IconMountain },
  { value: 'lotificacion' as const, label: 'Una lotificación', hint: 'Varios lotes en un mismo proyecto', Icon: IconGrid },
];

const SERVICIOS = [
  { key: 'has_water' as const, label: 'Agua potable', Icon: IconDroplet },
  { key: 'has_power' as const, label: 'Energía eléctrica', Icon: IconZap },
  { key: 'has_deed' as const, label: 'Escritura en regla', Icon: IconScroll },
];

// 1 m² ≈ 1.43028 varas² (Honduras)
const VARAS_POR_M2 = 1.43028;

export function StepBasics({ form, set, patch, kind, setKind }: Props) {
  const t = useAdminTheme();

  // "14x18" llena las dos áreas solo: nadie debería calcular varas a mano
  const onDimensions = (val: string) => {
    const m = val.match(/([0-9.]+)\s*[xX*]\s*([0-9.]+)/);
    if (!m) { set('dimensions', val); return; }
    const w = parseFloat(m[1]);
    const h = parseFloat(m[2]);
    if (isNaN(w) || isNaN(h)) { set('dimensions', val); return; }
    const m2 = w * h;
    patch({
      dimensions: val,
      area_m2: String(parseFloat(m2.toFixed(2))),
      area_varas: String(Math.round(m2 * VARAS_POR_M2)),
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 620 }}>
      <ChoiceCards legend="¿Qué estás publicando?" choices={TIPOS} value={kind} onChange={setKind} />

      <TextField
        label="¿Cómo la describirías en una línea?"
        hint="Es el titular que ve la gente en el buscador."
        placeholder="Casa de esquina en Colonia 19 de Junio"
        value={form.title}
        onChange={v => set('title', v)}
        required
        validate={v => v.trim().length < 5 ? 'Escribí al menos unas palabras.' : null}
      />

      <TextField
        label="Precio"
        hint="Solo el número, en lempiras."
        prefix="L"
        inputMode="numeric"
        placeholder="2500000"
        value={form.price}
        onChange={v => set('price', v.replace(/[^\d.]/g, ''))}
        required
        validate={v => !v || Number(v) <= 0 ? 'Poné el precio en lempiras.' : null}
      />

      <TextField
        label="Precio de oferta"
        hint="Opcional. Si lo llenás, se muestra el precio anterior tachado."
        prefix="L"
        inputMode="numeric"
        value={form.discount_price}
        onChange={v => set('discount_price', v.replace(/[^\d.]/g, ''))}
      />

      {kind === 'casa' && (
        <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 13.5, fontWeight: 600, color: t.text, marginBottom: 8, padding: 0 }}>
            ¿Cuántos tiene?
          </legend>
          <div className="field-row-3">
            <TextField label="Habitaciones" value={form.bedrooms} inputMode="numeric"
              onChange={v => set('bedrooms', v.replace(/\D/g, ''))} />
            <TextField label="Baños" value={form.bathrooms} inputMode="decimal"
              onChange={v => set('bathrooms', v.replace(/[^\d.]/g, ''))} />
            <TextField label="Parqueos" value={form.parking} inputMode="numeric"
              onChange={v => set('parking', v.replace(/\D/g, ''))} />
          </div>
        </fieldset>
      )}

      <TextField
        label="Medidas del terreno"
        hint='Escribilo como "14x18" y calculamos las varas y los metros solos.'
        placeholder="14x18"
        value={form.dimensions}
        onChange={onDimensions}
      />

      <div className="field-row-2">
        <TextField label="Área en varas²" value={form.area_varas} onChange={v => set('area_varas', v)} />
        <TextField label="Área en m²" value={form.area_m2} onChange={v => set('area_m2', v)} />
      </div>

      <ToggleChips
        legend="¿Qué tiene?"
        hint="Tocá lo que aplique. Aparecen como sellos de confianza en la ficha."
        options={SERVICIOS}
        isOn={k => form[k]}
        onToggle={(k, next) => set(k, next)}
      />

      <TagInput
        label="¿Qué la hace especial?"
        hint="Frases cortas que se muestran como etiquetas. Hasta 6."
        placeholder="Casa de esquina"
        values={form.highlights}
        onChange={v => set('highlights', v)}
      />

      <TextField
        label="Descripción completa"
        hint="Contá lo que no entra en el titular: el barrio, el estado, por qué conviene."
        multiline
        rows={5}
        value={form.description}
        onChange={v => set('description', v)}
      />
    </div>
  );
}
