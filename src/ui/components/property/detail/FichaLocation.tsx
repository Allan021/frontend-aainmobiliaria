import { forwardRef } from 'react';
import { IconMapPin } from '../../shared/rs-icons';
import type { Property } from '../../../../core/domain/entities/types';
import { ZoneMap } from './ZoneMap';
import { F_ARCHIVO, F_MONO } from './tokens';

/** Sección de ubicación: mapa de zona + aviso de privacidad. */
export const FichaLocation = forwardRef<HTMLDivElement, { property: Property }>(
  function FichaLocation({ property }, ref) {
    const conPin = property.lat != null && property.lng != null;

    return (
      <div ref={ref} style={{ scrollMarginTop: 88 }}>
        <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>
          Ubicación
        </h3>
        <div style={{
          position: 'relative', height: 320, borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--pub-border2)',
          background: 'linear-gradient(150deg, #F1F5EE 0%, #E6EEE2 60%, #EBF0DF 100%)',
        }}>
          {conPin ? (
            <ZoneMap lat={property.lat as number} lng={property.lng as number} />
          ) : (
            <div style={{
              position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
              fontFamily: F_MONO, fontSize: 11, color: '#8CA394', letterSpacing: '0.14em',
            }}>
              {(property.municipio || 'HONDURAS').toUpperCase()}
            </div>
          )}
        </div>

        {/* Fuera del mapa: encima tapaba la atribución de OSM/CARTO */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
          fontSize: '12.5px', fontWeight: 600, color: 'var(--pub-muted)',
        }}>
          <IconMapPin size={13} />
          Zona aproximada por seguridad — la dirección exacta se comparte al agendar
        </div>
      </div>
    );
  }
);
