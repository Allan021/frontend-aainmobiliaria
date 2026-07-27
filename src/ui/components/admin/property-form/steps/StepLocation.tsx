import { IconMapPin, IconCheck, IconAlert } from '../../../shared/rs-icons';
import { SelectField } from '../../../shared/SelectField';
import { LocationPicker } from '../../../shared/LocationPicker';
import { FieldShell } from '../fields/FieldShell';
import { AddressSearch } from '../fields/AddressSearch';
import { useHondurasData } from '../../../../hooks/useHondurasData';
import { useAdminTheme } from '../theme';
import type { PropertyForm } from '../types';

interface Props {
  form: PropertyForm;
  set: <K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) => void;
  patch: (values: Partial<PropertyForm>) => void;
}

export function StepLocation({ form, set, patch }: Props) {
  const t = useAdminTheme();
  const { departamentos } = useHondurasData();
  const dept = departamentos.find(d => d.nombre === form.departamento) || departamentos[0];
  const conPin = form.lat != null && form.lng != null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 620 }}>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 700, color: t.text, margin: 0 }}>¿Dónde queda?</h3>
        <p style={{ fontSize: 14, color: t.textMuted, margin: '6px 0 0', lineHeight: 1.55 }}>
          Al público solo le mostramos la zona aproximada, nunca la dirección exacta.
        </p>
      </div>

      <div className="field-row-2">
        <FieldShell label="Departamento">
          <SelectField
            options={departamentos.map(d => ({ value: d.nombre, label: d.nombre }))}
            value={form.departamento}
            onChange={nombre => {
              const d = departamentos.find(x => x.nombre === nombre);
              patch({ departamento: d?.nombre || nombre, dep_code: d?.code || '', municipio: '' });
            }}
            placeholder="Elegí uno"
            theme={t.isDark ? 'dark' : 'light'}
          />
        </FieldShell>

        <FieldShell label="Municipio">
          <SelectField
            options={(dept?.municipios || []).map(m => ({ value: m.nombre, label: m.nombre }))}
            value={form.municipio}
            onChange={v => set('municipio', v)}
            placeholder="Elegí uno"
            theme={t.isDark ? 'dark' : 'light'}
          />
        </FieldShell>
      </div>

      <AddressSearch
        municipio={form.municipio}
        departamento={form.departamento}
        onFound={(lat, lng) => patch({ lat, lng })}
      />

      <FieldShell
        label="Marcá el punto en el mapa"
        hint="Tocá el mapa o arrastrá el pin. Sin pin, la propiedad no sale en el buscador."
      >
        <LocationPicker
          height={280}
          initial={conPin ? [form.lat as number, form.lng as number] : null}
          onPick={(lat, lng) => patch({ lat, lng })}
        />
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
          fontSize: 13, fontWeight: 600, color: conPin ? t.ok : t.danger,
        }}>
          {conPin ? <IconCheck size={15} /> : <IconAlert size={15} />}
          {conPin ? 'Ubicación marcada' : 'Todavía sin marcar — no aparecerá en el mapa'}
        </div>
      </FieldShell>

      <details className="admin-details">
        <summary>
          <IconMapPin size={15} />
          Pegar un enlace de Google Maps (opcional)
        </summary>
        <div style={{ paddingTop: 12 }}>
          <FieldShell
            label="Enlace de Google Maps"
            hint="Solo si querés mostrar también el mapa de Google. El pin de arriba ya es suficiente."
          >
            <input
              className="admin-input"
              value={form.map_url}
              onChange={e => set('map_url', e.target.value)}
              placeholder="https://maps.app.goo.gl/…"
              inputMode="url"
            />
          </FieldShell>
        </div>
      </details>
    </div>
  );
}
