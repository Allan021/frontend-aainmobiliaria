import { IconDroplet, IconZap, IconScroll } from '../../shared/rs-icons';
import { fmtVaras, type Property } from '../../../../core/domain/entities/types';
import { F_ARCHIVO, VERDE, VERDE_CLARO } from './tokens';

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
        <div className="ficha-stats" style={{
          display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`,
          gap: 12, margin: '24px 0',
        }}>
          {stats.map(s => (
            <div key={s.l} style={{
              background: 'var(--pub-surface)', border: '1px solid var(--pub-border)',
              borderRadius: 12, padding: 16, textAlign: 'center',
            }}>
              <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 22 }}>{s.v}</div>
              <div style={{ fontSize: '12.5px', color: 'var(--pub-muted)', fontWeight: 600 }}>{s.l}</div>
            </div>
          ))}
        </div>
      )}

      {servicios.length > 0 && (
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 4px' }}>
          {servicios.map(({ key, label, Icon, color }) => (
            <span key={key} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              background: 'var(--pub-surface)', border: '1px solid var(--pub-border)',
              borderRadius: 10, padding: '9px 14px',
              fontSize: '13.5px', fontWeight: 600, color: 'var(--pub-muted2)',
            }}>
              <span style={{ color, display: 'flex' }}><Icon size={15} /></span> {label}
            </span>
          ))}
        </div>
      )}

      {(property.highlights?.length ?? 0) > 0 && (
        <>
          <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '28px 0 12px' }}>Lo especial</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {property.highlights.map(h => (
              <span key={h} className="ficha-highlight-chip" style={{
                background: 'var(--pub-bg)', border: '1px solid var(--pub-border2)',
                borderRadius: 8, padding: '8px 13px',
                fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.03em',
                textTransform: 'uppercase', color: 'var(--pub-muted2)',
              }}>{h}</span>
            ))}
          </div>
        </>
      )}
    </>
  );
}
