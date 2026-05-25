import type { RefObject } from 'react';
import { formatPrice, type Property } from '../../../../core/domain/entities/types';
import { WhatsAppButton } from '../../shared/WhatsAppButton';
import { WhatsAppIcon } from '../../shared/Icon';

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
          <WhatsAppButton
            onClick={onWhatsApp}
            size="xl"
            variant="solid"
            fullWidth
            borderRadius={12}
            label="Consultar por WhatsApp"
          />

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
              <WhatsAppIcon size={13} />
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
