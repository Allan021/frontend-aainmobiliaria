import { useState, useEffect, useRef } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { Header } from '../layout/Header';
import { Footer } from '../layout/Footer';
import { Hero } from './Hero';
import { PropertyCard } from './PropertyCard';
import { FilterBar } from './FilterBar';
import { PropertyDetail } from './PropertyDetail';
import { WhatsAppModal } from './WhatsAppModal';
import { WhatsAppButton } from '../shared/WhatsAppButton';
import { useProperties } from '../../hooks/useProperties';
import type { Property } from '../../../core/domain/entities/types';

/* ── Public theme hook ──────────────────────────────────────── */
function usePublicTheme() {
  const stored = typeof window !== 'undefined'
    ? (localStorage.getItem('aa_pub_theme') as 'light' | 'dark') || 'light'
    : 'light';
  const [theme, setTheme] = useState<'light' | 'dark'>(stored);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('aa_pub_theme', theme);
  }, [theme]);

  // On mount, sync with stored value
  useEffect(() => {
    const t = (localStorage.getItem('aa_pub_theme') as 'light' | 'dark') || 'light';
    setTheme(t);
    document.documentElement.setAttribute('data-theme', t);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
  return { theme, toggleTheme };
}

/* ── WhatsApp FAB ───────────────────────────────────────────── */
export function WhatsAppFAB({ onClick }: { onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
    }
  };

  // Show tooltip after 4s on first visit
  useEffect(() => {
    const seen = sessionStorage.getItem('fab_tooltip_seen');
    if (seen) return;
    const t = setTimeout(() => {
      setShowTooltip(true);
      sessionStorage.setItem('fab_tooltip_seen', '1');
      setTimeout(() => setShowTooltip(false), 4000);
    }, 4000);
    return () => clearTimeout(t);
  }, []);

  // Entrance animation
  useEffect(() => {
    if (!fabRef.current) return;
    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      if (!animate) return;
      animate(fabRef.current, {
        scale: [0, 1],
        opacity: [0, 1],
        duration: 600,
        ease: 'outBack',
        delay: 1200,
      });
    });
  }, []);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
      {/* Tooltip bubble */}
      <div style={{
        background: '#fff',
        border: '1px solid #E6E0D2',
        borderRadius: 12,
        padding: '0.625rem 1rem',
        boxShadow: '0 8px 24px rgba(17,17,19,0.12)',
        fontSize: '0.8125rem', fontWeight: 600, color: '#111113',
        whiteSpace: 'nowrap',
        transition: 'opacity 0.3s, transform 0.3s',
        opacity: showTooltip ? 1 : 0,
        transform: showTooltip ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.95)',
        pointerEvents: 'none',
        transformOrigin: 'bottom right',
      }}>
        ¿Preguntas? Escribanos 💬
        <div style={{
          position: 'absolute', bottom: -6, right: 20,
          width: 12, height: 12, background: '#fff',
          borderRight: '1px solid #E6E0D2', borderBottom: '1px solid #E6E0D2',
          transform: 'rotate(45deg)',
        }} />
      </div>

      {/* FAB */}
      <button
        ref={fabRef}
        onClick={handleClick}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
        aria-label="Contactar por WhatsApp"
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          height: 56,
          paddingLeft: expanded ? '1.25rem' : '1rem',
          paddingRight: '1rem',
          borderRadius: 999,
          background: '#25D366',
          border: 'none', cursor: 'pointer',
          boxShadow: '0 6px 28px rgba(37,211,102,0.50), 0 2px 10px rgba(0,0,0,0.20)',
          transition: 'padding 0.3s cubic-bezier(0.22,1,0.36,1), box-shadow 0.2s',
          overflow: 'hidden',
          opacity: 0, // will be animated in
          scale: '0',
        }}
        onFocus={() => setExpanded(true)}
        onBlur={() => setExpanded(false)}
      >
        {/* Pulse ring */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <div style={{
            position: 'absolute',
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(37,211,102,0.3)',
            animation: 'fab-pulse 2.5s ease-out infinite',
          }} />
          <svg width="28" height="28" viewBox="0 0 24 24" fill="#fff" style={{ position: 'relative', zIndex: 1, flexShrink: 0 }}>
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        </div>

        {/* Expandable label */}
        <span style={{
          color: '#fff',
          fontSize: '0.9375rem',
          fontWeight: 700,
          whiteSpace: 'nowrap',
          maxWidth: expanded ? 160 : 0,
          overflow: 'hidden',
          opacity: expanded ? 1 : 0,
          transition: 'max-width 0.3s cubic-bezier(0.22,1,0.36,1), opacity 0.2s',
          display: 'block',
        }}>
          Consultar ahora
        </span>
      </button>

      <style>{`
        @keyframes fab-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

/* ── Stagger grid animation ────────────────────────────────── */
function useStaggerCards(containerRef: React.RefObject<Element | null>, deps: unknown[]) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = Array.from(container.querySelectorAll('.prop-card'));
    if (!cards.length) return;

    // Set initial state
    cards.forEach((c: Element) => {
      (c as HTMLElement).style.opacity = '0';
      (c as HTMLElement).style.transform = 'translateY(28px)';
    });

    import('animejs').then(mod => {
      const animate = (mod as any).animate;
      const stagger = (mod as any).stagger;
      if (!animate || !stagger) return;
      animate(cards, {
        opacity: [0, 1],
        y: [28, 0],
        duration: 550,
        ease: 'outExpo',
        delay: stagger(65),
      });
    });
  }, deps);
}

/* ── Section reveal ─────────────────────────────────────────── */
function useReveal(ref: React.RefObject<Element | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      import('animejs').then(mod => {
        const animate = (mod as any).animate;
        const stagger = (mod as any).stagger;
        if (!animate) return;
        const children = el.querySelectorAll('.reveal-child');
        if (children.length) {
          animate(children, { opacity: [0, 1], y: [24, 0], duration: 600, ease: 'outExpo', delay: stagger(80) });
        } else {
          animate(el, { opacity: [0, 1], y: [24, 0], duration: 600, ease: 'outExpo' });
        }
      });
      obs.unobserve(el);
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
}

/* ── Featured section ───────────────────────────────────────── */
function FeaturedSectionInner({ onOpen, onWhatsApp, onExplore }: { onOpen?: (p: Property) => void; onWhatsApp?: (p: Property) => void; onExplore?: () => void }) {
  const { data } = useProperties({ limit: 3 });
  const properties = data?.data || [];
  const gridRef = useRef<HTMLDivElement>(null!);
  const titleRef = useRef<HTMLDivElement>(null!);

  const handleOpen = (p: Property) => {
    if (onOpen) onOpen(p);
    else window.location.href = `/propiedad/${p.id}`;
  };

  const handleWhatsApp = (p: Property) => {
    if (onWhatsApp) onWhatsApp(p);
    else window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: p } }));
  };

  const handleExplore = () => {
    if (onExplore) onExplore();
    else window.location.href = '/propiedades';
  };

  useReveal(titleRef);
  useStaggerCards(gridRef, [properties.length]);

  return (
    <section style={{ padding: '5rem 1.5rem', background: '#FAF8F3' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div ref={titleRef} style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', opacity: 0, gap: '1.5rem', flexWrap: 'wrap' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#111113', lineHeight: 1.08, margin: 0, maxWidth: 560 }}>
            Seleccionadas esta semana, escrituradas y listas.
          </h2>
          <button
            onClick={handleExplore}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '0.75rem 1.25rem', borderRadius: 999,
              border: '1.5px solid #111113', background: 'transparent',
              color: '#111113', fontSize: '0.875rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'background 0.18s, color 0.18s',
              flexShrink: 0,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#111113'; e.currentTarget.style.color = '#FAF8F3'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#111113'; }}
          >
            Ver todas
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {properties.map((p, i) => (
            <div key={p.id} className="prop-card">
              <PropertyCard property={p} onOpen={handleOpen} onWhatsApp={handleWhatsApp} animDelay={i * 65} />
            </div>
          ))}
          {properties.length === 0 && [1, 2, 3].map(i => (
            <div key={i} style={{ borderRadius: 16, border: '1px solid #E6E0D2', overflow: 'hidden', background: '#fff' }}>
              <div style={{ aspectRatio: '4/3', background: 'linear-gradient(90deg, #F3EFE6 25%, #FAF8F3 50%, #F3EFE6 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
              <div style={{ padding: '1rem' }}>
                <div style={{ height: 12, background: '#F3EFE6', borderRadius: 6, marginBottom: 8, width: '60%' }} />
                <div style={{ height: 20, background: '#F3EFE6', borderRadius: 6, marginBottom: 8 }} />
                <div style={{ height: 12, background: '#F3EFE6', borderRadius: 6, width: '80%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </section>
  );
}

export function FeaturedSection(props: { onOpen?: (p: Property) => void; onWhatsApp?: (p: Property) => void; onExplore?: () => void }) {
  return (
    <QueryProvider>
      <FeaturedSectionInner {...props} />
    </QueryProvider>
  );
}

/* ── Trust band ─────────────────────────────────────────────── */
export function TrustBand({ ref: _ref }: { ref?: React.Ref<HTMLElement> }) {
  const sectionRef = useRef<HTMLElement>(null!);
  useReveal(sectionRef);

  const items = [
    {
      num: '01',
      title: 'Escrituración verificada',
      body: 'Revisamos cada propiedad en el Instituto de la Propiedad antes de publicarla.',
    },
    {
      num: '02',
      title: 'Financiamiento a la medida',
      body: 'Planes desde 20% de prima y hasta 8 años en propiedades elegibles.',
    },
    {
      num: '03',
      title: 'Acompañamiento completo',
      body: 'Le acompañamos desde la primera visita hasta la firma de escritura.',
    },
  ];

  return (
    <section ref={sectionRef} style={{ padding: '5rem 1.5rem', background: '#111113', color: '#FAF8F3' }}>
      <div className="tb-inner">
        {/* Left: heading — sticks while right list scrolls past on desktop */}
        <div className="reveal-child tb-left" style={{ opacity: 0 }}>
          <h2 style={{ fontSize: 'clamp(26px, 3vw, 44px)', fontWeight: 800, letterSpacing: '-0.03em', color: '#FAF8F3', lineHeight: 1.1, margin: '0 0 1.25rem' }}>
            Una compra sin sorpresas, con el rigor que merece su patrimonio.
          </h2>
          <p style={{ fontSize: '0.9375rem', color: '#6B6459', lineHeight: 1.7, margin: 0 }}>
            A&amp;A Inmobiliaria — El Progreso, Yoro.
          </p>
        </div>

        {/* Right: numbered list with hairline dividers */}
        <div className="tb-right">
          {items.map((item, i) => (
            <div
              key={i}
              className="reveal-child"
              style={{
                opacity: 0,
                display: 'flex',
                gap: '1.75rem',
                alignItems: 'flex-start',
                padding: '2rem 0',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <span style={{
                fontSize: '0.6875rem', fontWeight: 700, color: '#D4B254',
                letterSpacing: '0.1em', paddingTop: '0.3125rem',
                flexShrink: 0, minWidth: 22,
              }}>
                {item.num}
              </span>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#FAF8F3', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: '#6B6459', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
      </div>

      <style>{`
        .tb-inner {
          max-width: 1280px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr;
          gap: 2.5rem;
        }
        @media (min-width: 768px) {
          .tb-inner {
            grid-template-columns: 1fr 1fr;
            gap: 5rem;
            align-items: start;
          }
          .tb-left {
            position: sticky;
            top: 5rem;
          }
        }
      `}</style>
    </section>
  );
}

/* ── CTA section ────────────────────────────────────────────── */
export function CTASection({ onWhatsApp }: { onWhatsApp?: () => void }) {
  const ref = useRef<HTMLElement>(null!);
  useReveal(ref);

  const handleWhatsApp = () => {
    if (onWhatsApp) onWhatsApp();
    else window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
  };

  return (
    <section ref={ref} style={{ padding: '5rem 1.5rem', background: '#FAF8F3' }}>
      <div style={{
        maxWidth: 760, margin: '0 auto', textAlign: 'center',
        padding: '3.5rem', borderRadius: 24,
        background: 'linear-gradient(135deg, #111113 0%, #1A1A1D 100%)',
        border: '1px solid #26262B',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Gold glow */}
        <div style={{
          position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)',
          width: 300, height: 200,
          background: 'radial-gradient(ellipse, rgba(212,178,84,0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="reveal-child" style={{ opacity: 0, position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(24px, 3.5vw, 38px)', fontWeight: 800, color: '#FAF8F3', letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1rem' }}>
            Su próxima propiedad le espera en Honduras.
          </h2>
          <p style={{ fontSize: '1rem', color: '#9A9383', lineHeight: 1.65, marginBottom: '2rem', maxWidth: 480, margin: '0 auto 2rem' }}>
            Hable con nuestro equipo hoy. Sin compromiso, respuesta en minutos.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <WhatsAppButton
              onClick={handleWhatsApp}
              size="xl"
              label="Contactar por WhatsApp"
              style={{ padding: '0.875rem 1.75rem' }}
            />
            <a
              href="tel:99383699"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '0.875rem 1.75rem', borderRadius: 999,
                border: '1.5px solid rgba(255,255,255,0.15)',
                color: '#FAF8F3', fontSize: '1rem', fontWeight: 600,
                textDecoration: 'none', transition: 'border-color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.4)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.36 13 19.79 19.79 0 0 1 1.27 4.37 2 2 0 0 1 3.24 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z" />
              </svg>
              Llamar ahora
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Catalog view ───────────────────────────────────────────── */
function CatalogViewInner({
  initialFilters,
  onOpen,
  onWhatsApp,
}: {
  initialFilters?: { dep?: string; pay?: string; type?: string };
  onOpen?: (p: Property) => void;
  onWhatsApp?: (p: Property) => void;
}) {
  const [filters, setFilters] = useState<{ dep?: string; pay?: string; type?: string }>(initialFilters || {});
  const { data, isLoading } = useProperties({ dep: filters.dep, pay: filters.pay });

  const handleOpen = (p: Property) => {
    if (onOpen) onOpen(p);
    else window.location.href = `/propiedad/${p.id}`;
  };

  const handleWhatsApp = (p: Property) => {
    if (onWhatsApp) onWhatsApp(p);
    else window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: p } }));
  };
  const rawProperties = data?.data || [];
  const properties = filters.type
    ? rawProperties.filter((p: any) => p.property_type === filters.type)
    : rawProperties;
  const gridRef = useRef<HTMLDivElement>(null!);

  const heading = filters.type === 'lotificadora' ? 'Lotificaciones en Honduras' : 'Propiedades en Honduras';
  const subtext = filters.type === 'lotificadora'
    ? 'Proyectos de lotificación verificados, con lotes individuales disponibles.'
    : 'Terrenos, lotes y casas verificadas en Honduras.';

  useStaggerCards(gridRef, [properties.length, filters.dep, filters.pay]);

  return (
    <div style={{ background: '#FAF8F3', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: 'clamp(30px, 5vw, 50px)', fontWeight: 800, letterSpacing: '-0.035em', color: '#111113', margin: '0 0 0.375rem' }}>
            {heading}
          </h1>
          <p style={{ fontSize: '1rem', color: '#9A9383', margin: 0 }}>
            {subtext}
          </p>
        </div>

        {/* Filter bar */}
        <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #E6E0D2', padding: '1.25rem 1.5rem', marginBottom: '2rem', boxShadow: '0 2px 8px rgba(17,17,19,0.04)' }}>
          <FilterBar filters={filters} setFilters={setFilters} />
        </div>

        {/* Count */}
        <div style={{ fontSize: '0.875rem', color: '#9A9383', fontWeight: 500, marginBottom: '1.5rem' }}>
          {isLoading
            ? 'Buscando…'
            : `${properties.length} ${properties.length === 1 ? 'resultado' : 'resultados'}`}
        </div>

        {/* Grid */}
        <div ref={gridRef} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {properties.map(p => (
            <div key={p.id} className="prop-card">
              <PropertyCard property={p} onOpen={handleOpen} onWhatsApp={handleWhatsApp} />
            </div>
          ))}
          {!isLoading && properties.length === 0 && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem 1rem' }}>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111113', marginBottom: '0.5rem' }}>
                Sin resultados
              </div>
              <p style={{ color: '#9A9383', marginBottom: '1.5rem', fontSize: '0.9375rem' }}>
                Intente cambiar los filtros para ver más opciones.
              </p>
              <button
                onClick={() => setFilters({})}
                style={{ padding: '0.75rem 1.5rem', borderRadius: 999, background: '#111113', color: '#FAF8F3', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
              >
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function CatalogView(props: {
  initialFilters?: { dep?: string; pay?: string; type?: string };
  onOpen?: (p: Property) => void;
  onWhatsApp?: (p: Property) => void;
}) {
  return (
    <QueryProvider>
      <CatalogViewInner {...props} />
    </QueryProvider>
  );
}

/* ── About page ─────────────────────────────────────────────── */
export function AboutPage() {
  const heroRef = useRef<HTMLDivElement>(null!);
  const processRef = useRef<HTMLElement>(null!);
  useReveal(heroRef);
  useReveal(processRef);

  const steps = [
    {
      num: '01',
      title: 'Verificamos antes de publicar',
      body: 'Revisamos escritura en el Instituto de la Propiedad. Si hay un problema legal, la propiedad no entra al catálogo.',
    },
    {
      num: '02',
      title: 'Fotografía y documentación completa',
      body: 'Visitamos cada predio, tomamos fotografías y levantamos la ficha técnica con datos de área, precio y condiciones.',
    },
    {
      num: '03',
      title: 'Acompañamiento hasta la firma',
      body: 'Coordinamos visitas, negociación y escrituración. Estamos en cada paso, desde el primer contacto hasta la entrega.',
    },
  ];

  return (
    <div style={{ background: '#FAF8F3' }}>
      {/* Hero */}
      <div ref={heroRef} style={{ maxWidth: 920, margin: '0 auto', padding: '6rem 1.5rem 5rem', opacity: 0 }}>
        <h1 style={{ fontSize: 'clamp(44px, 7.5vw, 84px)', fontWeight: 800, letterSpacing: '-0.04em', color: '#111113', lineHeight: 0.92, margin: '0 0 2.5rem' }}>
          Rigor antes<br />que rapidez.
        </h1>
        <p style={{ fontSize: 'clamp(1.0625rem, 2vw, 1.25rem)', lineHeight: 1.7, color: '#36363D', maxWidth: 580, margin: 0 }}>
          A&amp;A Inmobiliaria nace en El Progreso, Yoro con una premisa: cada propiedad que publicamos debe estar verificada, escriturada y lista para cambiar de manos sin sorpresas.
        </p>
      </div>

      {/* Process — dark section */}
      <section ref={processRef} style={{ background: '#111113', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 920, margin: '0 auto' }}>
          <h2 className="reveal-child" style={{ opacity: 0, fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 700, color: '#FAF8F3', letterSpacing: '-0.025em', margin: '0 0 2.5rem' }}>
            Cómo trabajamos
          </h2>
          {steps.map((item, i) => (
            <div key={i} className="reveal-child" style={{
              opacity: 0,
              display: 'flex', gap: '1.75rem', alignItems: 'flex-start',
              padding: '2rem 0', borderTop: '1px solid rgba(255,255,255,0.08)',
            }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#D4B254', letterSpacing: '0.1em', paddingTop: '0.3125rem', flexShrink: 0, minWidth: 22 }}>
                {item.num}
              </span>
              <div>
                <h3 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#FAF8F3', margin: '0 0 0.5rem', letterSpacing: '-0.02em' }}>
                  {item.title}
                </h3>
                <p style={{ fontSize: '0.9375rem', lineHeight: 1.65, color: '#6B6459', margin: 0 }}>
                  {item.body}
                </p>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
        </div>
      </section>

      {/* Contact grid */}
      <div style={{ maxWidth: 920, margin: '0 auto', padding: '4rem 1.5rem 6rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9383', marginBottom: '0.875rem' }}>
              Ubicación
            </div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#111113', marginBottom: '0.25rem' }}>El Progreso, Yoro</div>
            <div style={{ fontSize: '0.9375rem', color: '#5A5A63' }}>Honduras, C.A.</div>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9383', marginBottom: '0.875rem' }}>
              Teléfono
            </div>
            <a href="tel:99383699" style={{ display: 'block', fontSize: '1.0625rem', fontWeight: 600, color: '#111113', marginBottom: '0.25rem', textDecoration: 'none' }}>
              +504 9938-3699
            </a>
            <a href="https://wa.me/50499383699" target="_blank" rel="noopener" style={{ fontSize: '0.9375rem', color: '#D4B254', fontWeight: 600, textDecoration: 'none' }}>
              Escribir por WhatsApp →
            </a>
          </div>
          <div>
            <div style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#9A9383', marginBottom: '0.875rem' }}>
              Horario
            </div>
            <div style={{ fontSize: '1.0625rem', fontWeight: 600, color: '#111113', marginBottom: '0.25rem' }}>Lunes a sábado</div>
            <div style={{ fontSize: '0.9375rem', color: '#5A5A63' }}>8:00 AM – 6:00 PM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Route helpers ──────────────────────────────────────────── */
const PATH_MAP: Record<string, string> = {
  home: '/',
  catalog: '/propiedades',
  about: '/nosotros',
};

function getInitialRoute(): string {
  if (typeof window === 'undefined') return 'home';
  const p = window.location.pathname;
  if (p.startsWith('/propiedades') || p.startsWith('/lotificaciones')) return 'catalog';
  if (p.startsWith('/nosotros')) return 'about';
  return 'home';
}

function getInitialCatalogFilters(): { dep?: string; pay?: string; type?: string } {
  if (typeof window === 'undefined') return {};
  if (window.location.pathname.startsWith('/lotificaciones')) return { type: 'lotificadora' };
  return {};
}

/* ── Main app ───────────────────────────────────────────────── */
function WebsiteContent() {
  const [route, setRoute] = useState(getInitialRoute);
  const [detail, setDetail] = useState<Property | null>(null);
  const [modal, setModal] = useState<{ open: boolean; property: Property | null }>({ open: false, property: null });
  const [catalogFilters, setCatalogFilters] = useState(getInitialCatalogFilters);
  const { theme, toggleTheme } = usePublicTheme();

  const navigateTo = (r: string) => {
    if (r === 'lotificaciones') {
      // Same URL as propiedades, just pre-applies the type filter
      setCatalogFilters({ type: 'lotificadora' });
      setRoute('catalog');
      window.history.pushState({}, '', '/propiedades');
    } else {
      if (r === 'catalog') setCatalogFilters({}); // clear type filter when going to "Propiedades"
      setRoute(r);
      window.history.pushState({}, '', PATH_MAP[r] || '/');
    }
    window.scrollTo(0, 0);
  };

  // Normalize /lotificaciones -> /propiedades URL on mount (both share same canonical URL)
  useEffect(() => {
    if (window.location.pathname.startsWith('/lotificaciones')) {
      window.history.replaceState({}, '', '/propiedades');
    }
  }, []);

  // Sync route with browser back/forward
  useEffect(() => {
    const handler = () => setRoute(getInitialRoute());
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  const openWA = (property: Property | null = null) => setModal({ open: true, property });
  const openDetail = (p: Property) => {
    setDetail(p);
    setRoute('detail');
    window.history.pushState({}, '', `/propiedad/${p.id}`);
    window.scrollTo(0, 0);
  };

  const handleExplore = (filters?: { dep?: string; pay?: string; type?: string }) => {
    if (filters) setCatalogFilters(filters);
    navigateTo('catalog');
  };

  return (
    <>
      <Header
        currentRoute={route}
        onNavigate={navigateTo}
        onWhatsApp={() => openWA()}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {route === 'home' && (
        <>
          <Hero onWhatsApp={() => openWA()} onExplore={handleExplore} />
          <FeaturedSection onOpen={openDetail} onWhatsApp={openWA} onExplore={() => handleExplore()} />
          <TrustBand />
          <CTASection onWhatsApp={() => openWA()} />
        </>
      )}

      {route === 'catalog' && (
        <CatalogView
          key={catalogFilters.type || 'all'}
          initialFilters={catalogFilters}
          onOpen={openDetail}
          onWhatsApp={openWA}
        />
      )}

      {route === 'detail' && detail && (
        <PropertyDetail
          property={detail}
          onBack={() => {
            setRoute('catalog');
            window.history.pushState({}, '', '/propiedades');
            window.scrollTo(0, 0);
          }}
          onWhatsApp={openWA}
        />
      )}

      {route === 'about' && <AboutPage />}

      <Footer onWhatsApp={() => openWA()} />

      {/* WhatsApp FAB — always visible */}
      <WhatsAppFAB onClick={() => openWA()} />

      <WhatsAppModal
        open={modal.open}
        onClose={() => setModal({ open: false, property: null })}
        property={modal.property}
      />
    </>
  );
}

export default function WebsiteApp() {
  return (
    <QueryProvider>
      <WebsiteContent />
    </QueryProvider>
  );
}
