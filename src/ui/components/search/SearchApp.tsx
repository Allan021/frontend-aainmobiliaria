import { useEffect, useState } from 'react';
import { QueryProvider } from '../../providers/QueryProvider';
import { useProperties } from '../../hooks/useProperties';
import { useFavoriteIds, useToggleFavorite, isLoggedIn, requireLogin } from '../../hooks/useFavorites';
import { PropertyCard } from '../property/PropertyCard';
import { MapView } from './MapView';
import type { Property } from '../../../core/domain/entities/types';
import { IconSearch, IconMap, IconList, IconHome } from '../shared/rs-icons';

const TYPES = ['Casa', 'Terreno', 'Lote', 'Comercial'];
const PRICE_STEPS = [250_000, 500_000, 1_000_000, 2_000_000, 4_000_000, 8_000_000];

function fmtStep(n: number) {
  return n >= 1_000_000 ? `L ${n / 1_000_000}M` : `L ${n / 1_000}k`;
}

function CardSkeleton() {
  return (
    <div className="rs-card" style={{ overflow: 'hidden' }}>
      <div className="rs-skeleton" style={{ aspectRatio: '4/3', borderRadius: 0 }} />
      <div style={{ padding: '1rem' }}>
        <div className="rs-skeleton" style={{ height: 13, width: '50%', marginBottom: 10 }} />
        <div className="rs-skeleton" style={{ height: 17, width: '85%', marginBottom: 10 }} />
        <div className="rs-skeleton" style={{ height: 13, width: '40%' }} />
      </div>
    </div>
  );
}

function getInitialQuery(fallback?: string): string {
  if (typeof window === 'undefined') return fallback || '';
  return new URLSearchParams(window.location.search).get('q') || fallback || '';
}

function SearchInner({ initialSearch }: { initialSearch?: string }) {
  const [searchInput, setSearchInput] = useState(() => getInitialQuery(initialSearch));
  const [search, setSearch] = useState(() => getInitialQuery(initialSearch));
  const [type, setType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [beds, setBeds] = useState('');
  const [mobileMap, setMobileMap] = useState(false);

  // Debounce del texto de búsqueda
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const { data, isLoading } = useProperties({
    status: 'disponible',
    limit: 100,
    search: search || undefined,
    type: type || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    beds: beds ? Number(beds) : undefined,
  });
  const properties = data?.data || [];
  const activeFilters = [type, minPrice, maxPrice, beds].filter(Boolean).length;

  const favIds = useFavoriteIds();
  const toggleFav = useToggleFavorite();
  const handleToggleSave = (p: Property) => {
    if (!isLoggedIn()) return requireLogin();
    toggleFav.mutate({ propertyId: p.id, saved: favIds.has(p.id) });
  };

  const openProperty = (p: Property) => { window.location.href = `/propiedad/${p.id}`; };
  const openWhatsApp = (p: Property) =>
    window.dispatchEvent(new CustomEvent('open-whatsapp-modal', { detail: { property: p } }));

  const clearFilters = () => { setType(''); setMinPrice(''); setMaxPrice(''); setBeds(''); };

  return (
    <div style={{ background: 'var(--main-bg, #FAF8F3)' }}>
      {/* Barra de filtros — el buscador es el CTA */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center',
        padding: '0.875rem 1.25rem',
        borderBottom: '1px solid var(--main-border, #E6E0D2)',
        background: 'var(--main-card-bg, #fff)',
        position: 'sticky', top: 0, zIndex: 400,
      }}>
        <div style={{ position: 'relative', flex: '1 1 260px', maxWidth: 440 }}>
          <span style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-pine-600, #1F5B42)', display: 'flex' }}>
            <IconSearch size={16} />
          </span>
          <input
            className="rs-input"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Municipio, departamento o título…"
            aria-label="Buscar propiedades"
            style={{ paddingLeft: '2.5rem', borderRadius: 999 }}
          />
        </div>

        <select className="rs-input" value={type} onChange={e => setType(e.target.value)}
          aria-label="Tipo de propiedad" style={{ width: 'auto', borderRadius: 999, fontWeight: 700, fontSize: '0.8125rem' }}>
          <option value="">Tipo: todos</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select className="rs-input" value={minPrice} onChange={e => setMinPrice(e.target.value)}
          aria-label="Precio mínimo" style={{ width: 'auto', borderRadius: 999, fontWeight: 700, fontSize: '0.8125rem' }}>
          <option value="">Precio mín.</option>
          {PRICE_STEPS.map(p => <option key={p} value={p}>{fmtStep(p)}</option>)}
        </select>

        <select className="rs-input" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
          aria-label="Precio máximo" style={{ width: 'auto', borderRadius: 999, fontWeight: 700, fontSize: '0.8125rem' }}>
          <option value="">Precio máx.</option>
          {PRICE_STEPS.map(p => <option key={p} value={p}>{fmtStep(p)}</option>)}
        </select>

        <select className="rs-input" value={beds} onChange={e => setBeds(e.target.value)}
          aria-label="Habitaciones mínimas" style={{ width: 'auto', borderRadius: 999, fontWeight: 700, fontSize: '0.8125rem' }}>
          <option value="">Habitaciones</option>
          {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}+</option>)}
        </select>

        {activeFilters > 0 && (
          <button onClick={clearFilters} className="rs-btn rs-btn--ghost rs-btn--sm" type="button">
            Limpiar ({activeFilters})
          </button>
        )}
      </div>

      {/* Mapa + resultados */}
      <div className="search-layout">
        <div className={`search-map-col ${mobileMap ? 'search-map-col--visible' : ''}`}>
          <MapView properties={properties} onSelect={openProperty} />
        </div>

        <div className={`search-results-col ${mobileMap ? 'search-results-col--hidden' : ''}`}>
          <div style={{ padding: '1.25rem 1.25rem 0' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--main-text, #111113)', margin: 0, letterSpacing: '-0.02em' }}>
              Propiedades en Honduras
            </h1>
            <div style={{ fontSize: '0.8125rem', color: 'var(--main-text-dim, #9A9383)', marginTop: 4, fontWeight: 600, fontFeatureSettings: "'tnum' 1" }} aria-live="polite">
              {isLoading ? 'Buscando…' : `${data?.total ?? properties.length} resultados`}
            </div>
          </div>

          <div className="search-results-grid">
            {isLoading && <><CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton /></>}
            {properties.map(p => (
              <PropertyCard
                key={p.id}
                property={p}
                onOpen={openProperty}
                onWhatsApp={openWhatsApp}
                saved={favIds.has(p.id)}
                onToggleSave={handleToggleSave}
              />
            ))}
          </div>

          {!isLoading && properties.length === 0 && (
            <div className="rs-empty">
              <div className="rs-empty__icon"><IconHome size={28} /></div>
              <div className="rs-empty__title">Sin resultados</div>
              <div className="rs-empty__sub">Pruebe ampliar los filtros o buscar otra zona.</div>
              {activeFilters > 0 && (
                <button onClick={clearFilters} className="rs-btn rs-btn--secondary" style={{ marginTop: 16 }}>
                  Limpiar filtros
                </button>
              )}
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
