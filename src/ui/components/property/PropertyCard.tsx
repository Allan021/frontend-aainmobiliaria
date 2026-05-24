import { useState } from 'react';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { WhatsAppIcon } from '../shared/Icon';

interface PropertyCardProps {
  property: Property;
  onOpen: (p: Property) => void;
  onWhatsApp: (p: Property) => void;
  animDelay?: number;
}

function HeartIcon({ saved, onClick }: { saved: boolean; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      style={{
        position: 'absolute', top: 12, right: 12,
        width: 36, height: 36, borderRadius: '50%',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        border: 'none', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        transition: 'transform 0.15s',
        zIndex: 2,
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width="18" height="18" viewBox="0 0 24 24"
        fill={saved ? '#E53E3E' : 'none'}
        stroke={saved ? '#E53E3E' : '#111113'}
        strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        style={{ transition: 'fill 0.2s, stroke 0.2s' }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}

function Badge({ children, gold }: { children: React.ReactNode; gold?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '0.25rem 0.625rem',
      borderRadius: 999, fontSize: '0.6875rem', fontWeight: 700,
      letterSpacing: '0.04em',
      background: gold ? '#D4B254' : 'rgba(17,17,19,0.82)',
      color: gold ? '#111113' : '#FAF8F3',
      backdropFilter: 'blur(8px)',
    }}>
      {children}
    </span>
  );
}

export function PropertyCard({ property, onOpen, onWhatsApp, animDelay = 0 }: PropertyCardProps) {
  const [hover, setHover] = useState(false);
  const [saved, setSaved] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);

  const images = property.images?.length > 0
    ? property.images.map(i => i.url)
    : ['/montana.jpg'];

  const currentImg = images[imgIdx] || images[0];

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSaved(s => !s);
    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      if (!animate) return;
      const btn = e.currentTarget as HTMLButtonElement;
      animate(btn, {
        scale: [1, 1.35, 1],
        duration: 380,
        ease: 'outBack',
      });
    });
  };

  const handleImgDot = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    setImgIdx(i);
  };

  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => onOpen(property)}
      style={{
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        background: '#fff',
        border: '1px solid #E6E0D2',
        display: 'flex',
        flexDirection: 'column',
        transition: 'box-shadow 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
        boxShadow: hover
          ? '0 20px 48px -12px rgba(17,17,19,0.2), 0 4px 16px rgba(17,17,19,0.08)'
          : '0 2px 8px rgba(17,17,19,0.05)',
        transform: hover ? 'translateY(-4px)' : 'translateY(0)',
        borderColor: hover ? '#D4B254' : '#E6E0D2',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: '#111113', flexShrink: 0 }}>
        <img
          src={currentImg}
          alt={property.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hover ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
          }}
          loading="lazy"
        />

        {/* Gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(10,10,11,0.55) 0%, transparent 50%)',
          opacity: hover ? 1 : 0.7,
          transition: 'opacity 0.3s',
        }} />

        {/* Top badges */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6, zIndex: 2 }}>
          {property.financing ? <Badge gold>Financiamiento</Badge> : <Badge>Solo contado</Badge>}
          {property.property_type === 'lotificadora' && (
            <Badge>{property.available_lots || 1} lotes</Badge>
          )}
        </div>

        {/* Heart */}
        <HeartIcon saved={saved} onClick={handleSave} />

        {/* Image dots (if multiple images) */}
        {images.length > 1 && (
          <div style={{
            position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: 5, opacity: hover ? 1 : 0, transition: 'opacity 0.2s', zIndex: 2,
          }}>
            {images.map((_, i) => (
              <div
                key={i}
                onClick={e => handleImgDot(e, i)}
                style={{
                  width: i === imgIdx ? 18 : 6, height: 6,
                  borderRadius: 3, background: i === imgIdx ? '#fff' : 'rgba(255,255,255,0.55)',
                  cursor: 'pointer', transition: 'all 0.2s ease',
                }}
              />
            ))}
          </div>
        )}

        {/* Price bottom-left on image */}
        <div style={{
          position: 'absolute', bottom: 12, left: 12, zIndex: 2,
          opacity: hover ? 1 : 0, transition: 'opacity 0.25s',
        }}>
          <div style={{
            background: 'rgba(10,10,11,0.75)', backdropFilter: 'blur(10px)',
            borderRadius: 10, padding: '0.375rem 0.75rem',
          }}>
            <div style={{ fontSize: '0.625rem', color: '#D4B254', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 1 }}>
              Precio
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FAF8F3', fontFeatureSettings: "'tnum' 1" }}>
              {property.discount_price
                ? formatPrice(property.discount_price, property.currency)
                : formatPrice(property.price, property.currency)}
            </div>
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '1rem 1.125rem 1.125rem', display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {/* Location + area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', color: '#5A5A63', fontWeight: 600 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>{property.municipio}, {property.departamento}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: '0.75rem', fontWeight: 600, color: '#111113' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#D4B254" stroke="none">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            4.9
          </div>
        </div>

        {/* Title */}
        <h3 style={{
          fontSize: '1rem', fontWeight: 700,
          color: '#111113', margin: 0, lineHeight: 1.3,
          letterSpacing: '-0.02em',
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {property.title}
        </h3>

        {/* Area */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#9A9383' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>{property.area_varas} · {property.area_m2}</span>
          {property.dimensions && <span>· {property.dimensions}</span>}
        </div>

        {/* Divider + price + CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 8, paddingTop: 12, borderTop: '1px solid #F3EFE6',
        }}>
          <div style={{ fontFeatureSettings: "'tnum' 1" }}>
            {property.discount_price ? (
              <>
                <div style={{ fontSize: '0.6875rem', color: '#E53E3E', textDecoration: 'line-through', opacity: 0.7, lineHeight: 1 }}>
                  {formatPrice(property.price, property.currency)}
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111113', lineHeight: 1.2 }}>
                  {formatPrice(property.discount_price, property.currency)}
                </div>
              </>
            ) : (
              <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111113', lineHeight: 1.2 }}>
                {formatPrice(property.price, property.currency)}
              </div>
            )}
          </div>

          <button
            onClick={e => { e.stopPropagation(); onWhatsApp(property); }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '0.5rem 0.875rem', borderRadius: 999,
              background: '#25D366', border: 'none', cursor: 'pointer',
              color: '#fff', fontSize: '0.75rem', fontWeight: 600,
              fontFamily: 'inherit', transition: 'background 0.15s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1DB954'; e.currentTarget.style.transform = 'scale(1.04)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <WhatsAppIcon size={13} />
            WhatsApp
          </button>
        </div>
      </div>
    </article>
  );
}
