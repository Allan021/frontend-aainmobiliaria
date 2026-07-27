import { hasSatellite, type BasemapId } from './basemaps';

interface Props {
  value: BasemapId;
  onChange: (id: BasemapId) => void;
  /** `compact` para mapas chicos como el de la ficha */
  size?: 'normal' | 'compact';
}

const OPCIONES: { id: BasemapId; label: string }[] = [
  { id: 'mapa', label: 'Mapa' },
  { id: 'satelite', label: 'Satélite' },
];

/** Conmutador Mapa / Satélite. No se renderiza si no hay token de Mapbox. */
export function BasemapSwitch({ value, onChange, size = 'normal' }: Props) {
  if (!hasSatellite) return null;

  return (
    <div className={`map-basemap-switch${size === 'compact' ? ' map-basemap-switch--compact' : ''}`}
      role="group" aria-label="Vista del mapa">
      {OPCIONES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          aria-pressed={value === id}
          className={value === id ? 'is-active' : ''}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
