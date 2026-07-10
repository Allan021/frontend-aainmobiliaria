import { useEffect, useRef, useState } from 'react';
import { WhatsAppButton } from '../shared/WhatsAppButton';
import { useHondurasData } from '../../hooks/useHondurasData';
import { SelectField } from '../shared/SelectField';

interface Props {
  onWhatsApp?: () => void;
  onExplore?: (filters?: { dep?: string; pay?: string; type?: string }) => void;
  theme?: 'light' | 'dark';
}

const STATS = [
  {
    num: '50+', numTarget: 50, suffix: '+', label: 'Propiedades activas',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    num: '200+', numTarget: 200, suffix: '+', label: 'Clientes satisfechos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    num: '8 años', numTarget: 8, suffix: ' años', label: 'De experiencia',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    num: '4.9★', numTarget: 4.9, suffix: '★', label: 'Valoración promedio',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ),
  },
];

const PIN_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9383" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const CARD_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9383" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const HOME_ICON = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9A9383" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);


function FieldLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
      {icon}
      <span style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#5A5A63' }}>
        {label}
      </span>
    </div>
  );
}

const PAY_OPTIONS = [
  { value: '', label: 'Cualquier modalidad' },
  { value: 'financing', label: 'Con financiamiento' },
  { value: 'cash', label: 'Solo contado' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'Todo tipo' },
  { value: 'terreno', label: 'Terreno' },
  { value: 'lote', label: 'Lote' },
  { value: 'lotificacion', label: 'Lotificación' },
  { value: 'casa', label: 'Casa' },
];

function SearchBar({ onSearch, theme = 'light' }: { onSearch: (f: { dep?: string; pay?: string; type?: string }) => void; theme?: 'light' | 'dark' }) {
  const [dep, setDep] = useState('');
  const [pay, setPay] = useState('');
  const [type, setType] = useState('');
  const { departamentos } = useHondurasData();

  const depOptions = [
    { value: '', label: 'Todos los departamentos' },
    ...departamentos.map(d => ({ value: String(d.id), label: d.nombre })),
  ];

  const divider = '1px solid #EDE7D9';

  return (
    <>
      {/* Desktop pill */}
      <div className="hero-search-desktop" style={{
        display: 'flex', flexDirection: 'row', alignItems: 'stretch',
        background: '#FFFFFF', borderRadius: 999,
        boxShadow: '0 12px 40px -8px rgba(17,17,19,0.30), 0 2px 8px rgba(17,17,19,0.08)',
        maxWidth: 780, width: '100%',
        border: '1px solid rgba(230,224,210,0.7)',
      }}>
        <div style={{ flex: 1.2, padding: '0.9rem 1.4rem', borderRight: divider, minWidth: 0 }}>
          <FieldLabel icon={PIN_ICON} label="Departamento" />
          <SelectField options={depOptions} value={dep} onChange={setDep} placeholder="Todos los departamentos" theme={theme} fontSize="0.9375rem" />
        </div>
        <div style={{ flex: 1, padding: '0.9rem 1.4rem', borderRight: divider, minWidth: 0 }}>
          <FieldLabel icon={CARD_ICON} label="Tipo de pago" />
          <SelectField options={PAY_OPTIONS} value={pay} onChange={setPay} placeholder="Cualquier modalidad" theme={theme} fontSize="0.9375rem" />
        </div>
        <div style={{ flex: 1, padding: '0.9rem 1.4rem', borderRight: divider, minWidth: 0 }}>
          <FieldLabel icon={HOME_ICON} label="Propiedad" />
          <SelectField options={TYPE_OPTIONS} value={type} onChange={setType} placeholder="Todo tipo" theme={theme} fontSize="0.9375rem" />
        </div>
        <div style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => onSearch({ dep: dep || undefined, pay: pay || undefined, type: type || undefined })}
            style={{
              width: 54, height: 54, borderRadius: '50%',
              background: '#D4B254', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, transform 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B8962E'; e.currentTarget.style.transform = 'scale(1.06)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D4B254'; e.currentTarget.style.transform = 'scale(1)'; }}
            aria-label="Buscar propiedades"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111113" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile card */}
      <div className="hero-search-mobile" style={{
        display: 'none', flexDirection: 'column', background: '#FFFFFF',
        borderRadius: '1.5rem',
        boxShadow: '0 12px 40px -8px rgba(17,17,19,0.30), 0 2px 8px rgba(17,17,19,0.08)',
        width: '100%', maxWidth: 420,
        border: '1px solid rgba(230,224,210,0.7)',
      }}>
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: divider }}>
          <FieldLabel icon={PIN_ICON} label="Departamento" />
          <SelectField options={depOptions} value={dep} onChange={setDep} placeholder="Todos los departamentos" theme={theme} fontSize="0.875rem" />
        </div>
        <div className="hero-filter-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: divider }}>
          <div style={{ padding: '0.875rem 1.25rem', borderRight: divider }}>
            <FieldLabel icon={CARD_ICON} label="Tipo de pago" />
            <SelectField options={PAY_OPTIONS} value={pay} onChange={setPay} placeholder="Cualquier tipo" theme={theme} fontSize="0.875rem" />
          </div>
          <div style={{ padding: '0.875rem 1.25rem' }}>
            <FieldLabel icon={HOME_ICON} label="Propiedad" />
            <SelectField options={TYPE_OPTIONS} value={type} onChange={setType} placeholder="Todo tipo" theme={theme} fontSize="0.875rem" />
          </div>
        </div>
        <div style={{ padding: '0.75rem 1.25rem' }}>
          <button
            onClick={() => onSearch({ dep: dep || undefined, pay: pay || undefined, type: type || undefined })}
            style={{
              width: '100%', height: 52, borderRadius: 999,
              background: '#D4B254', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              fontFamily: 'inherit', fontSize: '0.9375rem', fontWeight: 700, color: '#111113',
              transition: 'background 0.2s, transform 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#B8962E'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D4B254'; }}
            aria-label="Buscar propiedades"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#111113" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
            Buscar propiedades
          </button>
        </div>
      </div>
    </>
  );
}

export function Hero({ onWhatsApp, onExplore, theme = 'light' }: Props) {
  const contentRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);

  const handleWhatsApp = () => {
    if (onWhatsApp) {
      onWhatsApp();
    } else {
      window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
    }
  };

  const handleExplore = (filters?: { dep?: string; pay?: string; type?: string }) => {
    if (onExplore) {
      onExplore(filters);
    } else {
      const params = new URLSearchParams();
      if (filters?.dep) params.set('dep', filters.dep);
      if (filters?.pay) params.set('pay', filters.pay);
      if (filters?.type) params.set('type', filters.type);
      window.location.href = `/propiedades?${params.toString()}`;
    }
  };

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      // Skip animation, just show elements
      document.querySelectorAll('.ha, .hs').forEach(el => {
        (el as HTMLElement).style.opacity = '1';
        (el as HTMLElement).style.transform = 'none';
      });
      if (searchRef.current) {
        searchRef.current.style.opacity = '1';
        searchRef.current.style.transform = 'none';
      }
      return;
    }

    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      const stagger = (mod as any).stagger;
      if (!animate || !stagger) return;

      if (contentRef.current) {
        const els = contentRef.current.querySelectorAll('.ha');
        animate(els, {
          opacity: [0, 1],
          y: [44, 0],
          duration: 900,
          ease: 'outExpo',
          delay: stagger(120),
        });
      }

      if (searchRef.current) {
        animate(searchRef.current, {
          opacity: [0, 1],
          y: [30, 0],
          duration: 750,
          ease: 'outExpo',
          delay: 580,
        });
      }

      if (statsRef.current) {
        const els = statsRef.current.querySelectorAll('.hs');
        animate(els, {
          opacity: [0, 1],
          y: [12, 0],
          duration: 480,
          ease: 'outQuad',
          delay: stagger(80, { start: 850 }),
        });

        // Counter animation for stat numbers
        const numEls = statsRef.current.querySelectorAll('.stat-num');
        numEls.forEach((el: Element, idx: number) => {
          const htmlEl = el as HTMLElement;
          const target = parseFloat(htmlEl.dataset.target || '0');
          const suffix = htmlEl.dataset.suffix || '';
          const isDecimal = target % 1 !== 0;
          const obj = { val: 0 };

          animate(obj, {
            val: target,
            duration: 1400,
            ease: 'outExpo',
            delay: 1100 + idx * 120,
            onUpdate: () => {
              htmlEl.textContent = (isDecimal ? obj.val.toFixed(1) : Math.round(obj.val).toString()) + suffix;
            },
          });
        });
      }
    });
  }, []);

  return (
    <section style={{ position: 'relative', minHeight: '100svh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Pure CSS background — zero network requests, lightweight, premium look */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          radial-gradient(circle at 50% -20%, rgba(212, 178, 84, 0.15) 0%, transparent 70%),
          radial-gradient(circle at 10% 40%, rgba(37, 211, 102, 0.04) 0%, transparent 50%),
          radial-gradient(circle at 90% 80%, rgba(212, 178, 84, 0.06) 0%, transparent 60%),
          linear-gradient(180deg, #111113 0%, #0A0A0B 100%)
        `,
      }} />

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '8rem 1.5rem 5rem',
      }} className="hero-content">
        <div ref={contentRef} style={{ width: '100%', maxWidth: 800, margin: '0 auto' }}>

          {/* Eyebrow badge */}
          <div className="ha" style={{
            opacity: 0,
            display: 'inline-flex', alignItems: 'center', gap: 10,
            marginBottom: '2rem',
            padding: '0.4rem 1.1rem 0.4rem 0.75rem', borderRadius: 999,
            background: 'rgba(212,178,84,0.12)',
            border: '1px solid rgba(212,178,84,0.30)',
            backdropFilter: 'blur(12px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%', background: '#D4B254',
                boxShadow: '0 0 8px rgba(212,178,84,0.7)',
                animation: 'aa-pulse 2.2s ease-in-out infinite',
              }} />
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#D4B254' }}>
              A&amp;A Inmobiliaria · El Progreso, Honduras
            </span>
          </div>

          {/* Headline */}
          <h1
            className="ha"
            style={{
              opacity: 0,
              fontSize: 'clamp(44px, 7.5vw, 92px)',
              fontWeight: 800,
              lineHeight: 0.95,
              letterSpacing: '-0.038em',
              color: '#FAF8F3',
              marginBottom: '1.5rem',
            }}
          >
            Tu propiedad.<br />
            <span style={{
              color: '#D4B254',
              textShadow: '0 0 60px rgba(212,178,84,0.22)',
            }}>Nuestra misión.</span>
          </h1>

          {/* Subtitle */}
          <p
            className="ha"
            style={{
              opacity: 0,
              fontSize: 'clamp(15px, 2vw, 18px)',
              lineHeight: 1.7,
              fontWeight: 400,
              color: '#C9C2B1',
              maxWidth: 520,
              margin: '0 auto 2.75rem',
            }}
          >
            Terrenos, lotes y lotificaciones en Yoro y los departamentos más buscados de Honduras.
            Le acompañamos desde la primera visita hasta la escritura.
          </p>
        </div>

        {/* Search bar */}
        <div ref={searchRef} style={{ opacity: 0, width: '100%', display: 'flex', justifyContent: 'center', padding: '0 1rem' }}>
          <SearchBar onSearch={handleExplore} theme={theme} />
        </div>

        {/* WhatsApp link */}
        <WhatsAppButton
          onClick={handleWhatsApp}
          size="md"
          label="O contáctenos por WhatsApp"
          style={{ marginTop: '1.5rem', padding: '0.625rem 1.375rem' }}
        />

      </div>

      {/* Stats strip */}
      <div
        ref={statsRef}
        style={{
          position: 'relative', zIndex: 1,
          background: 'rgba(10,10,11,0.75)',
          backdropFilter: 'blur(28px) saturate(130%)',
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          maxWidth: 1280, margin: '0 auto', padding: '1.5rem 1.5rem',
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem',
        }} className="stats-grid">
          {STATS.map(s => (
            <div key={s.label} className="hs" style={{ opacity: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ color: 'rgba(212,178,84,0.65)' }}>
                {s.icon}
              </div>
              <div
                className="stat-num"
                data-target={s.numTarget}
                data-suffix={s.suffix}
                style={{ fontSize: '1.625rem', fontWeight: 800, color: '#D4B254', lineHeight: 1, fontFeatureSettings: "'tnum' 1" }}
              >
                0{s.suffix}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#9A9383', fontWeight: 500, letterSpacing: '0.04em' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>



    </section>
  );
}
