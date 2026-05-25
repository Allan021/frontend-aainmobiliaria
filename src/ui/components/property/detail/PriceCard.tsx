import type { RefObject } from 'react';
import { formatPrice, type Property } from '../../../../core/domain/entities/types';

interface PriceCardProps {
  property: Property;
  priceCardRef: RefObject<HTMLDivElement | null>;
  onWhatsApp: () => void;
  phone: string;
}

export function PriceCard({ property, priceCardRef, onWhatsApp, phone }: PriceCardProps) {
  const pricePerVara = (() => {
    const varasNum = parseFloat(property.area_varas.replace(/[^0-9.]/g, ''));
    if (!varasNum || isNaN(varasNum)) return null;
    return Math.round(property.price / varasNum);
  })();

  return (
    <div style={{ position: 'sticky', top: 96 }}>
      <div
        ref={priceCardRef}
        style={{
          background: 'var(--main-card-bg, #fff)',
          borderRadius: 20,
          border: '1.5px solid var(--main-border, #E6E0D2)',
          padding: '1.75rem',
          boxShadow: '0 8px 32px -8px rgba(17,17,19,0.12), 0 2px 8px rgba(17,17,19,0.06)',
        }}
      >
        {/* Price */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--main-border, #F3EFE6)' }}>
          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--main-text-dim, #9A9383)', marginBottom: 6 }}>
            Precio
          </div>
          {property.discount_price ? (
            <>
              <div style={{ fontSize: '0.875rem', color: '#E53E3E', textDecoration: 'line-through', opacity: 0.7 }}>
                {formatPrice(property.price, property.currency)}
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--main-text, #111113)', letterSpacing: '-0.03em', fontFeatureSettings: "'tnum' 1" }}>
                {formatPrice(property.discount_price, property.currency)}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--main-text, #111113)', letterSpacing: '-0.03em', fontFeatureSettings: "'tnum' 1" }}>
              {formatPrice(property.price, property.currency)}
            </div>
          )}
          {/* Price per vara */}
          {pricePerVara !== null && (
            <div style={{ fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 4 }}>
              {property.currency} {pricePerVara.toLocaleString('en-US')} / vara²
            </div>
          )}
          {property.financing && (
            <div style={{ marginTop: 8, padding: '0.625rem 0.875rem', borderRadius: 10, background: 'var(--main-bg, #FBF6E9)', border: '1px solid var(--main-border, #F2E4B8)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--sidebar-accent, #8C6F1C)' }}>
                Prima desde {property.financing_prima || 20}% ·{' '}
                {property.financing_plazo_meses ? Math.round(property.financing_plazo_meses / 12) : 8} años plazo
              </span>
            </div>
          )}
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* WhatsApp CTA — uses data-action for native event delegation */}
          <button
            type="button"
            data-action="open-lead-modal"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              width: '100%', padding: '1rem 1.5rem',
              background: '#25D366', border: 'none', borderRadius: 12,
              color: '#fff', fontSize: '1rem', fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 211, 102, 0.3)',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
              boxSizing: 'border-box',
              WebkitTapHighlightColor: 'transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#22c35a';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.45)';
              e.currentTarget.style.transform = 'translateY(-1px) scale(1.03)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#25D366';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 211, 102, 0.3)';
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
            }}
          >
            <svg style={{ pointerEvents: 'none' }} xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
            </svg>
            <span style={{ pointerEvents: 'none' }}>Consultar por WhatsApp</span>
          </button>

          <a
            href={`tel:${phone.replace(/-/g, '')}`}
            style={{
              width: '100%', padding: '0.875rem',
              border: '1.5px solid var(--main-border, #E6E0D2)', borderRadius: 12,
              color: 'var(--main-text, #111113)', fontSize: '0.9375rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              textDecoration: 'none', background: 'var(--main-card-bg, #fff)',
              transition: 'border-color 0.2s, background 0.2s',
              boxSizing: 'border-box',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--main-text)';
              (e.currentTarget as HTMLElement).style.background = 'var(--main-bg)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--main-border)';
              (e.currentTarget as HTMLElement).style.background = 'var(--main-card-bg)';
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13 19.79 19.79 0 0 1 1.27 4.37 2 2 0 0 1 3.24 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
            </svg>
            Llamar: {phone}
          </a>
        </div>

        {/* Trust note */}
        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--main-text-dim, #9A9383)', lineHeight: 1.5 }}>
            Sin compromiso · Respuesta en minutos<br />
            <span style={{ color: '#D4B254', fontWeight: 600 }}>Escrituración verificada ✓</span>
          </div>
        </div>

        {/* Share compact */}
        <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--main-border, #F3EFE6)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--main-text-dim, #9A9383)', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Compartir esta propiedad
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                const url = typeof window !== 'undefined'
                  ? window.location.href
                  : `https://www.aabienes.com/propiedad/${property.id}`;
                const text = encodeURIComponent(`${property.title}\n${url}`);
                window.open(`https://wa.me/?text=${text}`, '_blank');
              }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 8,
                background: '#F0FDF4', border: '1px solid #86EFAC',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: '0.75rem', fontWeight: 600, color: '#166534', fontFamily: 'inherit',
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
              WhatsApp
            </button>
            <button
              onClick={() => {
                const url = typeof window !== 'undefined'
                  ? window.location.href
                  : `https://www.aabienes.com/propiedad/${property.id}`;
                navigator.clipboard.writeText(url);
              }}
              style={{
                flex: 1, padding: '0.5rem', borderRadius: 8,
                background: 'var(--main-bg, #F3EFE6)', border: '1px solid var(--main-border, #E6E0D2)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                fontSize: '0.75rem', fontWeight: 600, color: 'var(--main-text-dim, #5A5A63)', fontFamily: 'inherit',
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copiar enlace
            </button>
          </div>
        </div>
      </div>

      {/* Agent card */}
      <div style={{
        marginTop: '1rem', padding: '1.25rem',
        border: '1.5px solid var(--main-border, #E6E0D2)', borderRadius: 16, background: 'var(--main-card-bg, #fff)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'linear-gradient(135deg, #D4B254, #8C6F1C)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
            fontSize: '1.125rem', fontWeight: 700, color: '#111113',
          }}>
            A
          </div>
          <div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--main-text, #111113)' }}>A&amp;A Inmobiliaria</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--main-text-dim, #9A9383)' }}>Agente verificado · El Progreso, Yoro</div>
          </div>
        </div>
        <div style={{ marginTop: '0.875rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {['Respuesta rápida', 'Verificado', 'Escrituración'].map(tag => (
            <span key={tag} style={{
              padding: '0.25rem 0.625rem', borderRadius: 999,
              background: 'var(--main-bg, #F3EFE6)', color: 'var(--main-text-muted, #5A5A63)',
              fontSize: '0.6875rem', fontWeight: 600,
            }}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
