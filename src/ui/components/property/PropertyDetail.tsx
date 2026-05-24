import { useState, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { WhatsAppIcon } from '../shared/Icon';

interface Props {
  property: Property;
  onBack: () => void;
  onWhatsApp: (p: Property) => void;
  standalone?: boolean;
}

/* ── Department → map coordinates ─────────────────────────── */
const DEPT_COORDS: Record<string, { lat: number; lng: number }> = {
  'Yoro':                { lat: 15.3992, lng: -87.8028 },
  'Cortés':              { lat: 15.4997, lng: -88.0249 },
  'Cortes':              { lat: 15.4997, lng: -88.0249 },
  'Francisco Morazán':   { lat: 14.0818, lng: -87.2068 },
  'Francisco Morazan':   { lat: 14.0818, lng: -87.2068 },
  'Atlántida':           { lat: 15.7636, lng: -86.7844 },
  'Atlantida':           { lat: 15.7636, lng: -86.7844 },
  'Comayagua':           { lat: 14.4516, lng: -87.6222 },
  'Choluteca':           { lat: 13.3005, lng: -87.1934 },
  'El Paraíso':          { lat: 13.8592, lng: -86.5944 },
  'Olancho':             { lat: 14.8000, lng: -86.1000 },
  'Santa Bárbara':       { lat: 14.9186, lng: -88.2301 },
  'Colón':               { lat: 15.9000, lng: -85.5000 },
};

function getMapUrl(departamento: string, municipio: string): string {
  const coords = DEPT_COORDS[departamento] || { lat: 15.3992, lng: -87.8028 };
  const { lat, lng } = coords;
  const margin = 0.05;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - margin}%2C${lat - margin}%2C${lng + margin}%2C${lat + margin}&layer=mapnik&marker=${lat}%2C${lng}`;
}

/* ── Section reveal hook ───────────────────────────────────── */
function useReveal(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        import('animejs').then(mod => {
          const animate = (mod as any).animate;
          if (animate) {
            animate(el, { opacity: [0, 1], y: [28, 0], duration: 600, ease: 'outExpo' });
          }
        });
        observer.unobserve(el);
      },
      { threshold: 0.08 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
}

/* ── Photo grid ────────────────────────────────────────────── */
function PhotoGrid({
  images,
  onImageClick,
}: {
  images: { url: string; title?: string }[];
  onImageClick: (idx: number) => void;
}) {
  const main = images[0];
  const rest = images.slice(1, 5);
  const total = images.length;

  // Mobile single image (handled via CSS class)
  if (images.length === 1) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#111113' }} className="photo-grid-wrap">
        <img
          src={main.url} alt={main.title || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => onImageClick(0)}
        />
        <button
          onClick={() => onImageClick(0)}
          style={pillBtnStyle}
        >
          1 / 1 foto
        </button>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: '#111113' }} className="photo-grid-wrap">
      {/* Mobile: show only first image */}
      <div className="photo-mobile-only" style={{ position: 'relative', width: '100%', height: '55vw' }}>
        <img
          src={main.url} alt={main.title || ''}
          style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
          onClick={() => onImageClick(0)}
        />
        <button onClick={() => onImageClick(0)} style={pillBtnStyle}>
          1 / {total} fotos
        </button>
      </div>

      {/* Desktop: Airbnb grid */}
      <div
        className="photo-desktop-only"
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 3,
          height: '60vh',
        }}
      >
        {/* Main large — rounded left */}
        <div
          style={{
            overflow: 'hidden',
            borderRadius: '12px 0 0 12px',
            cursor: 'pointer',
          }}
          onClick={() => onImageClick(0)}
        >
          <img
            src={main.url} alt={main.title || ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.04)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        </div>

        {/* Right 2×2 */}
        <div style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          {[0, 1, 2, 3].map(i => {
            const img = rest[i];
            const isBottomRight = i === 3;
            if (!img) return <div key={i} style={{ background: '#1A1A1D', borderRadius: isBottomRight ? '0 0 12px 0' : 0 }} />;
            return (
              <div
                key={i}
                style={{
                  overflow: 'hidden',
                  borderRadius: isBottomRight ? '0 0 12px 0' : 0,
                  cursor: 'pointer',
                }}
                onClick={() => onImageClick(i + 1)}
              >
                <img
                  src={img.url} alt={img.title || ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.06)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                />
              </div>
            );
          })}
        </div>

        {/* "Ver todas" pill */}
        <button
          onClick={() => onImageClick(0)}
          style={{
            position: 'absolute', bottom: 16, right: 16,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(17,17,19,0.15)', borderRadius: 10,
            padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'inherit',
            fontSize: '0.8125rem', fontWeight: 600, color: '#111113',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
            transition: 'transform 0.15s, box-shadow 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.18)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.12)'; }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
          Ver todas las {total} fotos
        </button>
      </div>
    </div>
  );
}

const pillBtnStyle: CSSProperties = {
  position: 'absolute', bottom: 12, right: 12,
  background: 'rgba(17,17,19,0.75)', backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
  padding: '0.4rem 0.875rem', cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '0.8125rem', fontWeight: 600, color: '#FAF8F3',
};

/* ── Gallery lightbox ─────────────────────────────────────── */
function GalleryModal({
  images,
  startIdx,
  onClose,
}: {
  images: { url: string; title?: string; description?: string }[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const thumbsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setIdx(i => (i - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Scroll active thumbnail into view
  useEffect(() => {
    if (!thumbsRef.current) return;
    const active = thumbsRef.current.querySelector('[data-active="true"]') as HTMLElement | null;
    if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [idx]);

  const img = images[idx];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(10,10,11,0.97)', backdropFilter: 'blur(16px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn 0.2s ease',
      }}
    >
      {/* Close */}
      <button onClick={onClose} style={{
        position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%',
        background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)',
        color: '#FAF8F3', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
      }}>✕</button>

      {/* Counter */}
      <div style={{ position: 'absolute', top: 24, left: '50%', transform: 'translateX(-50%)', color: '#FAF8F3', fontSize: '0.875rem', fontWeight: 600 }}>
        {idx + 1} / {images.length}
      </div>

      {/* Main viewer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 1100, padding: '0 1rem', flex: 1, justifyContent: 'center' }}>
        <button
          onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 22, flexShrink: 0 }}
        >
          ‹
        </button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <img
            src={img.url} alt={img.title || ''}
            style={{ maxHeight: '65vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 12, boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}
          />
          {(img.title || img.description) && (
            <div style={{ marginTop: '0.875rem', color: '#FAF8F3' }}>
              {img.title && <div style={{ fontSize: '1rem', fontWeight: 600 }}>{img.title}</div>}
              {img.description && <div style={{ fontSize: '0.875rem', color: '#9A9383', marginTop: 4 }}>{img.description}</div>}
            </div>
          )}
        </div>
        <button
          onClick={() => setIdx(i => (i + 1) % images.length)}
          style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', cursor: 'pointer', fontSize: 22, flexShrink: 0 }}
        >
          ›
        </button>
      </div>

      {/* Thumbnail strip */}
      <div
        ref={thumbsRef}
        style={{
          display: 'flex', gap: 8, overflowX: 'auto', padding: '0.75rem 1.5rem',
          width: '100%', maxWidth: 1100, scrollbarWidth: 'none',
          flexShrink: 0,
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            data-active={i === idx ? 'true' : 'false'}
            onClick={() => setIdx(i)}
            style={{
              width: 64, height: 48, flexShrink: 0, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
              border: i === idx ? '2px solid #D4B254' : '2px solid transparent',
              opacity: i === idx ? 1 : 0.5,
              transition: 'opacity 0.2s, border-color 0.2s',
            }}
          >
            <img src={img.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Quick-stats strip ─────────────────────────────────────── */
function QuickStats({ property }: { property: Property }) {
  const items: { icon: JSX.Element; label: string; value: string }[] = [];

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 3v18" />
      </svg>
    ),
    label: 'Área',
    value: `${property.area_varas} varas²`,
  });

  if (property.dimensions) {
    items.push({
      icon: (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
          <path d="M21 3H3v18M21 3l-6 6M21 3l-6 6m0 0H9m6 0v6" />
        </svg>
      ),
      label: 'Dimensiones',
      value: property.dimensions,
    });
  }

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    label: 'Tipo',
    value: property.type,
  });

  items.push({
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </svg>
    ),
    label: 'Pago',
    value: property.financing ? 'Financiamiento' : 'Solo contado',
  });

  return (
    <div style={{ borderBottom: '1px solid #E6E0D2', background: '#fff' }} className="quick-stats-strip">
      <div
        style={{
          maxWidth: 1280, margin: '0 auto', padding: '0.875rem 1.5rem',
          display: 'flex', gap: '2rem', alignItems: 'center',
          overflowX: 'auto', whiteSpace: 'nowrap',
        }}
      >
        {items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
            {i > 0 && <div style={{ width: 1, height: 32, background: '#E6E0D2', flexShrink: 0 }} />}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ flexShrink: 0 }}>{item.icon}</div>
              <div>
                <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9A9383', lineHeight: 1.2 }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111113', lineHeight: 1.3 }}>
                  {item.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Spec tile ─────────────────────────────────────────────── */
function SpecItem({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div style={{ padding: '1rem 0', borderBottom: '1px solid #F3EFE6', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
      <dt style={{ fontSize: '0.8125rem', color: '#9A9383', fontWeight: 500, flexShrink: 0 }}>{label}</dt>
      <dd style={{
        fontSize: '0.9375rem', fontWeight: 600, color: '#111113', margin: 0,
        textAlign: 'right',
        fontFamily: mono ? 'monospace' : 'inherit',
        fontFeatureSettings: "'tnum' 1",
      }}>
        {value}
      </dd>
    </div>
  );
}

/* ── Map component ─────────────────────────────────────────── */
function PropertyMap({ departamento, municipio }: { departamento: string; municipio: string }) {
  const mapUrl = getMapUrl(departamento, municipio);
  return (
    <div style={{ borderRadius: 16, overflow: 'hidden', border: '1px solid #E6E0D2', position: 'relative' }}>
      <iframe
        src={mapUrl}
        width="100%"
        height="400"
        style={{ border: 'none', display: 'block' }}
        loading="lazy"
        title={`Ubicación: ${municipio}, ${departamento}`}
        sandbox="allow-scripts allow-same-origin"
      />
      <div style={{
        position: 'absolute', bottom: 12, left: 12,
        background: 'rgba(17,17,19,0.85)', backdropFilter: 'blur(8px)',
        borderRadius: 10, padding: '0.5rem 0.75rem',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#FAF8F3' }}>
          {municipio}, {departamento}
        </span>
      </div>
    </div>
  );
}

/* ── FAQ accordion ─────────────────────────────────────────── */
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: '1px solid #E6E0D2' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', textAlign: 'left', background: 'none', border: 'none',
          padding: '1.125rem 0', cursor: 'pointer', fontFamily: 'inherit',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
        }}
      >
        <span style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#111113', lineHeight: 1.4 }}>{question}</span>
        <svg
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="#9A9383" strokeWidth="2" strokeLinecap="round"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease', flexShrink: 0 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div
        className="faq-content"
        style={{
          maxHeight: open ? 300 : 0,
          opacity: open ? 1 : 0,
          overflow: 'hidden',
        }}
      >
        <p style={{ fontSize: '0.9rem', lineHeight: 1.7, color: '#5A5A63', margin: '0 0 1.125rem' }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

/* ── Share bar ─────────────────────────────────────────────── */
function ShareBar({ property }: { property: Property }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : `https://aainmobiliaria.hn/propiedad/${property.id}`;

  const copyLink = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const waShare = () => {
    const text = encodeURIComponent(`${property.title} — A&A Inmobiliaria\n${url}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const nativeShare = () => {
    if (navigator.share) {
      navigator.share({ title: property.title, url });
    }
  };

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
      <button
        onClick={copyLink}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '0.4rem 0.75rem', borderRadius: 8,
          background: copied ? '#F0FDF4' : '#F3EFE6',
          border: copied ? '1px solid #86EFAC' : '1px solid #E6E0D2',
          cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.8125rem', fontWeight: 600,
          color: copied ? '#166534' : '#111113',
          transition: 'all 0.2s',
        }}
      >
        {copied ? (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#166534" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </svg>
        )}
        {copied ? '¡Copiado!' : 'Copiar enlace'}
      </button>

      <button
        onClick={waShare}
        style={{
          width: 34, height: 34, borderRadius: 8,
          background: '#F0FDF4', border: '1px solid #86EFAC',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
        title="Compartir por WhatsApp"
      >
        <WhatsAppIcon size={16} />
      </button>

      {hasNativeShare && (
        <button
          onClick={nativeShare}
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: '#F3EFE6', border: '1px solid #E6E0D2',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          title="Compartir"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#5A5A63" strokeWidth="2" strokeLinecap="round">
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── PropertyDetail (main) ─────────────────────────────────── */
export function PropertyDetail({ property, onBack, onWhatsApp, standalone }: Props) {
  const [gallery, setGallery] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const [descExpanded, setDescExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const headerRef = useRef<HTMLDivElement>(null);
  const descRef = useRef<HTMLDivElement>(null!);
  const specsRef = useRef<HTMLDivElement>(null!);
  const mapRef = useRef<HTMLDivElement>(null!);
  const highlightsRef = useRef<HTMLDivElement>(null!);
  const priceCardRef = useRef<HTMLDivElement>(null);
  const photoGridRef = useRef<HTMLDivElement>(null);

  useReveal(descRef);
  useReveal(specsRef);
  useReveal(mapRef);
  useReveal(highlightsRef);

  // Entrance animation on mount
  useEffect(() => {
    if (!headerRef.current) return;
    const children = Array.from(headerRef.current.children);
    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      const stagger = (mod as any).stagger;
      if (animate && stagger) {
        animate(children, {
          opacity: [0, 1],
          y: [20, 0],
          duration: 700,
          ease: 'outExpo',
          delay: stagger(80),
        });
      }
    });
  }, []);

  // Sticky bar logic via IntersectionObserver on price card
  useEffect(() => {
    const priceCard = priceCardRef.current;
    if (!priceCard) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.1 },
    );
    observer.observe(priceCard);
    return () => observer.disconnect();
  }, []);

  const defaultImages = [
    { url: '/montana.jpg', title: 'Vista del terreno', description: 'Vista espectacular del predio.' },
    { url: '/valle.jpg', title: 'Acceso principal', description: 'Carretera pavimentada de acceso.' },
    { url: '/tierra.jpg', title: 'Condiciones del suelo', description: 'Tierra fértil apta para construcción.' },
    { url: '/horizonte.jpg', title: 'Horizonte', description: 'Vista al horizonte al atardecer.' },
  ];
  const images = property.images?.length > 0 ? property.images : defaultImages;

  const phone = '9938-3699';
  const descLong = property.description.length > 300;
  const displayedDesc = descLong && !descExpanded
    ? property.description.slice(0, 300) + '...'
    : property.description;

  const pricePerVara = (() => {
    const varasNum = parseFloat(property.area_varas.replace(/[^0-9.]/g, ''));
    if (!varasNum || isNaN(varasNum)) return null;
    return Math.round(property.price / varasNum);
  })();

  const faqAnswers = {
    financing: property.financing
      ? `Sí, ofrecemos financiamiento directo con prima desde ${property.financing_prima || 20}%. Plazo hasta ${Math.round((property.financing_plazo_meses || 96) / 12)} años.`
      : 'Esta propiedad es solo contado. Contáctenos para conocer otras opciones.',
  };

  return (
    <div style={{ background: '#FAF8F3', minHeight: '100vh' }}>

      {/* Breadcrumb + share row */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: standalone ? '5.5rem 1.5rem 0' : '1.25rem 1.5rem 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Breadcrumb */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Inicio', onClick: onBack },
              { label: 'Propiedades', onClick: onBack },
              { label: property.departamento },
              { label: property.title.slice(0, 28) + (property.title.length > 28 ? '…' : '') },
            ].map((item, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: '#C9C2B1', fontSize: '0.8125rem' }}>/</span>}
                {item.onClick ? (
                  <button
                    onClick={item.onClick}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                      fontSize: '0.8125rem', color: '#9A9383', fontWeight: 500, padding: 0,
                      textDecoration: 'underline', textUnderlineOffset: 2,
                    }}
                  >
                    {item.label}
                  </button>
                ) : (
                  <span style={{
                    fontSize: '0.8125rem',
                    color: i === arr.length - 1 ? '#111113' : '#9A9383',
                    fontWeight: i === arr.length - 1 ? 600 : 500,
                  }}>
                    {item.label}
                  </span>
                )}
              </span>
            ))}
          </nav>

          {/* Share buttons */}
          <ShareBar property={property} />
        </div>
      </div>

      {/* Photo grid */}
      <div style={{ marginTop: '1rem' }} ref={photoGridRef}>
        <PhotoGrid
          images={images}
          onImageClick={(idx) => setGallery({ open: true, idx })}
        />
      </div>

      {/* Quick-stats strip */}
      <QuickStats property={property} />

      {/* Main content */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="detail-grid">

          {/* LEFT column */}
          <div style={{ minWidth: 0 }}>

            {/* Header: badges + title + location */}
            <div ref={headerRef} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid #E6E0D2' }}>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                {property.financing ? (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: '#D4B254', color: '#111113', fontSize: '0.75rem', fontWeight: 700 }}>
                    Financiamiento disponible
                  </span>
                ) : (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: '#111113', color: '#FAF8F3', fontSize: '0.75rem', fontWeight: 700 }}>
                    Solo contado
                  </span>
                )}
                {property.property_type === 'lotificadora' && (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, border: '1px solid #D4B254', color: '#8C6F1C', fontSize: '0.75rem', fontWeight: 700 }}>
                    {property.lotification_name || 'Lotificación'}
                  </span>
                )}
                <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: '#F3EFE6', color: '#5A5A63', fontSize: '0.75rem', fontWeight: 600 }}>
                  {property.type}
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
                color: '#111113', letterSpacing: '-0.03em', lineHeight: 1.1,
                margin: '0 0 0.75rem',
              }}>
                {property.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#5A5A63', fontSize: '0.9375rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {property.municipio}, {property.departamento}, Honduras
                {property.property_type === 'lotificadora' && property.available_lots && (
                  <>
                    <span style={{ color: '#E6E0D2', margin: '0 4px' }}>·</span>
                    <span style={{ color: '#4A7C59', fontWeight: 600 }}>{property.available_lots} lotes disponibles</span>
                  </>
                )}
              </div>

              {/* Apartado badge */}
              {property.status === 'apartado' && (
                <div style={{ marginTop: '0.875rem' }}>
                  <span style={{
                    padding: '0.4rem 0.875rem', borderRadius: 8,
                    background: '#FFF3CD', color: '#856404',
                    border: '1px solid #FFEAA7', fontSize: '0.8125rem', fontWeight: 600,
                    display: 'inline-block',
                  }}>
                    Apartado — consulte disponibilidad
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div ref={descRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E6E0D2' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '1rem' }}>
                Acerca de esta propiedad
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: '#36363D', margin: '0 0 0.75rem' }}>
                {displayedDesc}
              </p>
              {descLong && (
                <button
                  onClick={() => setDescExpanded(e => !e)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.875rem', fontWeight: 600, color: '#8C6F1C', padding: 0,
                    textDecoration: 'underline', textUnderlineOffset: 2,
                  }}
                >
                  {descExpanded ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>

            {/* Highlights */}
            {property.highlights?.length > 0 && (
              <div ref={highlightsRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E6E0D2' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '1.25rem' }}>
                  Lo que hace especial esta propiedad
                </h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="detail-highlights-grid">
                  {property.highlights.map(h => (
                    <li key={h} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '1rem 1.25rem', borderRadius: 14,
                      border: '1px solid #E6E0D2', background: '#fff',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#FAF8F3'; (e.currentTarget as HTMLElement).style.borderColor = '#D4B254'; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#fff'; (e.currentTarget as HTMLElement).style.borderColor = '#E6E0D2'; }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#FBF6E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#111113', lineHeight: 1.4 }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specs — tile grid */}
            <div ref={specsRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E6E0D2' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '1.25rem' }}>
                Ficha técnica
              </h2>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 8,
              }}>
                {[
                  { label: 'Área', value: `${property.area_varas} · ${property.area_m2}` },
                  ...(property.dimensions ? [{ label: 'Dimensiones', value: property.dimensions }] : []),
                  { label: 'Tipo', value: property.type },
                  { label: 'Municipio', value: property.municipio },
                  { label: 'Departamento', value: property.departamento },
                  ...(property.property_type === 'lotificadora' ? [
                    { label: 'Lotes totales', value: String(property.total_lots || 1) },
                    { label: 'Lotes disponibles', value: String(property.available_lots || 1) },
                  ] : []),
                  { label: 'Modalidad', value: property.financing ? 'Contado o financiado' : 'Solo contado' },
                  ...(property.financing && property.financing_prima ? [{ label: 'Prima mínima', value: `${property.financing_prima}%` }] : []),
                  ...(property.financing && property.financing_plazo_meses ? [{ label: 'Plazo', value: `Hasta ${Math.round(property.financing_plazo_meses / 12)} años` }] : []),
                  { label: 'Referencia', value: property.id.slice(0, 8).toUpperCase() },
                ].map(({ label, value }) => (
                  <div key={label} style={{
                    background: '#FAF8F3', borderRadius: 10, padding: '0.875rem 1rem',
                    border: '1px solid #F3EFE6',
                  }}>
                    <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.09em', textTransform: 'uppercase', color: '#9A9383', marginBottom: 4 }}>
                      {label}
                    </div>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111113', lineHeight: 1.3, fontFeatureSettings: "'tnum' 1" }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financing card */}
            {property.financing && (
              <div style={{
                marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E6E0D2',
              }}>
                <div style={{
                  background: 'rgba(212,178,84,0.07)', border: '1px solid rgba(212,178,84,0.2)',
                  borderRadius: 12, padding: '1.25rem',
                }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{
                      padding: '0.3rem 0.75rem', borderRadius: 999,
                      background: '#D4B254', color: '#111113',
                      fontSize: '0.75rem', fontWeight: 700,
                    }}>
                      Financiamiento disponible
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    {property.financing_prima && (
                      <div>
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C6F1C', marginBottom: 4 }}>Prima mínima</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111113' }}>{property.financing_prima}%</div>
                      </div>
                    )}
                    {property.financing_plazo_meses && (
                      <>
                        <div style={{ width: 1, background: 'rgba(212,178,84,0.3)', alignSelf: 'stretch' }} />
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C6F1C', marginBottom: 4 }}>Plazo</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111113' }}>hasta {Math.round(property.financing_plazo_meses / 12)} años</div>
                        </div>
                      </>
                    )}
                    {property.financing_tasa_anual && (
                      <>
                        <div style={{ width: 1, background: 'rgba(212,178,84,0.3)', alignSelf: 'stretch' }} />
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#8C6F1C', marginBottom: 4 }}>Tasa</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111113' }}>{property.financing_tasa_anual}% anual</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div ref={mapRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid #E6E0D2' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '1.25rem' }}>
                Ubicación aproximada
              </h2>
              <PropertyMap departamento={property.departamento} municipio={property.municipio} />
              <p style={{ fontSize: '0.8125rem', color: '#9A9383', marginTop: '0.75rem', lineHeight: 1.5 }}>
                Ubicado en {property.municipio}, {property.departamento}, Honduras. La ubicación exacta se comparte al confirmar su visita.
              </p>
            </div>

            {/* FAQ */}
            <div style={{ marginBottom: '2.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '1rem' }}>
                Preguntas frecuentes
              </h2>
              <FAQItem
                question="¿Cómo es el proceso de compra?"
                answer="Visitamos el terreno juntos, formalizamos la reserva y acompañamos el trámite de escritura con notario."
              />
              <FAQItem
                question="¿Es posible financiar?"
                answer={faqAnswers.financing}
              />
              <FAQItem
                question="¿Puedo visitar el terreno?"
                answer="Sí, coordinamos visitas de lunes a sábado. Contáctenos por WhatsApp para agendar sin costo."
              />
            </div>

          </div>

          {/* RIGHT — sticky price card */}
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'sticky', top: 96 }}>
              <div
                ref={priceCardRef}
                style={{
                  background: '#fff',
                  borderRadius: 20,
                  border: '1px solid #E6E0D2',
                  padding: '1.75rem',
                  boxShadow: '0 8px 32px -8px rgba(17,17,19,0.12), 0 2px 8px rgba(17,17,19,0.06)',
                }}
              >
                {/* Price */}
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid #F3EFE6' }}>
                  <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9383', marginBottom: 6 }}>
                    Precio
                  </div>
                  {property.discount_price ? (
                    <>
                      <div style={{ fontSize: '0.875rem', color: '#E53E3E', textDecoration: 'line-through', opacity: 0.7 }}>
                        {formatPrice(property.price, property.currency)}
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111113', letterSpacing: '-0.03em', fontFeatureSettings: "'tnum' 1" }}>
                        {formatPrice(property.discount_price, property.currency)}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111113', letterSpacing: '-0.03em', fontFeatureSettings: "'tnum' 1" }}>
                      {formatPrice(property.price, property.currency)}
                    </div>
                  )}
                  {/* Price per vara */}
                  {pricePerVara !== null && (
                    <div style={{ fontSize: '0.8125rem', color: '#9A9383', marginTop: 4 }}>
                      {property.currency} {pricePerVara.toLocaleString('en-US')} / vara²
                    </div>
                  )}
                  {property.financing && (
                    <div style={{ marginTop: 8, padding: '0.625rem 0.875rem', borderRadius: 10, background: '#FBF6E9', border: '1px solid #F2E4B8' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8C6F1C' }}>
                        Prima desde {property.financing_prima || 20}% ·{' '}
                        {property.financing_plazo_meses ? Math.round(property.financing_plazo_meses / 12) : 8} años plazo
                      </span>
                    </div>
                  )}
                </div>

                {/* CTAs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    onClick={() => onWhatsApp(property)}
                    style={{
                      width: '100%', padding: '1rem',
                      background: '#25D366', border: 'none', borderRadius: 12,
                      color: '#fff', fontSize: '1rem', fontWeight: 700,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                      boxShadow: '0 4px 16px rgba(37,211,102,0.3)',
                      transition: 'background 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#1DB954'; e.currentTarget.style.transform = 'scale(1.02)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    <WhatsAppIcon size={20} />
                    Consultar por WhatsApp
                  </button>

                  <a
                    href={`tel:${phone.replace(/-/g, '')}`}
                    style={{
                      width: '100%', padding: '0.875rem',
                      border: '1.5px solid #E6E0D2', borderRadius: 12,
                      color: '#111113', fontSize: '0.9375rem', fontWeight: 600,
                      cursor: 'pointer', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      textDecoration: 'none', background: '#fff',
                      transition: 'border-color 0.2s, background 0.2s',
                      boxSizing: 'border-box',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#111113'; (e.currentTarget as HTMLElement).style.background = '#FAF8F3'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = '#E6E0D2'; (e.currentTarget as HTMLElement).style.background = '#fff'; }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13 19.79 19.79 0 0 1 1.27 4.37 2 2 0 0 1 3.24 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
                    </svg>
                    Llamar: {phone}
                  </a>
                </div>

                {/* Trust note */}
                <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#9A9383', lineHeight: 1.5 }}>
                    Sin compromiso · Respuesta en minutos<br />
                    <span style={{ color: '#D4B254', fontWeight: 600 }}>Escrituración verificada ✓</span>
                  </div>
                </div>

                {/* Share compact */}
                <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid #F3EFE6' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#9A9383', marginBottom: '0.625rem', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    Compartir esta propiedad
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => {
                        const url = typeof window !== 'undefined' ? window.location.href : '';
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
                        if (typeof window !== 'undefined') {
                          navigator.clipboard.writeText(window.location.href);
                        }
                      }}
                      style={{
                        flex: 1, padding: '0.5rem', borderRadius: 8,
                        background: '#F3EFE6', border: '1px solid #E6E0D2',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        fontSize: '0.75rem', fontWeight: 600, color: '#5A5A63', fontFamily: 'inherit',
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
                border: '1px solid #E6E0D2', borderRadius: 16, background: '#fff',
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
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#111113' }}>A&amp;A Inmobiliaria</div>
                    <div style={{ fontSize: '0.75rem', color: '#9A9383' }}>Agente verificado · El Progreso, Yoro</div>
                  </div>
                </div>
                <div style={{ marginTop: '0.875rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {['Respuesta rápida', 'Verificado', 'Escrituración'].map(tag => (
                    <span key={tag} style={{
                      padding: '0.25rem 0.625rem', borderRadius: 999,
                      background: '#F3EFE6', color: '#5A5A63',
                      fontSize: '0.6875rem', fontWeight: 600,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile sticky CTA bar */}
      <div
        className="sticky-cta-bar"
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: '#fff', borderTop: '1px solid #E6E0D2',
          padding: '0.875rem 1rem',
          boxShadow: '0 -4px 20px rgba(17,17,19,0.08)',
          alignItems: 'center', justifyContent: 'space-between', gap: 12,
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: '#9A9383', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Precio</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: '#111113', fontFeatureSettings: "'tnum' 1" }}>
            {formatPrice(property.discount_price ?? property.price, property.currency)}
          </div>
        </div>
        <button
          onClick={() => onWhatsApp(property)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0.75rem 1.25rem', borderRadius: 12,
            background: '#25D366', border: 'none',
            color: '#fff', fontSize: '0.9375rem', fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
          }}
        >
          <WhatsAppIcon size={18} />
          Consultar
        </button>
      </div>

      {/* Gallery lightbox */}
      {gallery.open && (
        <GalleryModal
          images={images}
          startIdx={gallery.idx}
          onClose={() => setGallery({ open: false, idx: 0 })}
        />
      )}

      <style>{`
        @media (min-width: 1024px) {
          .detail-grid {
            grid-template-columns: 1.55fr 1fr !important;
          }
        }
        @media (max-width: 1023px) {
          .sticky-cta-bar {
            display: flex !important;
          }
        }
        @media (max-width: 767px) {
          .photo-mobile-only { display: block !important; }
          .photo-desktop-only { display: none !important; }
        }
        @media (min-width: 768px) {
          .photo-mobile-only { display: none !important; }
          .photo-desktop-only { display: grid !important; }
        }
        @media (max-width: 640px) {
          .detail-highlights-grid {
            grid-template-columns: 1fr !important;
          }
          .quick-stats-strip {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .faq-content {
          transition: max-height 0.3s ease, opacity 0.3s ease;
        }
      `}</style>
    </div>
  );
}
