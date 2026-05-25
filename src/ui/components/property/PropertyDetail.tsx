import { useState, useEffect, useRef } from 'react';
import { formatPrice, type Property } from '../../../core/domain/entities/types';
import { WhatsAppButton } from '../shared/WhatsAppButton';
import { useCreateLead } from '../../hooks/useLeads';
import { QueryProvider } from '../../providers/QueryProvider';

// Modular Subcomponents
import { PhotoGrid } from './detail/PhotoGrid';
import { GalleryModal } from './detail/GalleryModal';
import { QuickStats } from './detail/QuickStats';
import { SpecItem } from './detail/SpecItem';
import { PropertyMap } from './detail/PropertyMap';
import { FAQSection } from './detail/FAQSection';
import { ShareBar } from './detail/ShareBar';
import { PriceCard } from './detail/PriceCard';
import { LeadCaptureModal } from './detail/LeadCaptureModal';

interface Props {
  property: Property;
  onBack?: () => void;
  onWhatsApp?: (p: Property) => void;
  standalone?: boolean;
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

function PropertyDetailInner({ property, onBack, onWhatsApp, standalone }: Props) {
  const [gallery, setGallery] = useState<{ open: boolean; idx: number }>({ open: false, idx: 0 });
  const [descExpanded, setDescExpanded] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const createLead = useCreateLead();

  /** Opens the lead capture modal instead of going straight to WhatsApp */
  const handleWhatsAppClick = () => {
    setLeadModalOpen(true);
  };

  /** Called when user submits name + email in the lead capture modal */
  const handleLeadSubmit = ({ name, email }: { name: string; email: string }) => {
    setLeadModalOpen(false);

    // Save lead with real user data
    createLead.mutate({
      name,
      email: email || "",
      property_id: property.id,
      property_title: property.title,
    });

    // Open WhatsApp with personalized message
    const phone = '50499383699';
    const propertyUrl = `https://www.aabienes.com/propiedad/${property.id}`;
    const text = `Hola A&A Inmobiliaria, soy ${name}. Estoy interesado en la propiedad: "${property.title}" (${propertyUrl}). Me gustaría recibir más información.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

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
    { url: '/banner-web.jpg', title: 'Vista del terreno', description: 'Vista espectacular del predio.' },
  ];
  const images = property.images?.length > 0 ? property.images : defaultImages;

  const phone = '9938-3699';
  const descLong = property.description.length > 300;
  const displayedDesc = descLong && !descExpanded
    ? property.description.slice(0, 300) + '...'
    : property.description;

  return (
    <div style={{ background: 'var(--main-bg, #FAF8F3)', minHeight: '100vh', color: 'var(--main-text, #111113)' }}>

      {/* Breadcrumb + share row */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: standalone ? '1rem clamp(1rem, 4vw, 2.5rem) 0' : '1.25rem clamp(1rem, 4vw, 2.5rem) 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {[
              { label: 'Inicio', href: '/' },
              { label: 'Propiedades', href: '/propiedades' },
              { label: property.departamento },
              { label: property.title.slice(0, 28) + (property.title.length > 28 ? '…' : '') },
            ].map((item, i, arr) => (
              <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {i > 0 && <span style={{ color: 'var(--main-text-dim, #C9C2B1)', fontSize: '0.8125rem' }}>/</span>}
                {(item as any).href ? (
                  <a
                    href={(item as any).href}
                    style={{
                      fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)', fontWeight: 500,
                      textDecoration: 'none', transition: 'color 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = 'var(--main-text, #111113)')}
                    onMouseLeave={e => (e.currentTarget.style.color = 'var(--main-text-dim, #9A9383)')}
                  >
                    {item.label}
                  </a>
                ) : (
                  <span style={{
                    fontSize: '0.8125rem',
                    color: i === arr.length - 1 ? 'var(--main-text, #111113)' : 'var(--main-text-dim, #9A9383)',
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
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 'clamp(1.5rem, 4vw, 3rem) clamp(1rem, 4vw, 2.5rem) clamp(3rem, 8vw, 6rem)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2.5rem' }} className="detail-grid">

          {/* LEFT column */}
          <div style={{ minWidth: 0 }}>

            {/* Header: badges + title + location */}
            <div ref={headerRef} style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
              {/* Badges */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: '1rem' }}>
                {property.financing ? (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: '#D4B254', color: '#111113', fontSize: '0.75rem', fontWeight: 700 }}>
                    Financiamiento disponible
                  </span>
                ) : (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: 'var(--main-text, #111113)', color: 'var(--main-bg, #FAF8F3)', fontSize: '0.75rem', fontWeight: 700 }}>
                    Solo contado
                  </span>
                )}
                {property.property_type === 'lotificadora' && (
                  <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, border: '1px solid #D4B254', color: '#8C6F1C', fontSize: '0.75rem', fontWeight: 700 }}>
                    {property.lotification_name || 'Lotificación'}
                  </span>
                )}
                <span style={{ padding: '0.375rem 0.875rem', borderRadius: 999, background: 'var(--main-bg, #F3EFE6)', color: 'var(--main-text-muted, #5A5A63)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {property.type}
                </span>
              </div>

              <h1 style={{
                fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700,
                color: 'var(--main-text, #111113)', letterSpacing: '-0.03em', lineHeight: 1.1,
                margin: '0 0 0.75rem',
              }}>
                {property.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--main-text-muted, #5A5A63)', fontSize: '0.9375rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2" strokeLinecap="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {property.municipio}, {property.departamento}, Honduras
                {property.property_type === 'lotificadora' && property.available_lots && (
                  <>
                    <span style={{ color: 'var(--main-border, #E6E0D2)', margin: '0 4px' }}>·</span>
                    <span style={{ color: 'var(--color-aa-success, #4A7C59)', fontWeight: 600 }}>{property.available_lots} lotes disponibles</span>
                  </>
                )}
              </div>

              {/* Apartado badge */}
              {property.status === 'apartado' && (
                <div style={{ marginTop: '0.875rem' }}>
                  <span style={{
                    padding: '0.4rem 0.875rem', borderRadius: 8,
                    background: 'var(--color-aa-warning-bg, #FFF3CD)', color: 'var(--color-aa-warning, #856404)',
                    border: '1px solid var(--color-aa-warning, #FFEAA7)', fontSize: '0.8125rem', fontWeight: 600,
                    display: 'inline-block',
                  }}>
                    Apartado — consulte disponibilidad
                  </span>
                </div>
              )}
            </div>

            {/* Description */}
            <div ref={descRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text, #111113)', marginBottom: '1rem' }}>
                Acerca de esta propiedad
              </h2>
              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--main-text-muted, #36363D)', margin: '0 0 0.75rem' }}>
                {displayedDesc}
              </p>
              {descLong && (
                <button
                  onClick={() => setDescExpanded(e => !e)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                    fontSize: '0.875rem', fontWeight: 600, color: 'var(--sidebar-accent-muted, #8C6F1C)', padding: 0,
                    textDecoration: 'underline', textUnderlineOffset: 2,
                  }}
                >
                  {descExpanded ? 'Leer menos' : 'Leer más'}
                </button>
              )}
            </div>

            {/* Highlights */}
            {property.highlights?.length > 0 && (
              <div ref={highlightsRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text, #111113)', marginBottom: '1.25rem' }}>
                  Lo que hace especial esta propiedad
                </h2>
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }} className="detail-highlights-grid">
                  {property.highlights.map(h => (
                    <li key={h} style={{
                      display: 'flex', alignItems: 'flex-start', gap: 12,
                      padding: '1rem 1.25rem', borderRadius: 14,
                      border: '1px solid var(--main-border, #E6E0D2)', background: 'var(--main-card-bg, #fff)',
                      transition: 'all 0.2s',
                      cursor: 'default',
                    }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--main-bg)';
                        (e.currentTarget as HTMLElement).style.borderColor = '#D4B254';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = 'var(--main-card-bg)';
                        (e.currentTarget as HTMLElement).style.borderColor = 'var(--main-border)';
                      }}
                    >
                      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--main-bg, #FBF6E9)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#D4B254" strokeWidth="2.5" strokeLinecap="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--main-text, #111113)', lineHeight: 1.4 }}>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specs — tile grid */}
            <div ref={specsRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text, #111113)', marginBottom: '1.25rem' }}>
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
                  <SpecItem key={label} label={label} value={value} />
                ))}
              </div>
            </div>

            {/* Financing card */}
            {property.financing && (
              <div style={{
                marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--main-border, #E6E0D2)',
              }}>
                <div style={{
                  background: 'var(--main-card-bg, rgba(212,178,84,0.07))',
                  border: '1px solid var(--main-border, rgba(212,178,84,0.2))',
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
                        <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sidebar-accent-muted, #8C6F1C)', marginBottom: 4 }}>Prima mínima</div>
                        <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--main-text, #111113)' }}>{property.financing_prima}%</div>
                      </div>
                    )}
                    {property.financing_plazo_meses && (
                      <>
                        <div style={{ width: 1, background: 'var(--main-border, rgba(212,178,84,0.3))', alignSelf: 'stretch' }} />
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sidebar-accent-muted, #8C6F1C)', marginBottom: 4 }}>Plazo</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--main-text, #111113)' }}>hasta {Math.round(property.financing_plazo_meses / 12)} años</div>
                        </div>
                      </>
                    )}
                    {property.financing_tasa_anual && (
                      <>
                        <div style={{ width: 1, background: 'var(--main-border, rgba(212,178,84,0.3))', alignSelf: 'stretch' }} />
                        <div>
                          <div style={{ fontSize: '0.6875rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--sidebar-accent-muted, #8C6F1C)', marginBottom: 4 }}>Tasa</div>
                          <div style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--main-text, #111113)' }}>{property.financing_tasa_anual}% anual</div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Map */}
            <div ref={mapRef} style={{ opacity: 0, marginBottom: '2.5rem', paddingBottom: '2.5rem', borderBottom: '1px solid var(--main-border, #E6E0D2)' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--main-text, #111113)', marginBottom: '1.25rem' }}>
                Ubicación aproximada
              </h2>
              <PropertyMap departamento={property.departamento} municipio={property.municipio} mapUrl={property.map_url} />
              <p style={{ fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)', marginTop: '0.75rem', lineHeight: 1.5 }}>
                Ubicado en {property.municipio}, {property.departamento}, Honduras. La ubicación exacta se comparte al confirmar su visita.
              </p>
            </div>

            {/* FAQs */}
            <FAQSection
              financing={property.financing}
              financingPrima={property.financing_prima}
              financingPlazoMeses={property.financing_plazo_meses}
            />

          </div>

          {/* RIGHT — sticky price card */}
          <div style={{ position: 'relative' }}>
            <PriceCard
              property={property}
              priceCardRef={priceCardRef}
              onWhatsApp={handleWhatsAppClick}
              phone="9938-3699"
            />
          </div>

        </div>
      </div>

      {/* Mobile sticky CTA bar */}
      <div
        className="sticky-cta-bar"
        style={{
          display: 'none',
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 200,
          background: 'var(--main-card-bg, #fff)', borderTop: '1.5px solid var(--main-border, #E6E0D2)',
          padding: '0.875rem 1rem',
          boxShadow: '0 -4px 20px rgba(17,17,19,0.08)',
          alignItems: 'center', justifyContent: 'space-between', gap: 12,
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.3s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.6875rem', color: 'var(--main-text-dim, #9A9383)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Precio</div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--main-text, #111113)', fontFeatureSettings: "'tnum' 1" }}>
            {formatPrice(property.discount_price ?? property.price, property.currency)}
          </div>
        </div>
        <WhatsAppButton
          onClick={handleWhatsAppClick}
          size="lg"
          variant="solid"
          borderRadius={12}
          label="Consultar"
          style={{ padding: '0.75rem 1.25rem' }}
        />
      </div>

      {/* Gallery lightbox */}
      {gallery.open && (
        <GalleryModal
          images={images}
          startIdx={gallery.idx}
          onClose={() => setGallery({ open: false, idx: 0 })}
        />
      )}

      {/* Lead capture modal */}
      <LeadCaptureModal
        open={leadModalOpen}
        propertyTitle={property.title}
        onSubmit={handleLeadSubmit}
        onClose={() => setLeadModalOpen(false)}
      />



    </div>
  );
}

export function PropertyDetail(props: Props) {
  return (
    <QueryProvider>
      <PropertyDetailInner {...props} />
    </QueryProvider>
  );
}
