import { useEffect, useMemo, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useProperties } from '../../hooks/useProperties';
import { useCurrency, priceParts } from '../../hooks/useCurrency';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { MapView } from './MapView';
import { cleanTitle, fmtVaras, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { WhatsAppIcon } from '../shared/Icon';
import { IconSearch, IconMap, IconList, IconHome, IconBed, IconBath, IconArea, IconCheck } from '../shared/rs-icons';

const F_ARCHIVO = "'Archivo', 'Plus Jakarta Sans', sans-serif";
const F_SANS = "'Instrument Sans', 'Plus Jakarta Sans', sans-serif";
const F_MONO = "'JetBrains Mono', monospace";

const TIPO_CHIPS = [
  { label: 'Todos', value: '' },
  { label: 'Casas', value: 'Casa' },
  { label: 'Terrenos', value: 'Terreno' },
  { label: 'Lotes', value: 'Lote' },
  { label: 'Comercial', value: 'Comercial' },
];

const PRICE_RANGES = [
  { label: 'Precio: cualquiera', min: '', max: '' },
  { label: 'Hasta L 500 mil', min: '', max: '500000' },
  { label: 'L 500 mil – 1.5 M', min: '500000', max: '1500000' },
  { label: 'L 1.5 M – 3 M', min: '1500000', max: '3000000' },
  { label: 'Más de L 3 M', min: '3000000', max: '' },
];

function getInitialParam(name: string): string {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get(name) || '';
}

/* ── Card horizontal de la lista ── */
function ResultCard({ p, active, saved, onSelect, onOpen, onWhatsApp, onToggleSave }: {
  p: Property; active: boolean; saved: boolean;
  onSelect: () => void; onOpen: () => void; onWhatsApp: () => void; onToggleSave: () => void;
}) {
  const [currency] = useCurrency();
  const { main } = priceParts(p.discount_price ?? p.price, p.currency, currency);
  const img = p.images?.[0]?.url;

  return (
    <div onClick={onSelect} className="result-card" style={{
      display: 'flex', gap: 14, background: 'var(--pub-surface)', borderRadius: 14, padding: 10,
      border: active ? '2px solid #C65D3B' : '1px solid var(--pub-border)',
      boxShadow: active ? '0 12px 32px -10px rgba(198,93,59,0.25)' : 'none',
      cursor: 'pointer', fontFamily: F_SANS, color: 'var(--pub-ink)',
      transition: 'border-color 0.15s, box-shadow 0.2s',
    }}>
      <div className="result-card__media" style={{ position: 'relative', width: 168, flexShrink: 0, alignSelf: 'stretch', minHeight: 150 }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: 10, overflow: 'hidden', background: 'var(--pub-border)' }}>
          {img ? (
            <img src={optimizeCloudinaryUrl(img, 340)} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ height: '100%', display: 'grid', placeItems: 'center', fontFamily: F_MONO, fontSize: '8.5px', color: 'var(--pub-dim)', textAlign: 'center', padding: '0 8px' }}>FOTO PENDIENTE</div>
          )}
        </div>
        <span style={{
          position: 'absolute', top: 8, left: 8, background: '#111113', color: '#D4B254',
          fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '4px 8px', borderRadius: 999, textTransform: 'uppercase',
        }}>{p.type}</span>
      </div>

      <div style={{ flex: 1, padding: '2px 0', display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 19, letterSpacing: '-0.02em' }}>{main}</span>
          <button onClick={e => { e.stopPropagation(); onToggleSave(); }}
            aria-label={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', lineHeight: 1, color: saved ? '#C65D3B' : 'var(--pub-dim)', padding: 0, display: 'flex' }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill={saved ? '#C65D3B' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </button>
        </div>
        <div>
          <span onClick={e => { e.stopPropagation(); onOpen(); }} style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--pub-ink)', display: 'block', cursor: 'pointer' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#C65D3B'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--pub-ink)'; }}
          >{cleanTitle(p.title)}</span>
          <span style={{ fontSize: '12.5px', color: 'var(--pub-muted)' }}>{p.municipio}, {p.departamento}</span>
        </div>
        <div style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--pub-muted2)', fontWeight: 600, flexWrap: 'wrap' }}>
          {p.bedrooms ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconBed size={13} /> {p.bedrooms}</span> : null}
          {p.bathrooms ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconBath size={13} /> {p.bathrooms}</span> : null}
          {p.area_varas ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconArea size={12} /> {fmtVaras(p.area_varas)}</span> : null}
          {p.financing ? <span style={{ color: '#1F5B42' }}>En cuotas</span> : null}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#4A7C59', fontWeight: 600, marginTop: 'auto' }}>
          <IconCheck size={11} /> Escritura verificada
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={e => { e.stopPropagation(); onOpen(); }} style={{
            flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '12.5px', color: '#1F5B42',
            border: '1.5px solid #1F5B42', borderRadius: 8, padding: '7px 0',
            background: 'transparent', cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#EEF5F0'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >Agendar visita</button>
          <button onClick={e => { e.stopPropagation(); onWhatsApp(); }} style={{
            flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '12.5px', color: '#0A3D22',
            background: '#25D366', borderRadius: 8, padding: '8.5px 0', border: 'none',
            cursor: 'pointer', fontFamily: 'inherit',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 5, transition: 'background 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = '#3BE07B'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#25D366'; }}
          ><WhatsAppIcon size={12} color="#0A3D22" /> Consultar</button>
        </div>
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div style={{ display: 'flex', gap: 14, background: 'var(--pub-surface)', borderRadius: 14, padding: 10, border: '1px solid var(--pub-border)' }}>
      <div className="rs-skeleton" style={{ width: 168, height: 150, flexShrink: 0 }} />
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div className="rs-skeleton" style={{ height: 19, width: '40%', marginBottom: 10 }} />
        <div className="rs-skeleton" style={{ height: 14, width: '75%', marginBottom: 8 }} />
        <div className="rs-skeleton" style={{ height: 12, width: '55%' }} />
      </div>
    </div>
  );
}

function SearchInner({ initialSearch }: { initialSearch?: string }) {
  const [searchInput, setSearchInput] = useState(() => getInitialParam('q') || initialSearch || '');
  const [search, setSearch] = useState(() => getInitialParam('q') || initialSearch || '');
  const [type, setType] = useState(() => getInitialParam('type'));
  const [priceIdx, setPriceIdx] = useState(0);
  const [beds, setBeds] = useState('');
  const [cuotas, setCuotas] = useState(false);
  const [sort, setSort] = useState('recent');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileMap, setMobileMap] = useState(false);
  const [currency] = useCurrency();

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const range = PRICE_RANGES[priceIdx];
  const { data, isLoading } = useProperties({
    status: 'disponible',
    limit: 100,
    search: search || undefined,
    type: type || undefined,
    minPrice: range.min ? Number(range.min) : undefined,
    maxPrice: range.max ? Number(range.max) : undefined,
    beds: beds ? Number(beds) : undefined,
    pay: cuotas ? 'financing' : undefined,
  });

  const properties = useMemo(() => {
    const list = [...(data?.data || [])];
    if (sort === 'priceAsc') list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price));
    if (sort === 'priceDesc') list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price));
    return list;
  }, [data, sort]);

  const favIds = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const handleToggleSave = (p: Property) => {
    if (!isLoggedIn()) return requireLogin();
    toggleFav.mutate({ propertyId: p.id, saved: favIds.has(p.id) });
  };

  const openProperty = (p: Property) => { window.location.href = `/propiedad/${p.id}`; };
  const openWhatsApp = (p: Property) =>
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: p } }));

  return (
    <div style={{ background: 'var(--pub-bg)', fontFamily: F_SANS, display: 'flex', flexDirection: 'column' }}>
      {/* Barra de filtros */}
      <div style={{
        background: 'var(--pub-surface)', borderBottom: '1px solid var(--pub-border2)',
        position: 'sticky', top: 64, zIndex: 400,
      }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 220px', maxWidth: 340 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#1F5B42', display: 'flex' }}>
              <IconSearch size={14} />
            </span>
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="El Progreso, Yoro, San Pedro Sula…"
              aria-label="Buscar por ubicación"
              style={{
                width: '100%', boxSizing: 'border-box',
                border: '1.5px solid var(--pub-border2)', borderRadius: 10, padding: '10px 14px 10px 34px',
                fontFamily: F_SANS, fontSize: 14, fontWeight: 500,
                outlineColor: '#1F5B42', background: 'var(--pub-bg)', color: 'var(--pub-ink)',
              }}
            />
          </div>

          {TIPO_CHIPS.map(c => {
            const active = type === c.value;
            return (
              <button key={c.label} onClick={() => setType(c.value)} style={{
                fontFamily: F_SANS, fontSize: '13.5px', fontWeight: active ? 700 : 600,
                padding: '9px 16px', borderRadius: 999,
                border: `1.5px solid ${active ? '#1F5B42' : 'var(--pub-border2)'}`,
                background: active ? '#1F5B42' : 'var(--pub-surface)',
                color: active ? '#EEF5F0' : 'var(--pub-muted2)',
                cursor: 'pointer', transition: 'all 0.15s',
              }}>{c.label}</button>
            );
          })}

          <a href="/lotificaciones" style={{
            fontFamily: F_SANS, fontSize: '13.5px', fontWeight: 600,
            padding: '9px 16px', borderRadius: 999,
            border: '1.5px solid var(--pub-border2)', background: 'var(--pub-surface)', color: 'var(--pub-muted2)',
            textDecoration: 'none', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#1F5B42'; e.currentTarget.style.color = '#1F5B42'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--pub-border2)'; e.currentTarget.style.color = 'var(--pub-muted2)'; }}
          >Lotificaciones →</a>

          <div className="search-filter-divider" style={{ width: 1, height: 28, background: 'var(--pub-border2)' }} />

          <select className="pub-select" value={priceIdx} onChange={e => setPriceIdx(Number(e.target.value))} aria-label="Rango de precio">
            {PRICE_RANGES.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
          </select>

          <select className="pub-select" value={beds} onChange={e => setBeds(e.target.value)} aria-label="Habitaciones">
            <option value="">Habitaciones</option>
            {[1, 2, 3, 4].map(n => <option key={n} value={n}>{n}+</option>)}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: '13.5px', fontWeight: 600, color: '#1F5B42', cursor: 'pointer', padding: '8px 4px' }}>
            <input type="checkbox" checked={cuotas} onChange={e => setCuotas(e.target.checked)}
              style={{ accentColor: '#1F5B42', width: 16, height: 16 }} />
            Solo en cuotas
          </label>

          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: F_MONO, fontSize: 12, color: 'var(--pub-muted)' }} aria-live="polite">
            {isLoading ? 'Buscando…' : `${data?.total ?? properties.length} resultados`}
          </span>
        </div>
      </div>

      {/* Mapa + listado */}
      <div className="search-layout">
        <div className={`search-map-col ${mobileMap ? 'search-map-col--visible' : ''}`}>
          <MapView
            properties={properties}
            currency={currency}
            selectedId={selectedId}
            onSelect={p => setSelectedId(p.id)}
            onOpen={openProperty}
          />
        </div>

        <div className={`search-results-col ${mobileMap ? 'search-results-col--hidden' : ''}`}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, gap: 10 }}>
            <h1 style={{ fontFamily: F_ARCHIVO, fontWeight: 800, fontSize: 20, margin: 0, letterSpacing: '-0.02em', color: 'var(--pub-ink)' }}>
              Propiedades en Honduras
            </h1>
            <select className="pub-select" value={sort} onChange={e => setSort(e.target.value)} aria-label="Ordenar"
              style={{ fontSize: '12.5px', padding: '7px 30px 7px 10px', borderRadius: 8 }}>
              <option value="recent">Más recientes</option>
              <option value="priceAsc">Menor precio</option>
              <option value="priceDesc">Mayor precio</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {isLoading && <><RowSkeleton /><RowSkeleton /><RowSkeleton /></>}
            {properties.map(p => (
              <ResultCard
                key={p.id}
                p={p}
                active={p.id === selectedId}
                saved={favIds.has(p.id)}
                onSelect={() => setSelectedId(p.id)}
                onOpen={() => openProperty(p)}
                onWhatsApp={() => openWhatsApp(p)}
                onToggleSave={() => handleToggleSave(p)}
              />
            ))}
          </div>

          {!isLoading && properties.length === 0 && (
            <div className="rs-empty">
              <div className="rs-empty__icon"><IconHome size={28} /></div>
              <div className="rs-empty__title">Sin resultados</div>
              <div className="rs-empty__sub">Pruebe ampliar los filtros o buscar otra zona.</div>
            </div>
          )}

          {!isLoading && properties.length > 0 && (
            <div style={{ textAlign: 'center', padding: '24px 0 8px' }}>
              <span style={{ fontSize: 13, color: 'var(--pub-dim)' }}>
                Mostrando {properties.length} propiedades ·{' '}
                <button onClick={() => openWhatsApp(null as unknown as Property)} style={{
                  color: '#1F5B42', fontWeight: 700, background: 'none', border: 'none',
                  cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, padding: 0,
                }}>¿No encontrás lo que buscás? Escribinos</button>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Toggle mapa/lista en móvil */}
      <button className="search-mobile-toggle" onClick={() => setMobileMap(m => !m)}>
        {mobileMap ? <><IconList size={15} /> Ver lista</> : <><IconMap size={15} /> Ver mapa</>}
      </button>
    </div>
  );
}

export function SearchApp(props: { initialSearch?: string }) {
  return (
    <QueryProvider>
      <SearchInner {...props} />
    </QueryProvider>
  );
}
