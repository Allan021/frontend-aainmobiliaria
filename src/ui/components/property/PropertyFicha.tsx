import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useCurrency, priceParts, fmtLps, fmtUsd, HNL_PER_USD } from '../../hooks/useCurrency';
import { useSettings } from '../../hooks/useSettings';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { leadAdapter } from '../../../infrastructure/api/leadAdapter';
import { cleanTitle, fmtVaras, parseDescription, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl, cloudinarySrcSet } from '../../../core/utils/cloudinaryUtils';
import { GalleryModal } from './detail/GalleryModal';
import { LotMassingViewer } from './detail/LotMassingViewer';
import { WhatsAppIcon } from '../shared/Icon';
import { IconShield, IconCheck, IconCamera, IconMapPin, IconVideo, IconDroplet, IconZap, IconScroll, IconArea } from '../shared/rs-icons';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

const PHONE_FALLBACK = '50499383699';

function tileUrl(): string {
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  return dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}


interface Props {
  property: Property;
  standalone?: boolean;
}

function waLink(phone: string, msg: string) {
  const num = phone.replace(/\D/g, '');
  return `https://wa.me/${num.startsWith('504') ? num : '504' + num}?text=${encodeURIComponent(msg)}`;
}

/* ── Mapa de zona aproximada (leaflet dinámico — sin romper SSR) ── */
function ZoneMap({ lat, lng }: { lat: number; lng: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { zoomControl: false, scrollWheelZoom: false, dragging: false, attributionControl: false })
        .setView([lat, lng], 14);
      L.tileLayer(tileUrl(), { subdomains: 'abcd', maxZoom: 20 }).addTo(map);
      L.circle([lat, lng], {
        radius: 420, color: '#C65D3B', weight: 2, fillColor: '#C65D3B', fillOpacity: 0.18,
      }).addTo(map);
      L.circleMarker([lat, lng], { radius: 7, color: '#FFFFFF', weight: 3, fillColor: '#C65D3B', fillOpacity: 1 }).addTo(map);
    })();
    return () => { cancelled = true; map?.remove(); };
  }, [lat, lng]);

  return <div ref={ref} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />;
}

/* ── Sidebar: agendar visita ── */
function AgendarVisita({ property, phone }: { property: Property; phone: string }) {
  const days = useMemo(() => {
    const dows = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];
    const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    const out: { value: string; dow: string; num: number; label: string }[] = [];
    for (let i = 1; i <= 8; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      out.push({
        value: d.toISOString().slice(0, 10),
        dow: dows[d.getDay()],
        num: d.getDate(),
        label: `${dows[d.getDay()]} ${d.getDate()} ${meses[d.getMonth()]}`,
      });
    }
    return out;
  }, []);
  const HORAS = ['9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '4:00 PM'];

  const [dia, setDia] = useState(0);
  const [hora, setHora] = useState(HORAS[1]);
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    setError('');
    if (!name.trim() || !tel.trim()) { setError('Ingresá tu nombre y tu WhatsApp para confirmar.'); return; }
    setSending(true);
    const d = days[dia];
    try {
      await leadAdapter.create({
        name: name.trim(),
        email: '',
        phone: tel.trim(),
        property_id: property.id,
        property_title: property.title,
        visit_date: d.value,
        visit_time: hora,
      });
    } catch {
      // el lead es best-effort: la visita se confirma por WhatsApp igual
    }
    const msg = `Hola A&A, soy ${name.trim()}. Quiero agendar una visita a: ${cleanTitle(property.title)} (${property.municipio}, ${property.departamento}).\nDía: ${d.label}\nHora: ${hora}\n¿Me confirman disponibilidad?`;
    window.open(waLink(phone, msg), '_blank', 'noopener');
    setSending(false);
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1.5px solid var(--pub-border2)', borderRadius: 10, padding: '11px 14px',
    fontFamily: F_SANS, fontSize: 14, fontWeight: 500,
    outlineColor: '#1F5B42', background: 'var(--pub-bg)', color: 'var(--pub-ink)',
  };

  return (
    <div style={{
      background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 18, padding: 24,
      boxShadow: '0 16px 40px -16px rgba(17,17,19,0.12)',
    }}>
      <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em', marginBottom: 4, color: 'var(--pub-ink)' }}>
        Agendá tu visita
      </div>
      <div style={{ fontSize: '13.5px', color: 'var(--pub-muted)', marginBottom: 18 }}>
        Elegí día y hora — te confirmamos por WhatsApp. Sin llamadas, sin compromiso.
      </div>

      <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.12em', color: 'var(--pub-dim)', marginBottom: 8 }}>DÍA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
        {days.map((d, i) => {
          const sel = dia === i;
          return (
            <button key={d.value} type="button" onClick={() => setDia(i)} style={{
              border: sel ? '2px solid #1F5B42' : '1.5px solid var(--pub-border2)',
              background: sel ? '#1F5B42' : 'var(--pub-bg)',
              color: sel ? '#EEF5F0' : 'var(--pub-muted2)',
              borderRadius: 10, padding: '8px 0', cursor: 'pointer',
              fontFamily: F_SANS, textAlign: 'center', transition: 'all 0.15s',
            }}>
              <span style={{ display: 'block', fontSize: '10.5px', fontWeight: 600, opacity: 0.75 }}>{d.dow}</span>
              <span style={{ display: 'block', fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 16 }}>{d.num}</span>
            </button>
          );
        })}
      </div>

      <div style={{ fontFamily: F_MONO, fontSize: '10.5px', letterSpacing: '0.12em', color: 'var(--pub-dim)', marginBottom: 8 }}>HORA</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
        {HORAS.map(h => {
          const sel = hora === h;
          return (
            <button key={h} type="button" onClick={() => setHora(h)} style={{
              border: sel ? '2px solid #1F5B42' : '1.5px solid var(--pub-border2)',
              background: sel ? '#1F5B42' : 'var(--pub-bg)',
              color: sel ? '#EEF5F0' : 'var(--pub-muted2)',
              borderRadius: 9, padding: '9px 0', cursor: 'pointer',
              fontFamily: F_SANS, fontWeight: sel ? 700 : 600, fontSize: 13, transition: 'all 0.15s',
            }}>{h}</button>
          );
        })}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <input placeholder="Tu nombre" aria-label="Tu nombre" value={name} onChange={e => setName(e.target.value)} style={inputStyle} autoComplete="name" />
        <input placeholder="Tu WhatsApp (ej. 9999-9999)" aria-label="Tu WhatsApp" value={tel} onChange={e => setTel(e.target.value)} style={inputStyle} autoComplete="tel" inputMode="tel" />
      </div>

      {error && <div style={{ fontSize: '12.5px', color: '#8C3A2E', fontWeight: 600, marginBottom: 10 }} role="alert">{error}</div>}

      <button onClick={submit} disabled={sending} style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: '100%', textAlign: 'center', background: '#25D366', color: '#0A3D22',
        fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: '15.5px', padding: '15px 0',
        borderRadius: 12, border: 'none', cursor: sending ? 'wait' : 'pointer', transition: 'background 0.15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
        onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
      >
        <WhatsAppIcon size={16} color="#0A3D22" />
        {sending ? 'Enviando…' : 'Confirmar visita por WhatsApp'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 12, color: 'var(--pub-dim)', marginTop: 10 }}>
        Visita: {days[dia].label} · {hora}
      </div>
    </div>
  );
}

function FichaInner({ property }: Props) {
  const [currency] = useCurrency();
  const { data: settings } = useSettings();
  const phone = settings?.whatsapp_phone || PHONE_FALLBACK;
  const [gallery, setGallery] = useState<{ open: boolean; idx: number; label?: string | null }>({ open: false, idx: 0, label: null });
  const agendaRef = useRef<HTMLDivElement>(null);
  const scrollToAgenda = () => agendaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const favIds = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const saved = favIds.has(property.id);
  const handleFav = () => {
    if (!isLoggedIn()) return requireLogin();
    toggleFav.mutate({ propertyId: property.id, saved });
  };

  const images = (property.images || []).map(i => ({ url: i.url, label: i.label }));
  const imageCategories = useMemo(() => {
    const order = ['Fachada', 'Sala', 'Cocina', 'Comedor', 'Dormitorio', 'Baño', 'Patio o jardín', 'Garaje', 'Otro'];
    const counts = new Map<string, number>();
    images.forEach(i => { if (i.label) counts.set(i.label, (counts.get(i.label) || 0) + 1); });
    return order.filter(l => counts.has(l)).map(l => ({ label: l, count: counts.get(l)! }));
  }, [property.images]);
  const { main, alt } = priceParts(property.discount_price ?? property.price, property.currency, currency);

  // Financiamiento estimado
  const [prima, setPrima] = useState(20);
  const [plazo, setPlazo] = useState(8);
  const basePrice = property.discount_price ?? property.price;
  const isUsd = currency === 'USD';
  const baseInDisplay = isUsd
    ? (property.currency === '$' ? basePrice : Math.round(basePrice / HNL_PER_USD))
    : (property.currency === '$' ? Math.round(basePrice * HNL_PER_USD) : basePrice);
  const cuotaN = Math.round((baseInDisplay * (1 - prima / 100)) / (plazo * 12));
  const primaN = Math.round(baseInDisplay * (prima / 100));
  const cuotaStr = isUsd ? `${fmtUsd(cuotaN)}/mes` : `L ${cuotaN.toLocaleString('es-HN')}/mes`;
  const primaStr = isUsd ? fmtUsd(primaN) : `L ${primaN.toLocaleString('es-HN')}`;

  const stats = [
    property.bedrooms ? { v: String(property.bedrooms), l: 'Habitaciones' } : null,
    property.bathrooms ? { v: String(property.bathrooms), l: 'Baños' } : null,
    property.parking ? { v: String(property.parking), l: 'Parqueos' } : null,
    property.area_varas ? { v: fmtVaras(property.area_varas), l: property.area_m2 ? `≈ ${property.area_m2}` : 'Área' } : null,
  ].filter(Boolean) as { v: string; l: string }[];

  const descBlocks = parseDescription(property.description);

  const openConsulta = () =>
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property } }));

  const galleryCell = (idx: number, radius: string): React.CSSProperties => ({
    position: 'relative', cursor: images.length > idx ? 'pointer' : 'default',
    background: 'var(--pub-border)', overflow: 'hidden', borderRadius: radius,
  });

  return (
    <div className="ficha-page" style={{ background: 'var(--pub-bg)', color: 'var(--pub-ink)', fontFamily: F_SANS, minHeight: '60vh' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: 24 }}>
        {/* Migas */}
        <div style={{ fontSize: 13, color: 'var(--pub-dim)', marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <a href="/buscar" style={{ color: 'var(--pub-muted)', fontWeight: 600, textDecoration: 'none' }}>← Volver a resultados</a>
          <span>·</span>
          <span>{property.municipio}, {property.departamento}</span>
        </div>

        {/* Galería */}
        <div className="ficha-gallery" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, height: 440 }}>
          <div onClick={() => images.length > 0 && setGallery({ open: true, idx: 0 })} style={galleryCell(0, '18px 0 0 18px')}>
            {images[0] ? (
              <img src={optimizeCloudinaryUrl(images[0].url, 1100)}
                srcSet={cloudinarySrcSet(images[0].url, 1100)}
                sizes="(max-width: 768px) 100vw, 66vw"
                alt={cleanTitle(property.title)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{
                height: '100%', display: 'grid', placeItems: 'center',
                background: 'repeating-linear-gradient(45deg, var(--pub-border) 0 14px, var(--pub-bg) 14px 28px)',
                fontFamily: F_MONO, fontSize: 12, color: 'var(--pub-dim)',
              }}>FOTO PENDIENTE</div>
            )}
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
            <button onClick={e => { e.stopPropagation(); handleFav(); }}
              aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
              style={{
                position: 'absolute', top: 12, right: 12, width: 42, height: 42, borderRadius: '50%',
                background: 'rgba(255,255,255,0.94)', border: '1px solid var(--pub-border)', cursor: 'pointer',
                display: 'grid', placeItems: 'center', color: saved ? '#C65D3B' : 'var(--pub-dim)',
              }}>
              <svg width="19" height="19" viewBox="0 0 24 24" fill={saved ? '#C65D3B' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
            {images.length > 0 && (
              <button onClick={e => { e.stopPropagation(); setGallery({ open: true, idx: 0 }); }} style={{
                position: 'absolute', bottom: 14, right: 14,
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(17,17,19,0.8)', color: '#FAF8F3', fontSize: '12.5px', fontWeight: 600,
                padding: '7px 14px', borderRadius: 999, border: 'none', cursor: 'pointer', fontFamily: 'inherit',
              }}>
                <IconCamera size={13} /> Ver las {images.length} fotos
              </button>
            )}
          </div>
          <div className="ficha-gallery-side" style={{ display: 'grid', gridTemplateRows: '1fr 1fr', gap: 10 }}>
            <div onClick={() => images.length > 1 && setGallery({ open: true, idx: 1 })} style={galleryCell(1, '0 18px 0 0')}>
              {images[1] && <img src={optimizeCloudinaryUrl(images[1].url, 560)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div onClick={() => images.length > 2 && setGallery({ open: true, idx: 2 })} style={galleryCell(2, '0')}>
                {images[2] && <img src={optimizeCloudinaryUrl(images[2].url, 320)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
              <div onClick={() => images.length > 3 && setGallery({ open: true, idx: 3 })} style={galleryCell(3, '0 0 18px 0')}>
                {images[3] && <img src={optimizeCloudinaryUrl(images[3].url, 320)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
              </div>
            </div>
          </div>
        </div>

        {/* Filtro rápido de fotos por ambiente — sólo si la IA etiquetó fotos */}
        {imageCategories.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', margin: '14px 0 0', paddingBottom: 2 }}>
            {imageCategories.map(c => (
              <button key={c.label} onClick={() => setGallery({ open: true, idx: 0, label: c.label })} style={{
                flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 999,
                padding: '8px 15px', fontSize: '13px', fontWeight: 600, color: 'var(--pub-muted2)',
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>{c.label} <span style={{ opacity: 0.55 }}>({c.count})</span></button>
            ))}
          </div>
        )}

        {/* Cuerpo */}
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

            {/* Características */}
            {stats.length > 0 && (
              <div className="ficha-stats" style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(stats.length, 4)}, 1fr)`, gap: 12, margin: '24px 0' }}>
                {stats.map(s => (
                  <div key={s.l} style={{ background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 12, padding: 16, textAlign: 'center' }}>
                    <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 22 }}>{s.v}</div>
                    <div style={{ fontSize: '12.5px', color: 'var(--pub-muted)', fontWeight: 600 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Servicios y documentos — clave en terrenos/solares */}
            {(property.has_water || property.has_power || property.has_deed) && (
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '0 0 4px' }}>
                {property.has_water && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 10, padding: '9px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--pub-muted2)' }}>
                    <span style={{ color: '#1F5B42', display: 'flex' }}><IconDroplet size={15} /></span> Agua potable
                  </span>
                )}
                {property.has_power && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 10, padding: '9px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--pub-muted2)' }}>
                    <span style={{ color: '#B8962E', display: 'flex' }}><IconZap size={15} /></span> Energía eléctrica
                  </span>
                )}
                {property.has_deed && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 10, padding: '9px 14px', fontSize: '13.5px', fontWeight: 600, color: 'var(--pub-muted2)' }}>
                    <span style={{ color: '#4A7C59', display: 'flex' }}><IconScroll size={15} /></span> Escritura en regla
                  </span>
                )}
              </div>
            )}

            {/* Lo especial — chips estilo Zillow "What's special" */}
            {(property.highlights?.length ?? 0) > 0 && (
              <>
                <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '28px 0 12px' }}>Lo especial</h3>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {property.highlights.map(h => (
                    <span key={h} className="ficha-highlight-chip" style={{
                      background: 'var(--pub-bg)', border: '1px solid var(--pub-border2)',
                      borderRadius: 8, padding: '8px 13px',
                      fontSize: '12.5px', fontWeight: 700, letterSpacing: '0.03em',
                      textTransform: 'uppercase', color: 'var(--pub-muted2)',
                    }}>{h}</span>
                  ))}
                </div>
              </>
            )}

            {/* Descripción */}
            <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '28px 0 12px' }}>Sobre esta propiedad</h3>
            {descBlocks.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {descBlocks.map((b, i) => {
                  if (b.type === 'heading') {
                    return (
                      <div key={i} style={{
                        fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 14.5, color: 'var(--pub-ink)',
                        letterSpacing: '-0.01em', margin: i === 0 ? '0 0 8px' : '18px 0 8px',
                      }}>{b.text.replace(/:$/, '')}</div>
                    );
                  }
                  if (b.type === 'bullet') {
                    return (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, padding: '3px 0' }}>
                        <span style={{ color: '#4A7C59', display: 'flex', marginTop: 3, flexShrink: 0 }}><IconCheck size={14} /></span>
                        <span style={{ fontSize: '15px', lineHeight: 1.55, color: 'var(--pub-muted2)' }}>{b.text}</span>
                      </div>
                    );
                  }
                  return (
                    <p key={i} style={{ fontSize: '15.5px', lineHeight: 1.7, color: 'var(--pub-muted2)', margin: '6px 0' }}>{b.text}</p>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '15.5px', color: 'var(--pub-dim)', margin: 0 }}>Consultá los detalles por WhatsApp.</p>
            )}

            {/* Verificación */}
            <div style={{ background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)', borderRadius: 14, padding: '20px 22px', marginTop: 28 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 15, color: '#1F5B42', marginBottom: 12 }}>
                <IconShield size={17} /> Verificado por A&A Inmobiliaria
              </div>
              <div className="ficha-verify-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 14, color: 'var(--pub-green-ink)' }}>
                {[
                  property.has_deed ? 'Escritura revisada en el Instituto de la Propiedad' : null,
                  'Libre de gravámenes y anotaciones', 'Medidas confirmadas en sitio', 'Vendedor con identidad verificada',
                ].filter((t): t is string => !!t).map(t => (
                  <span key={t} style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 7 }}>
                    <span style={{ color: '#4A7C59', display: 'flex', marginTop: 3 }}><IconCheck size={13} /></span>{t}
                  </span>
                ))}
              </div>
              <div style={{ fontSize: 13, color: '#4A7C59', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--pub-green-border)' }}>
                Publicado vía A&A · Los datos del propietario permanecen privados. Toda visita y negociación se coordina con nuestro equipo.
              </div>
            </div>

            {/* Financiamiento */}
            <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>Financiamiento estimado</h3>
            <div style={{ background: 'var(--pub-surface)', border: '1px solid var(--pub-border)', borderRadius: 14, padding: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 13, color: 'var(--pub-muted)', fontWeight: 600 }}>Cuota mensual estimada</div>
                  <div style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 28, color: '#1F5B42' }}>{cuotaStr}</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--pub-muted)', textAlign: 'right' }}>
                  Prima {prima}% ({primaStr})<br />Plazo {plazo} {plazo === 1 ? 'año' : 'años'} · propiedades elegibles
                </div>
              </div>
              <div className="ficha-sliders" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--pub-muted2)', display: 'block' }}>
                  Prima: {prima}%
                  <input type="range" min={20} max={50} step={5} value={prima} onChange={e => setPrima(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#1F5B42', marginTop: 6 }} aria-label="Porcentaje de prima" />
                </label>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--pub-muted2)', display: 'block' }}>
                  Plazo: {plazo} {plazo === 1 ? 'año' : 'años'}
                  <input type="range" min={1} max={8} step={1} value={plazo} onChange={e => setPlazo(Number(e.target.value))}
                    style={{ width: '100%', accentColor: '#1F5B42', marginTop: 6 }} aria-label="Plazo en años" />
                </label>
              </div>
              <div style={{ fontSize: 12, color: 'var(--pub-dim)', marginTop: 14 }}>
                Estimación sin intereses de referencia. El plan final se confirma con nuestro equipo según la propiedad.
              </div>
            </div>

            {/* Ubicación */}
            <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>Ubicación</h3>
            <div style={{
              position: 'relative', height: 260, borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--pub-border2)', background: 'linear-gradient(150deg, #F1F5EE 0%, #E6EEE2 60%, #EBF0DF 100%)',
            }}>
              {property.lat != null && property.lng != null ? (
                <ZoneMap lat={property.lat} lng={property.lng} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontFamily: F_MONO, fontSize: 11, color: '#8CA394', letterSpacing: '0.14em' }}>
                  {(property.municipio || 'HONDURAS').toUpperCase()}
                </div>
              )}
              <div style={{
                position: 'absolute', bottom: 12, left: 12, zIndex: 500,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'rgba(255,255,255,0.92)', borderRadius: 999, padding: '7px 14px',
                fontSize: '12.5px', fontWeight: 600, color: '#1F5B42',
              }}>
                <IconMapPin size={13} /> Zona aproximada por seguridad — la dirección exacta se comparte al agendar
              </div>
            </div>

            {/* Simulación 3D — sólo terrenos/lotes sin construcción */}
            {(property.type === 'Terreno' || property.type === 'Lote') && (
              <>
                <h3 style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 18, margin: '32px 0 12px' }}>
                  Así podría verse tu casa acá
                </h3>
                <LotMassingViewer areaM2={property.area_m2} />
              </>
            )}
          </div>

          {/* Sidebar */}
          <aside className="ficha-sidebar" style={{ position: 'sticky', top: 88, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div ref={agendaRef}>
              <AgendarVisita property={property} phone={phone} />
            </div>

            <div style={{ background: '#111113', borderRadius: 18, padding: 22, color: '#FAF8F3' }}>
              <div style={{ fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: '15.5px', marginBottom: 6 }}>
                ¿Tenés preguntas sobre esta propiedad?
              </div>
              <div style={{ fontSize: '13.5px', color: '#B9B9C0', marginBottom: 16 }}>
                Nuestro equipo responde en minutos, de lunes a sábado.
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={openConsulta} style={{
                  flex: 1, textAlign: 'center', background: '#25D366', color: '#0A3D22',
                  fontWeight: 700, fontSize: '13.5px', padding: '11px 0', borderRadius: 10,
                  border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
                ><WhatsAppIcon size={13} color="#0A3D22" /> Consultar</button>
                <a href={`tel:+${phone.replace(/\D/g, '')}`} style={{
                  flex: 1, textAlign: 'center', border: '1.5px solid #5E4A11', color: '#D4B254',
                  fontWeight: 700, fontSize: '13.5px', padding: '11px 0', borderRadius: 10,
                  textDecoration: 'none', transition: 'background 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#1C1C1F'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >Llamar ahora</a>
              </div>
            </div>

            <div style={{ background: 'var(--pub-green-bg)', border: '1px solid var(--pub-green-border)', borderRadius: 14, padding: '16px 18px', fontSize: 13, color: 'var(--pub-green-ink)', lineHeight: 1.55 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 700 }}>
                <IconVideo size={14} /> ¿Estás en Estados Unidos?
              </span>{' '}
              Pedí un tour en video por WhatsApp y te enviamos los documentos escaneados.{' '}
              <button onClick={openConsulta} style={{
                fontWeight: 700, textDecoration: 'underline', textUnderlineOffset: 2,
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--pub-green-ink)',
                fontFamily: 'inherit', fontSize: 13, padding: 0,
              }}>Solicitar tour →</button>
            </div>
          </aside>
        </div>

        {/* Pie */}
        <div style={{
          marginTop: 64, padding: '28px 0', borderTop: '1px solid var(--pub-border2)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          fontSize: 13, color: 'var(--pub-dim)', flexWrap: 'wrap', gap: 12,
        }}>
          <span>© 2026 A&A Inmobiliaria · El Progreso, Yoro, Honduras</span>
          <a href="/buscar" style={{ fontWeight: 700, color: '#1F5B42', textDecoration: 'none' }}>← Seguir buscando propiedades</a>
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

      {/* Barra de contacto fija — sólo mobile/tablet, donde el sidebar deja de ser sticky */}
      <div className="ficha-mobile-cta">
        <button onClick={scrollToAgenda} style={{
          flex: 1, textAlign: 'center', background: '#1F5B42', color: '#EEF5F0',
          fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 14, padding: '13px 0',
          borderRadius: 12, border: 'none', cursor: 'pointer',
        }}>Agendar visita</button>
        <button onClick={openConsulta} style={{
          flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 7,
          background: '#25D366', color: '#0A3D22',
          fontFamily: F_ARCHIVO, fontWeight: 700, fontSize: 14, padding: '13px 0',
          borderRadius: 12, border: 'none', cursor: 'pointer',
        }}><WhatsAppIcon size={15} color="#0A3D22" /> WhatsApp</button>
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
