import { useState, useEffect, useRef } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useSettings } from '../../hooks/useSettings';

/* ── WhatsApp FAB ───────────────────────────────────────────── */
export function WhatsAppFAB({ onClick }: { onClick?: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: null } }));
    }
  };

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
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 500, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, pointerEvents: 'none' }}>
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
          transition: 'padding 0.3s cubic-bezier(0.22,1,0.36,1)',
          overflow: 'hidden',
          opacity: 0, // will be animated in
          scale: '0',
          pointerEvents: 'auto',
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



    </div>
  );
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

/* ── About page ─────────────────────────────────────────────── */
function AboutPageInner() {
  const heroRef = useRef<HTMLDivElement>(null!);
  const processRef = useRef<HTMLElement>(null!);
  useReveal(heroRef);
  useReveal(processRef);

  const { data: settings } = useSettings();
  const rawPhone = settings?.whatsapp_phone || '50499383699';
  const displayPhone = rawPhone.startsWith('504') && rawPhone.length === 11
    ? `+504 ${rawPhone.slice(3, 7)}-${rawPhone.slice(7)}`
    : rawPhone.length === 8
      ? `+504 ${rawPhone.slice(0, 4)}-${rawPhone.slice(4)}`
      : rawPhone.startsWith('+')
        ? rawPhone
        : `+${rawPhone}`;

  const telLink = rawPhone.startsWith('+') ? rawPhone : `+${rawPhone}`;

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

      {/* Process list */}
      <section ref={processRef} style={{ borderTop: '1px solid #E6E0D2', borderBottom: '1px solid #E6E0D2', background: '#FFFFFF', opacity: 0 }}>
        <div style={{ maxWidth: 920, margin: '0 auto', padding: '5rem 1.5rem' }}>
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
            <a href={`tel:${telLink}`} style={{ display: 'block', fontSize: '1.0625rem', fontWeight: 600, color: 'var(--main-text, #111113)', marginBottom: '0.25rem', textDecoration: 'none' }}>
              {displayPhone}
            </a>
            <a href={`https://wa.me/${rawPhone}`} target="_blank" rel="noopener" style={{ fontSize: '0.9375rem', color: '#D4B254', fontWeight: 600, textDecoration: 'none' }}>
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

export function AboutPage() {
  return (
    <QueryProvider>
      <AboutPageInner />
    </QueryProvider>
  );
}
