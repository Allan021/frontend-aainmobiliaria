import { IconDroplet, IconZap, IconScroll } from '../../shared/rs-icons';
import { fmtVaras, type Property } from '../../../../core/domain/entities/types';
import { VERDE, VERDE_CLARO } from './tokens';

const SERVICIOS = [
  { key: 'has_water', label: 'Agua potable', Icon: IconDroplet, color: VERDE },
  { key: 'has_power', label: 'Energía eléctrica', Icon: IconZap, color: '#B8962E' },
  { key: 'has_deed', label: 'Escritura en regla', Icon: IconScroll, color: VERDE_CLARO },
] as const;

/** Números de la propiedad + servicios + etiquetas destacadas. */
export function FichaSpecs({ property }: { property: Property }) {
  const stats = [
    property.bedrooms ? { v: String(property.bedrooms), l: 'Habitaciones' } : null,
    property.bathrooms ? { v: String(property.bathrooms), l: 'Baños' } : null,
    property.parking ? { v: String(property.parking), l: 'Parqueos' } : null,
    property.area_varas
      ? { v: fmtVaras(property.area_varas), l: property.area_m2 ? `≈ ${property.area_m2}` : 'Área' }
      : null,
  ].filter(Boolean) as { v: string; l: string }[];

  const servicios = SERVICIOS.filter(s => property[s.key]);

  return (
    <>
      {stats.length > 0 && (
        <div className="ficha-stats fx-specs" style={{ gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)` }}>
          {stats.map(s => (
            <div key={s.l} className="fx-spec">
              <div className="fx-spec__v">{s.v}</div>
              <div className="fx-spec__l">{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {servicios.length > 0 && (
        <div style={{ display: 'flex', gap: '10px 26px', flexWrap: 'wrap', margin: '0 0 4px' }}>
          {servicios.map(({ key, label, Icon, color }) => (
            <span key={key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              fontSize: '14.5px', fontWeight: 600, color: 'var(--pub-muted2)',
            }}>
              <span style={{ color, display: 'flex' }}><Icon size={17} /></span> {label}
            </span>
          ))}
        </div>
      )}

      {(property.highlights?.length ?? 0) > 0 && (
        <>
          <h2 className="fx-h">Lo especial</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {property.highlights.map(h => (
              <span key={h} className="ficha-highlight-chip" style={{
                border: '1px solid var(--pub-border2)',
                borderRadius: 999, padding: '8px 15px',
                fontSize: '13.5px', fontWeight: 600, color: 'var(--pub-muted2)',
              }}>{h}</span>
            ))}
          </div>
        </>
      )}
    </>
  );
}
