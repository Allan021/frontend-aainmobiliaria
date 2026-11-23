import { useEffect, useRef, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useProperties } from '../../hooks/useProperties';
import { useCurrency, priceParts } from '../../hooks/useCurrency';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { PropertyCard } from '../property/PropertyCard';
import { WhatsAppIcon } from '../shared/Icon';
import { IconVideo, IconScroll, IconEdit } from '../shared/rs-icons';
import { cleanTitle, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';

// Estilos: src/styles/public-premium.css (clases hl-*)

function openWhatsAppModal(property: Property | null = null) {
  window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property } }));
}

/** Retraso escalonado para .hl-rise / [data-reveal] */
const delay = (ms: number) => ({ '--d': `${ms}ms` }) as React.CSSProperties;

/** Marca [data-reveal] al entrar al viewport. Sin IntersectionObserver no oculta nada. */
function useReveal(ref: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    if (!root || !('IntersectionObserver' in window)) return;
    root.classList.add('hl-reveal-on');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    root.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [ref]);
}

/* ── Barra diáspora ── */
function DiasporaBar() {
  return (
    <div className="diaspora-bar" style={{
      background: '#1F5B42', color: '#EEF5F0', fontSize: 13, padding: '8px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
    }}>
      <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>¿Comprás desde Estados Unidos?</span>
      <span className="diaspora-bar__detail" style={{ opacity: 0.85 }}>Tours en video, documentos verificados y cierre a distancia, todo por WhatsApp.</span>
      <button onClick={() => openWhatsAppModal()} style={{
        color: '#D4B254', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0,
      }}>Hablar con un asesor →</button>
    </div>
  );
}

/* ── Vitrina del hero: rota las fotos reales de las propiedades destacadas ── */
const ROTATE_MS = 5500;

function Showcase({ properties, isLoading }: { properties: Property[]; isLoading: boolean }) {
  const [currency] = useCurrency();
  const items = properties.filter(p => p.images?.[0]?.url).slice(0, 5);
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const current = items[Math.min(idx, Math.max(0, items.length - 1))];

  useEffect(() => {
    if (items.length < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIdx(i => (i + 1) % items.length), ROTATE_MS);
    return () => clearInterval(t);
  }, [items.length, paused]);

  if (!current) {
    return (
      <div className="hl-stage hl-rise" style={delay(200)}>
        {isLoading
          ? <div className="rs-skeleton" style={{ position: 'absolute', inset: 0, borderRadius: 0 }} />
          : (
            <div className="hl-stage__empty">
              <div className="hl-stage__price">Casas, terrenos y lotes en el mapa.</div>
              <a href="/buscar" className="hl-btn hl-btn--gold">Explorar el mapa →</a>
            </div>
          )}
      </div>
    );
  }

  const { main } = priceParts(current.discount_price ?? current.price, current.currency, currency);

  return (
    <div
      className="hl-stage hl-rise" style={delay(200)}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={() => setPaused(false)}
    >
      {items.map((p, i) => (
        <img
          key={p.id}
          className={`hl-stage__img${p.id === current.id ? ' is-on' : ''}`}
          src={optimizeCloudinaryUrl(p.images[0].url, 1000)}
          alt=""
          loading={i === 0 ? 'eager' : 'lazy'}
          fetchPriority={i === 0 ? 'high' : undefined}
          decoding="async"
        />
      ))}

      <a className="hl-stage__hit" href={`/propiedad/${current.id}`}
        aria-label={`Ver ${cleanTitle(current.title)}, ${main}`} />

      <div className="hl-stage__top">
        {items.length > 1 && (
          <div className="hl-stage__ticks">
            {items.map((p, i) => (
              <button key={p.id} type="button"
                className={`hl-stage__tick${p.id === current.id ? ' is-on' : ''}`}
                aria-label={`Mostrar propiedad ${i + 1} de ${items.length}`}
                aria-pressed={p.id === current.id}
                onClick={() => setIdx(i)} />
            ))}
          </div>
        )}
        <a href="/buscar" className="hl-stage__map">Explorar el mapa</a>
      </div>

      <div className="hl-stage__cap">
        <div style={{ minWidth: 0 }}>
          <div className="hl-stage__type">{current.type}{current.has_deed ? ' · Escritura verificada' : ''}</div>
          <div className="hl-stage__price">{main}</div>
          <div className="hl-stage__title">{cleanTitle(current.title)}</div>
          <div className="hl-stage__loc">{current.municipio}, {current.departamento}</div>
        </div>
        <span className="hl-stage__go" aria-hidden="true">→</span>
      </div>
    </div>
  );
}

/* ── Hero ── */
function Hero({ properties, isLoading }: { properties: Property[]; isLoading: boolean }) {
  const [q, setQ] = useState('');
  const go = () => { window.location.href = `/buscar${q ? `?q=${encodeURIComponent(q)}` : ''}`; };

  return (
    <section className="hl-hero">
      <div className="hl-wrap">
        <div className="hl-hero__grid">
          <div>
            <div className="hl-kicker hl-rise">El Progreso, Yoro · Honduras</div>
            <h1 className="hl-display hl-rise" style={delay(70)}>
              Encontrá tu propiedad. <em>Nosotros la cerramos.</em>
            </h1>
            <p className="hl-lead hl-rise" style={delay(140)}>
              Casas, terrenos y lotes con <strong>escritura verificada en el Instituto de la Propiedad</strong>. Buscá en el mapa, agendá tu visita y cerramos por WhatsApp.
            </p>

            <form className="hl-search hl-rise" style={delay(210)} role="search"
              onSubmit={e => { e.preventDefault(); go(); }}>
              <label className="hl-search__field hl-search__field--loc">
                <span className="hl-search__label">Ubicación</span>
                <input className="hl-search__input" placeholder="El Progreso, Yoro, SPS…"
                  value={q} onChange={e => setQ(e.target.value)} />
              </label>
              <label className="hl-search__field">
                <span className="hl-search__label">Tipo</span>
                <select className="pub-select pub-select--bare"
                  onChange={e => { if (e.target.value) window.location.href = `/buscar?type=${e.target.value}`; }}>
                  <option value="">Todo tipo</option>
                  <option value="Casa">Casa</option>
                  <option value="Terreno">Terreno</option>
                  <option value="Lote">Lote</option>
                </select>
              </label>
              <button type="submit" className="hl-search__go">Buscar</button>
            </form>

            <nav className="hl-quick hl-rise" style={delay(280)} aria-label="Búsquedas frecuentes">
              <a href="/buscar?q=Yoro&type=Terreno">Terrenos en Yoro</a>
              <a href="/buscar?type=Lote">Lotes en cuotas</a>
              <a href="/buscar?q=El Progreso&type=Casa">Casas en El Progreso</a>
              <a href="/buscar?type=lotificadora">Lotificaciones</a>
            </nav>
          </div>

          <Showcase properties={properties} isLoading={isLoading} />
        </div>

        <div className="hl-facts hl-rise" style={delay(360)}>
          <div><strong>120+</strong>propiedades activas</div>
          <div><strong>200+</strong>familias acompañadas</div>
          <div><strong>12 años</strong>de experiencia en Yoro</div>
          <div><strong>4.9 de 5</strong>valoración promedio</div>
        </div>
      </div>
    </section>
  );
}

/* ── Destacadas ── */
function Featured({ properties, isLoading }: { properties: Property[]; isLoading: boolean }) {
  const favIds = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const handleToggleSave = (p: Property) => {
    if (!isLoggedIn()) return requireLogin();
    toggleFav.mutate({ propertyId: p.id, saved: favIds.has(p.id) });
  };

  return (
    <section className="hl-section">
      <div className="hl-wrap">
        <div className="hl-head" data-reveal>
          <h2 className="hl-display hl-h2">Escrituradas y listas<br />para visitar.</h2>
          <a href="/buscar" className="hl-link">Ver todas las propiedades →</a>
        </div>

        <div className="hl-cards">
          {isLoading && [0, 1, 2].map(i => (
            <div key={i} className="rs-card" style={{ overflow: 'hidden' }}>
              <div className="rs-skeleton" style={{ aspectRatio: '4 / 3', borderRadius: 0 }} />
              <div style={{ padding: 18 }}>
                <div className="rs-skeleton" style={{ height: 22, width: '45%', marginBottom: 10 }} />
                <div className="rs-skeleton" style={{ height: 15, width: '80%' }} />
              </div>
            </div>
          ))}
          {properties.slice(0, 6).map(p => (
            <PropertyCard key={p.id} property={p}
              onOpen={pp => { window.location.href = `/propiedad/${pp.id}`; }}
              onWhatsApp={pp => openWhatsAppModal(pp)}
              saved={favIds.has(p.id)}
              onToggleSave={handleToggleSave}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Cómo funciona ── */
function HowItWorks() {
  return (
    <section className="hl-section hl-how">
      <div className="hl-wrap">
        <h2 className="hl-display hl-h2" data-reveal>
          Vos ponés la propiedad.<br />Nosotros, los compradores.
        </h2>
        <div className="hl-how__grid">
          <div className="hl-how__col" data-reveal>
            <div className="hl-how__who">Si vendés</div>
            <h3>Publicá gratis. Nosotros hacemos el resto.</h3>
            <ol className="hl-steps">
              <li><div><strong>Subí tu casa, terreno o lote</strong>Fotos, precio en L o $, varas² y pin en el mapa. Sin costo.</div></li>
              <li><div><strong>Tus datos quedan privados</strong>Nadie ve tu nombre ni tu teléfono. A&A atiende cada consulta.</div></li>
              <li><div><strong>Coordinamos visitas y cerramos</strong>Con acompañamiento legal hasta la escritura pública.</div></li>
            </ol>
            <a href="/publicar" className="hl-btn hl-btn--ink">Publicar mi propiedad gratis →</a>
          </div>
          <div className="hl-how__col" data-reveal style={delay(120)}>
            <div className="hl-how__who">Si comprás</div>
            <h3>Buscá, agendá y visitá sin llamar a nadie.</h3>
            <ol className="hl-steps">
              <li><div><strong>Explorá el mapa</strong>Pins con precio, filtros por tipo, habitaciones y varas². Guardá favoritos.</div></li>
              <li><div><strong>Agendá tu visita</strong>Elegí día y hora directo en la ficha. Confirmamos por WhatsApp.</div></li>
              <li><div><strong>Comprá con respaldo</strong>Escritura verificada, financiamiento con prima y asesoría legal incluida.</div></li>
            </ol>
            <a href="/buscar" className="hl-btn hl-btn--line">Buscar en el mapa →</a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── Confianza ── */
const TRUST = [
  { t: 'Escritura verificada', d: 'Cada propiedad se revisa en el Instituto de la Propiedad antes de publicarse. Documentos en regla, siempre.' },
  { t: 'Financiamiento a cuotas', d: 'Planes desde 20% de prima y hasta 8 años de plazo en propiedades elegibles. Cuota clara desde el día uno.' },
  { t: 'Acompañamiento legal', d: 'Te acompañamos desde la primera visita hasta la firma de escritura pública. Sin letra pequeña.' },
  { t: '12 años en Yoro', d: 'Más de 200 familias han comprado con nosotros, locales y de la diáspora en Estados Unidos.' },
];

function Trust() {
  return (
    <section className="hl-section hl-trust">
      <div className="hl-wrap hl-trust__grid">
        <div className="hl-trust__intro" data-reveal>
          <h2 className="hl-display hl-h2">En Honduras el fraude de terrenos abunda. Por eso verificamos todo.</h2>
          <p className="hl-lead">
            Ninguna propiedad se publica sin pasar por nuestra revisión legal. Tu patrimonio merece rigor, no sorpresas.
          </p>
        </div>
        <ol className="hl-trust__list">
          {TRUST.map((i, n) => (
            <li key={i.t} data-reveal style={delay(n * 70)}>
              <div>
                <h3>{i.t}</h3>
                <p>{i.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── Diáspora ── */
function Diaspora() {
  const features = [
    { icon: <IconVideo size={22} />, t: 'Tour en video en vivo', d: 'Recorremos la propiedad por videollamada, a tu hora.' },
    { icon: <IconScroll size={22} />, t: 'Documentos escaneados', d: 'Escritura y antecedentes verificados, en tu WhatsApp.' },
    { icon: <IconEdit size={22} />, t: 'Firma a distancia', d: 'Cerramos con poder legal mientras tu familia recibe las llaves.' },
  ];
  return (
    <section className="hl-section hl-dia">
      <div className="hl-wrap hl-dia__grid">
        <div data-reveal>
          <div className="hl-dia__who">Para la diáspora · USA → Honduras</div>
          <h2 className="hl-display hl-h2">Comprá para tu familia desde Estados Unidos.</h2>
          <p className="hl-lead">
            Tours en video por WhatsApp, documentos verificados que te enviamos escaneados, precios en dólares y firma con poder legal. Sin que tengás que viajar.
          </p>
          <div className="hl-row">
            <button onClick={() => openWhatsAppModal()} className="hl-btn hl-btn--bone">
              <WhatsAppIcon size={16} color="#17452F" /> Hablar con un asesor
            </button>
            <a href="/buscar" className="hl-btn hl-btn--line">Ver precios en dólares</a>
          </div>
        </div>
        <ul className="hl-dia__list">
          {features.map((f, n) => (
            <li key={f.t} data-reveal style={delay(n * 70)}>
              <span>{f.icon}</span>
              <div><strong>{f.t}</strong><em>{f.d}</em></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ── CTA final ── */
function FinalCTA() {
  return (
    <section className="hl-section hl-final">
      <div className="hl-wrap hl-final__grid" data-reveal>
        <h2 className="hl-display">Tu próxima propiedad<br /><em>está a un mensaje.</em></h2>
        <div>
          <p>Respuesta en minutos, sin compromiso.</p>
          <div className="hl-row">
            <button onClick={() => openWhatsAppModal()} className="hl-btn hl-btn--wa">
              <WhatsAppIcon size={17} color="#0A3D22" /> Consultar por WhatsApp
            </button>
            <a href="/buscar" className="hl-btn hl-btn--line">Buscar propiedades</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeInner() {
  const { data, isLoading } = useProperties({ status: 'disponible', limit: 6 });
  const properties = data?.data || [];
  const rootRef = useRef<HTMLDivElement>(null);
  useReveal(rootRef);

  return (
    <div className="hl" ref={rootRef}>
      <DiasporaBar />
      <Hero properties={properties} isLoading={isLoading} />
      <Featured properties={properties} isLoading={isLoading} />
      <HowItWorks />
      <Trust />
      <Diaspora />
      <FinalCTA />
    </div>
  );
}

export function HomeLanding() {
  return (
    <QueryProvider>
      <HomeInner />
    </QueryProvider>
  );
}
