import { useState } from 'react';
import { cleanTitle, fmtVaras, type Property } from '../../../core/domain/entities/types';
import { useCurrency, priceParts } from '../../hooks/useCurrency';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { WhatsAppIcon } from '../shared/Icon';
import { IconBed, IconBath, IconCar, IconArea, IconCheck, IconHeart } from '../shared/rs-icons';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

interface PropertyCardProps {
  property: Property;
  onOpen: (p: Property) => void;
  onWhatsApp: (p: Property) => void;
  animDelay?: number;
  /** Estado real de favorito (si se controla desde afuera) */
  saved?: boolean;
  /** Toggle real de favorito; sin esto el corazón solo es visual */
  onToggleSave?: (p: Property) => void;
}

export function PropertyCard({ property, onOpen, onWhatsApp, saved: savedProp, onToggleSave }: PropertyCardProps) {
  const [hover, setHover] = useState(false);
  const [savedLocal, setSavedLocal] = useState(false);
  const saved = onToggleSave ? !!savedProp : savedLocal;
  const [currency] = useCurrency();

  const img = property.images?.[0]?.url;
  const { main, alt } = priceParts(property.discount_price ?? property.price, property.currency, currency);
  const enCuotas = property.financing;

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleSave) onToggleSave(property);
    else setSavedLocal(s => !s);
  };

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 16,
        overflow: 'hidden', display: 'flex', flexDirection: 'column',
        fontFamily: F_SANS, color: 'var(--pub-ink)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        boxShadow: hover ? '0 20px 48px -16px rgba(17,17,19,0.18)' : 'none',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
      }}
    >
      {/* Foto */}
      <div style={{ position: 'relative' }}>
        <div onClick={() => onOpen(property)} style={{ display: 'block', height: 200, background: 'var(--pub-border)', cursor: 'pointer', overflow: 'hidden' }}>
          {img ? (
            <img
              src={optimizeCloudinaryUrl(img, 480)}
              alt={cleanTitle(property.title)}
              width={480} height={200} loading="lazy" decoding="async"
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hover ? 'scale(1.04)' : 'scale(1)',
                transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontFamily: F_MONO, fontSize: '10.5px', color: 'var(--pub-dim)' }}>
              FOTO PENDIENTE
            </div>
          )}
        </div>
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span style={{
            background: '#111113', color: '#D4B254', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.04em', padding: '5px 10px', borderRadius: 999, textTransform: 'uppercase',
          }}>{property.type}</span>
          {enCuotas && (
            <span style={{ background: '#1F5B42', color: '#EEF5F0', fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 999 }}>
              En cuotas
            </span>
          )}
        </div>
        <button onClick={handleSave}
          aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
          style={{
            position: 'absolute', top: 10, right: 10, width: 36, height: 36, borderRadius: '50%',
            background: 'rgba(255,255,255,0.92)', border: '1px solid var(--pub-border)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            color: saved ? '#C65D3B' : 'var(--pub-dim)', transition: 'color 0.15s, transform 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#C65D3B' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      {/* Cuerpo */}
      <div style={{ padding: '18px 18px 16px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em' }}>{main}</div>
          <div style={{ fontSize: '12.5px', color: 'var(--pub-dim)', fontWeight: 600, whiteSpace: 'nowrap' }}>{alt}</div>
        </div>

        <div>
          <button onClick={() => onOpen(property)} style={{
            fontWeight: 700, fontSize: '15.5px', color: 'var(--pub-ink)', background: 'none', border: 'none',
            padding: 0, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', transition: 'color 0.15s',
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.35,
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C65D3B'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--pub-ink)'; }}
          >{cleanTitle(property.title)}</button>
          <div style={{ fontSize: '13.5px', color: 'var(--pub-muted)', marginTop: 2 }}>{property.municipio}, {property.departamento}</div>
        </div>

        {/* Specs */}
        <div style={{ display: 'flex', gap: 14, fontSize: 13, color: 'var(--pub-muted2)', fontWeight: 600, flexWrap: 'wrap' }}>
          {property.bedrooms ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconBed size={14} /> {property.bedrooms} hab</span>
          ) : null}
          {property.bathrooms ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconBath size={14} /> {property.bathrooms} baños</span>
          ) : null}
          {property.parking ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconCar size={14} /> {property.parking}</span>
          ) : null}
          {property.area_varas ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><IconArea size={13} /> {fmtVaras(property.area_varas)}</span>
          ) : null}
        </div>

        {/* Escritura */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4A7C59', fontWeight: 600,
          borderTop: '1px solid var(--pub-border)', paddingTop: 10, marginTop: 'auto',
        }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#EEF5F0', display: 'grid', placeItems: 'center' }}>
            <IconCheck size={10} />
          </span>
          Escritura verificada · Instituto de la Propiedad
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => onOpen(property)} style={{
            flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 14, color: 'var(--pub-ink)',
            border: '1.5px solid var(--pub-ink)', borderRadius: 10, padding: '10px 0',
            background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s, color 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--pub-ink)'; e.currentTarget.style.color = 'var(--pub-bg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--pub-ink)'; }}
          >Agendar visita</button>
          <button onClick={e => { e.stopPropagation(); onWhatsApp(property); }} style={{
            flex: 1, textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#0A3D22',
            background: '#25D366', borderRadius: 10, padding: '11.5px 0',
            border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
          ><WhatsAppIcon size={14} color="#0A3D22" /> Consultar</button>
        </div>
      </div>
    </article>
  );
}
