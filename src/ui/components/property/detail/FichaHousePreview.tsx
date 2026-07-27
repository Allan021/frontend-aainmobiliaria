import { forwardRef, useState } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../shared/rs-icons';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../../../../core/utils/cloudinaryUtils';
import type { Property } from '../../../../core/domain/entities/types';
import { LotMassingViewer } from './LotMassingViewer';
import { F_ARCHIVO, VERDE } from './tokens';

/** Simulación de casa — solo terrenos y lotes sin construcción. */
export const FichaHousePreview = forwardRef<HTMLDivElement, { property: Property }>(
  function FichaHousePreview({ property }, ref) {
    const [ver3d, setVer3d] = useState(false);
    const foto = property.house_preview_url;

    return (
      <div ref={ref} style={{ scrollMarginTop: 88 }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 8, margin: '32px 0 12px',
        }}>
          <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: 0 }}>
            Así podría verse tu casa acá
          </h3>
          {foto && (
            <button onClick={() => setVer3d(v => !v)} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              fontSize: 13, fontWeight: 700, color: VERDE, padding: 0,
              display: 'inline-flex', alignItems: 'center', gap: 4,
            }}>
              {ver3d
                ? <><IconChevronLeft size={14} /> Ver foto realista</>
                : <>Ver modelo 3D interactivo <IconChevronRight size={14} /></>}
            </button>
          )}
        </div>

        {foto && !ver3d ? (
          <div style={{ position: 'relative', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--pub-border2)' }}>
            <img
              src={optimizeCloudinaryUrl(foto, 1200)}
              srcSet={cloudinarySrcSet(foto, 1200)}
              sizes="(max-width: 900px) 100vw, 820px"
              width={820}
              height={320}
              alt="Simulación de una casa construida en este terreno, generada con IA"
              loading="lazy"
              style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute', bottom: 12, left: 12,
              background: 'rgba(17,17,19,0.7)', color: '#FAF8F3',
              fontSize: 12, fontWeight: 600, padding: '7px 12px', borderRadius: 999,
            }}>
              Simulación generada por IA — referencial, no representa una construcción real
            </div>
          </div>
        ) : (
          <LotMassingViewer areaM2={property.area_m2} />
        )}
      </div>
    );
  }
);
