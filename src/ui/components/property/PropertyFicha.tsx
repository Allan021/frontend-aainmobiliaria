import { useMemo, useRef, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useCurrency, priceParts } from '../../hooks/useCurrency';
import { useSettings } from '../../hooks/useSettings';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { cleanTitle, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { GalleryModal } from './detail/GalleryModal';
import { PropertyGallery } from './detail/PropertyGallery';
import { FichaSpecs } from './detail/FichaSpecs';
import { FichaDescription } from './detail/FichaDescription';
import { FichaFinancing } from './detail/FichaFinancing';
import { FichaLocation } from './detail/FichaLocation';
import { FichaHousePreview } from './detail/FichaHousePreview';
import { FichaSidebar } from './detail/FichaSidebar';
import { WhatsAppIcon } from '../shared/Icon';
import { IconCheck, IconChevronLeft } from '../shared/rs-icons';
import { F_ARCHIVO, F_SANS, PHONE_FALLBACK } from './detail/tokens';

interface Props {
  property: Property;
  standalone?: boolean;
}

const CATEGORIAS = ['Fachada', 'Sala', 'Cocina', 'Comedor', 'Dormitorio', 'Baño', 'Patio o jardín', 'Garaje', 'Otro'];

function FichaInner({ property }: Props) {
  const [currency] = useCurrency();
  const { data: settings } = useSettings();
  const phone = settings?.whatsapp_phone || PHONE_FALLBACK;

  const [gallery, setGallery] = useState<{ open: boolean; idx: number; label?: string | null }>({ open: false, idx: 0, label: null });
  const [galleryFilter, setGalleryFilter] = useState<string | null>(null);

  const agendaRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const threeDRef = useRef<HTMLDivElement>(null);
  const scrollA = (ref: React.RefObject<HTMLDivElement | null>, block: ScrollLogicalPosition = 'start') =>
    ref.current?.scrollIntoView({ behavior: 'smooth', block });

  const favIds = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const saved = favIds.has(property.id);
  const handleFav = () => {
    if (!isLoggedIn()) return requireLogin();
    toggleFav.mutate({ propertyId: property.id, saved });
  };

  const images = (property.images || []).map(i => ({ url: i.url, label: i.label }));
  const imageCategories = useMemo(() => {
    const counts = new Map<string, number>();
    images.forEach(i => { if (i.label) counts.set(i.label, (counts.get(i.label) || 0) + 1); });
    return CATEGORIAS.filter(l => counts.has(l)).map(l => ({ label: l, count: counts.get(l)! }));
  }, [property.images]);

  const { main, alt } = priceParts(property.discount_price ?? property.price, property.currency, currency);
  const esTerreno = property.type === 'Terreno' || property.type === 'Lote';

  const openConsulta = () =>
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property } }));

  return (
    <div className="ficha-page" style={{ background: 'var(--pub-bg)', color: 'var(--pub-ink)', fontFamily: F_SANS, minHeight: '60vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
        <nav aria-label="Migas de pan" style={{ fontSize: 13, color: 'var(--pub-dim)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/buscar" style={{ color: 'var(--pub-muted)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconChevronLeft size={13} /> Volver a resultados
          </a>
          <span>·</span>
          <span>{property.municipio}, {property.departamento}</span>
        </nav>

        <PropertyGallery
          images={images}
          alt={cleanTitle(property.title)}
          categories={imageCategories}
          activeLabel={galleryFilter}
          onSelectCategory={setGalleryFilter}
          onOpenLightbox={(idx, label) => setGallery({ open: true, idx, label })}
          threeDLabel={esTerreno ? '3D' : undefined}
          onThreeDClick={() => scrollA(threeDRef)}
          onMapClick={() => scrollA(mapRef)}
          badges={
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#111113', color: '#D4B254', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999, textTransform: 'uppercase' }}>{property.type}</span>
              {property.property_type === 'lotificadora' && (
                <span style={{ background: '#111113', color: '#8CA394', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>
                  Parte de lotificación
                </span>
              )}
              {property.has_deed && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#4A7C59', color: '#FFFFFF', fontSize: 12, fontWeight: 700, padding: '6px 12px', borderRadius: 999 }}>
                  <IconCheck size={12} /> Escritura verificada
                </span>
              )}
            </div>
          }
          favoriteButton={
            <button onClick={e => { e.stopPropagation(); handleFav(); }}
              aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              aria-pressed={saved}
              style={{
                position: 'absolute', top: 12, right: 12, width: 44, height: 44, borderRadius: '50%',
                background: 'rgba(255,255,255,0.94)', border: '1px solid var(--pub-border)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', color: saved ? '#C65D3B' : 'var(--pub-dim)',
              }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill={saved ? '#C65D3B' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          }
        />

        <div className="ficha-body" style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 40, marginTop: 32, alignItems: 'start' }}>
          <div>
            <div className="ficha-title-block" style={{ display: 'flex', alignItems: 'baseline', gap: 14, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 34, letterSpacing: '-0.025em', margin: 0 }}>{main}</h1>
              <span style={{ fontSize: 15, color: 'var(--pub-dim)', fontWeight: 600 }}>{alt}</span>
            </div>
            <h2 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 22, margin: '10px 0 4px', letterSpacing: '-0.02em' }}>
              {cleanTitle(property.title)}
            </h2>
            <div style={{ fontSize: 15, color: 'var(--pub-muted)' }}>{property.municipio}, {property.departamento}</div>

            <FichaSpecs property={property} />
            <FichaDescription property={property} />
            <FichaFinancing property={property} currency={currency} />
            <FichaLocation ref={mapRef} property={property} />
            {esTerreno && <FichaHousePreview ref={threeDRef} property={property} />}
          </div>

          <FichaSidebar ref={agendaRef} property={property} phone={phone} onConsultar={openConsulta} />
        </div>

        <div style={{
          marginTop: 64, padding: '28px 0', borderTop: '1px solid var(--pub-border2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13, color: 'var(--pub-dim)', flexWrap: 'wrap', gap: 12,
        }}>
          <span>© {new Date().getFullYear()} A&A Inmobiliaria · El Progreso, Yoro, Honduras</span>
          <a href="/buscar" style={{ fontWeight: 700, color: '#1F5B42', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <IconChevronLeft size={13} /> Seguir buscando propiedades
          </a>
        </div>
      </div>

      {gallery.open && images.length > 0 && (
        <GalleryModal
          images={images.map(i => ({ url: optimizeCloudinaryUrl(i.url, 1920), title: i.label, label: i.label }))}
          startIdx={gallery.idx}
          initialLabel={gallery.label}
          onClose={() => setGallery({ open: false, idx: 0 })}
        />
      )}

      {/* Barra fija — solo móvil/tablet, donde el sidebar deja de ser sticky */}
      <div className="ficha-mobile-cta">
        <button onClick={() => scrollA(agendaRef, 'center')} className="ficha-cta ficha-cta--agenda" style={{ flex: 1 }}>
          Agendar visita
        </button>
        <button onClick={openConsulta} className="ficha-cta ficha-cta--wa" style={{ flex: 1 }}>
          <WhatsAppIcon size={15} color="#0A3D22" /> WhatsApp
        </button>
      </div>
    </div>
  );
}

export function PropertyFicha(props: Props) {
  return (
    <QueryProvider>
      <FichaInner {...props} />
    </QueryProvider>
  );
}
