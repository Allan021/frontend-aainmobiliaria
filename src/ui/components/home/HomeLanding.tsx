import { useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useProperties } from '../../hooks/useProperties';
import { useCurrency, shortPrice } from '../../hooks/useCurrency';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { PropertyCard } from '../property/PropertyCard';
import { WhatsAppIcon } from '../shared/Icon';
import { IconVideo, IconScroll, IconEdit, IconCheck } from '../shared/rs-icons';
import type { Property } from '../../../core/domain/entities/types';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

function openWhatsAppModal(property: Property | null = null) {
  window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property } }));
}

function Eyebrow({ children, color = '#B8862E' }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ fontFamily: F_MONO, fontSize: '11.5px', letterSpacing: '0.16em', color, marginBottom: 10 }}>
      {children}
    </div>
  );
}

/* ── Barra diáspora ── */
function DiasporaBar() {
  return (
    <div style={{
      background: '#1F5B42', color: '#EEF5F0', fontSize: 13, padding: '8px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, flexWrap: 'wrap',
      fontFamily: F_SANS,
    }}>
      <span style={{ fontWeight: 600, letterSpacing: '0.02em' }}>¿Comprás desde Estados Unidos?</span>
      <span style={{ opacity: 0.85 }}>Tours en video, documentos verificados y cierre a distancia — todo por WhatsApp.</span>
      <button onClick={() => openWhatsAppModal()} style={{
        color: '#D4B254', fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 3,
        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0,
      }}>Hablar con un asesor →</button>
    </div>
  );
}

/* ── Mapa ilustrado del hero con pins reales ── */
function MapIllustration({ properties }: { properties: Property[] }) {
  const [currency] = useCurrency();
  const located = properties.filter(p => p.price).slice(0, 5);
  const POSITIONS = [
    { top: '18%', left: '14%' }, { top: '40%', left: '56%' }, { top: '72%', left: '30%' },
    { top: '60%', left: '68%' }, { top: '26%', left: '44%' },
  ];
  const active = located[4] || located[0];

  return (
    <a href="/buscar" className="hero-map" style={{
      display: 'block', position: 'relative', height: 480, borderRadius: 20, overflow: 'hidden',
      background: '#EEF5F0', border: '1px solid rgba(212,178,84,0.25)',
      boxShadow: '0 30px 80px -20px rgba(0,0,0,0.6)',
    }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg, #F2F6F0 0%, #E8EFE6 55%, #EDF2E4 100%)' }} />
      <div style={{ position: 'absolute', top: -60, right: -80, width: 320, height: 280, background: '#DCE9DA', borderRadius: '48% 52% 55% 45% / 55% 45% 55% 45%', opacity: 0.8 }} />
      <div style={{ position: 'absolute', bottom: -40, left: -60, width: 260, height: 220, background: '#E3EDDD', borderRadius: '55% 45% 48% 52% / 45% 55% 45% 55%' }} />
      <div style={{ position: 'absolute', top: -20, left: '44%', width: 26, height: '130%', background: '#CFE0EA', transform: 'rotate(14deg)', borderRadius: 999, opacity: 0.9 }} />
      <div style={{ position: 'absolute', top: '30%', left: '-5%', width: '110%', height: 5, background: '#FFFFFF', transform: 'rotate(-6deg)', boxShadow: '0 0 0 1.5px #E0DCCF' }} />
      <div style={{ position: 'absolute', top: '64%', left: '-5%', width: '110%', height: 5, background: '#FFFFFF', transform: 'rotate(4deg)', boxShadow: '0 0 0 1.5px #E0DCCF' }} />
      <div style={{ position: 'absolute', top: '-5%', left: '22%', width: 5, height: '110%', background: '#FFFFFF', transform: 'rotate(8deg)', boxShadow: '0 0 0 1.5px #E0DCCF' }} />
      <div style={{ position: 'absolute', top: '-5%', left: '72%', width: 4, height: '110%', background: '#FFFFFF', transform: 'rotate(-5deg)', opacity: 0.8 }} />

      {located.slice(0, 4).map((p, i) => (
        <div key={p.id} style={{
          position: 'absolute', ...POSITIONS[i],
          background: '#1F5B42', color: '#EEF5F0',
          fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 13,
          padding: '6px 12px', borderRadius: 999,
          boxShadow: '0 4px 12px rgba(10,40,29,0.35)',
        }}>{shortPrice(p.discount_price ?? p.price, p.currency, currency)}</div>
      ))}

      {active && (
        <div style={{ position: 'absolute', top: '26%', left: '44%' }}>
          <div style={{
            background: '#C65D3B', color: '#FFF7F2',
            fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 14,
            padding: '7px 14px', borderRadius: 999,
            boxShadow: '0 6px 18px rgba(198,93,59,0.45)', position: 'relative', zIndex: 2,
            display: 'inline-block',
          }}>{shortPrice(active.discount_price ?? active.price, active.currency, currency)}</div>
          <div style={{
            marginTop: 10, width: 218, background: '#FFFFFF', borderRadius: 12, padding: 10,
            boxShadow: '0 16px 40px -8px rgba(17,17,19,0.25)', border: '1px solid #EDE9DF',
          }}>
            <div style={{ height: 84, borderRadius: 8, overflow: 'hidden', background: '#EDE9DF' }}>
              {active.images?.[0]?.url
                ? <img src={active.images[0].url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                : <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontFamily: F_MONO, fontSize: '9.5px', color: '#9A9383' }}>FOTO</div>}
            </div>
            <div style={{ fontWeight: 700, fontSize: '13.5px', marginTop: 8, color: '#111113', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{active.title}</div>
            <div style={{ fontSize: 12, color: '#6B6455', display: 'flex', gap: 8, marginTop: 2 }}>
              {active.bedrooms ? <><span>{active.bedrooms} hab</span><span>·</span></> : null}
              {active.bathrooms ? <><span>{active.bathrooms} baños</span><span>·</span></> : null}
              <span>{active.area_varas || active.municipio}</span>
            </div>
          </div>
        </div>
      )}

      <div style={{
        position: 'absolute', bottom: 16, right: 16, background: '#111113', color: '#D4B254',
        fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 13, padding: '10px 18px',
        borderRadius: 999, boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}>Explorar el mapa →</div>
    </a>
  );
}

/* ── Hero ── */
function Hero({ properties }: { properties: Property[] }) {
  const [q, setQ] = useState('');
  const go = () => { window.location.href = `/buscar${q ? `?q=${encodeURIComponent(q)}` : ''}`; };

  const searchField: React.CSSProperties = {
    border: 'none', outline: 'none', background: 'transparent',
    fontFamily: F_SANS, fontSize: '15.5px', fontWeight: 600, color: '#111113', width: '100%', padding: 0,
  };
  const fieldLabel: React.CSSProperties = {
    fontFamily: F_MONO, fontSize: 10, letterSpacing: '0.12em', color: '#9A9383', marginBottom: 3,
  };
  const chip: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: '#B9B9C0', border: '1px solid #38383F',
    borderRadius: 999, padding: '6px 14px', textDecoration: 'none', transition: 'color 0.15s, border-color 0.15s',
  };

  return (
    <section style={{
      background: '#111113',
      backgroundImage: 'radial-gradient(ellipse 900px 500px at 75% 110%, rgba(212,178,84,0.13), transparent), radial-gradient(ellipse 700px 400px at 10% -10%, rgba(212,178,84,0.06), transparent)',
      padding: '64px 24px 80px', fontFamily: F_SANS,
    }}>
      <div className="hero-grid" style={{
        maxWidth: 1280, margin: '0 auto', display: 'grid',
        gridTemplateColumns: 'minmax(440px, 1.1fr) minmax(380px, 0.9fr)', gap: 56, alignItems: 'center',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, border: '1px solid #5E4A11', borderRadius: 999, padding: '7px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#D4B254', display: 'inline-block' }} />
            <span style={{ fontFamily: F_MONO, fontSize: '11.5px', letterSpacing: '0.14em', color: '#D4B254' }}>EL PROGRESO, YORO · HONDURAS</span>
          </div>
          <h1 style={{
            fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 'clamp(44px, 5vw, 68px)',
            lineHeight: 1.02, letterSpacing: '-0.03em', margin: '0 0 20px', color: '#FAF8F3',
          }}>
            Encontrá tu propiedad.<br />
            <span style={{ color: '#D4B254' }}>Nosotros la cerramos.</span>
          </h1>
          <p style={{ fontSize: '17.5px', lineHeight: 1.6, color: '#B9B9C0', margin: '0 0 36px', maxWidth: 520 }}>
            Casas, terrenos y lotes con <strong style={{ color: '#FAF8F3' }}>escritura verificada en el Instituto de la Propiedad</strong>. Buscá en el mapa, agendá tu visita y cerramos por WhatsApp.
          </p>

          {/* Buscador protagonista */}
          <div className="hero-search" style={{
            background: '#FAF8F3', borderRadius: 16, padding: 8,
            display: 'flex', alignItems: 'stretch',
            boxShadow: '0 24px 60px -12px rgba(0,0,0,0.55)',
          }}>
            <div style={{ flex: 1.3, padding: '10px 18px', borderRight: '1px solid #E4DFD2' }}>
              <div style={fieldLabel}>UBICACIÓN</div>
              <input placeholder="El Progreso, Yoro, SPS…" value={q}
                onChange={e => setQ(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') go(); }}
                style={searchField} aria-label="Ubicación" />
            </div>
            <div className="hero-search-tipo" style={{ flex: 1, padding: '10px 18px', borderRight: '1px solid #E4DFD2' }}>
              <div style={fieldLabel}>TIPO</div>
              <select style={{ ...searchField, cursor: 'pointer' }} aria-label="Tipo de propiedad"
                onChange={e => { if (e.target.value) window.location.href = `/buscar?type=${e.target.value}`; }}>
                <option value="">Todo tipo</option>
                <option value="Casa">Casa</option>
                <option value="Terreno">Terreno</option>
                <option value="Lote">Lote</option>
              </select>
            </div>
            <button onClick={go} style={{
              background: '#111113', color: '#D4B254', borderRadius: 12, padding: '0 28px',
              display: 'grid', placeItems: 'center', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
              border: 'none', cursor: 'pointer', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#232327'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#111113'; }}
            >Buscar</button>
          </div>

          {/* Chips rápidos */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { label: 'Terrenos en Yoro', url: '/buscar?q=Yoro&type=Terreno' },
              { label: 'Lotes en cuotas', url: '/buscar?type=Lote' },
              { label: 'Casas en El Progreso', url: '/buscar?q=El Progreso&type=Casa' },
              { label: 'Lotificaciones', url: '/lotificaciones' },
            ].map(c => (
              <a key={c.label} href={c.url} style={chip}
                onMouseEnter={e => { e.currentTarget.style.color = '#D4B254'; e.currentTarget.style.borderColor = '#5E4A11'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#B9B9C0'; e.currentTarget.style.borderColor = '#38383F'; }}
              >{c.label}</a>
            ))}
          </div>
        </div>

        <MapIllustration properties={properties} />
      </div>

      {/* Stats */}
      <div className="hero-stats" style={{
        maxWidth: 1280, margin: '64px auto 0',
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1,
        background: '#2A2A30', border: '1px solid #2A2A30', borderRadius: 16, overflow: 'hidden',
      }}>
        {[
          { n: '120+', l: 'Propiedades activas' },
          { n: '200+', l: 'Familias acompañadas' },
          { n: '12 años', l: 'De experiencia en Yoro' },
          { n: '4.9★', l: 'Valoración promedio' },
        ].map(s => (
          <div key={s.l} style={{ background: '#161618', padding: '24px 28px' }}>
            <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 34, color: '#D4B254', letterSpacing: '-0.02em' }}>{s.n}</div>
            <div style={{ fontSize: '13.5px', color: '#B9B9C0', marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
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
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px 40px', fontFamily: F_SANS }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, marginBottom: 36, flexWrap: 'wrap' }}>
        <div>
          <Eyebrow>SELECCIONADAS ESTA SEMANA</Eyebrow>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 38, letterSpacing: '-0.025em', margin: 0, lineHeight: 1.1, color: '#111113' }}>
            Escrituradas y listas para visitar.
          </h2>
        </div>
        <a href="/propiedades" style={{
          fontWeight: 700, fontSize: 15, color: '#111113',
          borderBottom: '2px solid #D4B254', paddingBottom: 3, textDecoration: 'none',
        }}>Ver todas las propiedades →</a>
      </div>

      <div className="featured-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
        {isLoading && [0, 1, 2].map(i => (
          <div key={i} className="rs-card" style={{ overflow: 'hidden' }}>
            <div className="rs-skeleton" style={{ height: 200, borderRadius: 0 }} />
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
    </section>
  );
}

/* ── Cómo funciona ── */
function HowItWorks() {
  const step = (bg: string, fg: string, n: string) => (
    <div style={{
      width: 30, height: 30, borderRadius: 8, background: bg, color: fg,
      display: 'grid', placeItems: 'center', fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 14, flexShrink: 0,
    }}>{n}</div>
  );
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '60px 24px', fontFamily: F_SANS }}>
      <div style={{ textAlign: 'center', marginBottom: 44 }}>
        <Eyebrow>CÓMO FUNCIONA</Eyebrow>
        <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 38, letterSpacing: '-0.025em', margin: 0, color: '#111113' }}>
          Vos ponés la propiedad.<br />Nosotros ponemos los compradores.
        </h2>
      </div>
      <div className="how-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
        {/* Dueños */}
        <div style={{ background: '#111113', borderRadius: 20, padding: 36, color: '#FAF8F3' }}>
          <div style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: '0.16em', color: '#D4B254', marginBottom: 18 }}>¿VENDÉS TU PROPIEDAD?</div>
          <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 26, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Publicá gratis. Nosotros hacemos el resto.</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 15, lineHeight: 1.55 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#D4B254', '#111113', '1')}
              <div><strong>Subí tu casa, terreno o lote</strong> — fotos, precio en L o $, varas² y pin en el mapa. Sin costo.</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#D4B254', '#111113', '2')}
              <div><strong>Tus datos quedan privados</strong> — nadie ve tu nombre ni teléfono. A&A atiende cada consulta.</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#D4B254', '#111113', '3')}
              <div><strong>Coordinamos visitas y cerramos</strong> — con acompañamiento legal hasta la escritura pública.</div>
            </div>
          </div>
          <a href="/publicar" style={{
            display: 'inline-block', marginTop: 28, background: '#D4B254', color: '#111113',
            fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15, padding: '14px 28px',
            borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#E3C878'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#D4B254'; }}
          >Publicar mi propiedad gratis →</a>
        </div>
        {/* Compradores */}
        <div style={{ background: '#1F5B42', borderRadius: 20, padding: 36, color: '#EEF5F0' }}>
          <div style={{ fontFamily: F_MONO, fontSize: 11, letterSpacing: '0.16em', color: '#A8CBB4', marginBottom: 18 }}>¿BUSCÁS COMPRAR?</div>
          <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 26, margin: '0 0 24px', letterSpacing: '-0.02em' }}>Buscá, agendá y visitá — sin llamar a nadie.</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18, fontSize: 15, lineHeight: 1.55 }}>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#EEF5F0', '#1F5B42', '1')}
              <div><strong>Explorá el mapa</strong> — pins con precio, filtros por tipo, habitaciones y varas². Guardá favoritos.</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#EEF5F0', '#1F5B42', '2')}
              <div><strong>Agendá tu visita</strong> — elegí día y hora directo en la ficha. Confirmamos por WhatsApp.</div>
            </div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              {step('#EEF5F0', '#1F5B42', '3')}
              <div><strong>Comprá con respaldo</strong> — escritura verificada, financiamiento con prima y asesoría legal incluida.</div>
            </div>
          </div>
          <a href="/buscar" style={{
            display: 'inline-block', marginTop: 28, background: '#EEF5F0', color: '#1F5B42',
            fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15, padding: '14px 28px',
            borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FFFFFF'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#EEF5F0'; }}
          >Buscar en el mapa →</a>
        </div>
      </div>
    </section>
  );
}

/* ── Confianza ── */
function Trust() {
  const items = [
    { t: '01 — Escritura verificada', d: 'Cada propiedad se revisa en el Instituto de la Propiedad antes de publicarse. Documentos en regla, siempre.' },
    { t: '02 — Financiamiento a cuotas', d: 'Planes desde 20% de prima y hasta 8 años de plazo en propiedades elegibles. Cuota clara desde el día uno.' },
    { t: '03 — Acompañamiento legal', d: 'Le acompañamos desde la primera visita hasta la firma de escritura pública. Sin letra pequeña.' },
    { t: '04 — 12 años en Yoro', d: 'Más de 200 familias han comprado con nosotros — locales y de la diáspora en Estados Unidos.' },
  ];
  return (
    <section style={{ background: '#111113', padding: '80px 24px', fontFamily: F_SANS }}>
      <div className="trust-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 56, alignItems: 'start' }}>
        <div>
          <Eyebrow color="#D4B254">POR QUÉ A&A</Eyebrow>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 38, letterSpacing: '-0.025em', margin: '0 0 18px', color: '#FAF8F3', lineHeight: 1.12 }}>
            En Honduras el fraude de terrenos abunda. Por eso verificamos todo.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: '#B9B9C0', margin: 0 }}>
            Ninguna propiedad se publica sin pasar por nuestra revisión legal. Su patrimonio merece rigor, no sorpresas.
          </p>
        </div>
        <div className="trust-cards" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {items.map(i => (
            <div key={i.t} style={{ background: '#1C1C1F', border: '1px solid #2A2A30', borderRadius: 16, padding: 26 }}>
              <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 15, color: '#D4B254', marginBottom: 8 }}>{i.t}</div>
              <div style={{ fontSize: 14, lineHeight: 1.6, color: '#B9B9C0' }}>{i.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Diáspora ── */
function Diaspora() {
  const features = [
    { icon: <IconVideo size={20} />, t: 'Tour en video en vivo', d: 'Recorremos la propiedad por videollamada, a tu hora.' },
    { icon: <IconScroll size={20} />, t: 'Documentos escaneados', d: 'Escritura y antecedentes verificados, en tu WhatsApp.' },
    { icon: <IconEdit size={20} />, t: 'Firma a distancia', d: 'Cerramos con poder legal mientras tu familia recibe las llaves.' },
  ];
  return (
    <section style={{ maxWidth: 1280, margin: '0 auto', padding: '80px 24px', fontFamily: F_SANS }}>
      <div className="diaspora-grid" style={{
        background: '#1F5B42', borderRadius: 24, padding: 56,
        display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 48, alignItems: 'center', color: '#EEF5F0',
      }}>
        <div>
          <div style={{ fontFamily: F_MONO, fontSize: '11.5px', letterSpacing: '0.16em', color: '#A8CBB4', marginBottom: 12 }}>PARA LA DIÁSPORA · USA → HONDURAS</div>
          <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 36, letterSpacing: '-0.025em', margin: '0 0 16px', lineHeight: 1.12 }}>
            Comprá para tu familia desde Estados Unidos.
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: '#CDE2D4', margin: '0 0 28px', maxWidth: 480 }}>
            Tours en video por WhatsApp, documentos verificados que te enviamos escaneados, precios en dólares y firma con poder legal — sin que tengás que viajar.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button onClick={() => openWhatsAppModal()} style={{
              background: '#25D366', color: '#0A3D22', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
              padding: '14px 26px', borderRadius: 12, border: 'none', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 8, transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
            ><WhatsAppIcon size={16} color="#0A3D22" /> Hablar con un asesor</button>
            <a href="/buscar" style={{
              border: '1.5px solid #A8CBB4', color: '#EEF5F0', fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 15,
              padding: '14px 26px', borderRadius: 12, textDecoration: 'none', transition: 'background 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#17452F'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >Ver precios en dólares</a>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {features.map(f => (
            <div key={f.t} style={{ background: '#17452F', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ color: '#A8CBB4', display: 'flex', flexShrink: 0 }}>{f.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: 15 }}>{f.t}</strong>
                <span style={{ fontSize: '13.5px', color: '#A8CBB4' }}>{f.d}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── CTA final ── */
function FinalCTA() {
  return (
    <section style={{
      background: '#111113',
      backgroundImage: 'radial-gradient(ellipse 800px 400px at 50% 120%, rgba(212,178,84,0.15), transparent)',
      padding: '96px 24px', textAlign: 'center', fontFamily: F_SANS,
    }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 46, letterSpacing: '-0.03em', margin: '0 0 16px', color: '#FAF8F3', lineHeight: 1.08 }}>
          Tu próxima propiedad<br /><span style={{ color: '#D4B254' }}>está a un mensaje.</span>
        </h2>
        <p style={{ fontSize: 17, color: '#B9B9C0', margin: '0 0 36px' }}>Respuesta en minutos, sin compromiso. Todo por WhatsApp.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => openWhatsAppModal()} style={{
            background: '#25D366', color: '#0A3D22', fontFamily: F_ARCHIVO, fontWeight: 700,
            fontSize: '16.5px', padding: '16px 34px', borderRadius: 14, border: 'none', cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 9, transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
          ><WhatsAppIcon size={17} color="#0A3D22" /> Consultar por WhatsApp</button>
          <a href="/buscar" style={{
            border: '1.5px solid #5E4A11', color: '#D4B254', fontFamily: F_ARCHIVO, fontWeight: 700,
            fontSize: '16.5px', padding: '16px 34px', borderRadius: 14, textDecoration: 'none', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#1C1C1F'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >Buscar propiedades</a>
        </div>
      </div>
    </section>
  );
}

function HomeInner() {
  const { data, isLoading } = useProperties({ status: 'disponible', limit: 6 });
  const properties = data?.data || [];
  return (
    <div style={{ background: '#FAF8F3' }}>
      <DiasporaBar />
      <Hero properties={properties} />
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
