import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup, TileLayer } from 'leaflet';
import { cleanTitle, type Property } from '../../../core/domain/entities/types';
import { shortPrice, priceParts, type Currency } from '../../hooks/useCurrency';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { getBasemap, hasSatellite, type BasemapId } from './basemaps';

// Centro de Honduras (Yoro y alrededores)
const DEFAULT_CENTER: [number, number] = [15.35, -87.8];
const DEFAULT_ZOOM = 10;

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

// Arranca la descarga de Leaflet al evaluar el módulo, no dentro del efecto:
// así baja en paralelo con la hidratación de React en vez de esperarla.
// Guardado por `window` porque Astro también renderiza este island en el server.
const leafletReady = typeof window === 'undefined' ? null : Promise.all([
  import('leaflet').then(m => m.default),
  import('leaflet/dist/leaflet.css?inline').then(m => m.default),
]);

interface MapViewProps {
  properties: Property[];
  currency: Currency;
  selectedId?: string | null;
  onSelect?: (p: Property) => void;
  onOpen?: (p: Property) => void;
}

/**
 * Mapa con pins de precio. Verde pino = normal · terracota = seleccionado.
 * Capa base conmutable (mapa / satélite) — ver `basemaps.ts`.
 * Leaflet se importa dinámicamente — seguro con SSR (client:load).
 */
export function MapView({ properties, currency, selectedId, onSelect, onOpen }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const layerRef = useRef<LayerGroup | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const LRef = useRef<typeof import('leaflet') | null>(null);
  const fittedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [basemap, setBasemap] = useState<BasemapId>('mapa');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!leafletReady) return;
      const [L, leafletCss] = await leafletReady;
      if (!document.getElementById('leaflet-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-css';
        style.textContent = leafletCss;
        document.head.appendChild(style);
      }
      if (cancelled || !containerRef.current || mapRef.current) return;
      LRef.current = L;
      const map = L.map(containerRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      const base = getBasemap('mapa', isDark());
      tileRef.current = L.tileLayer(base.url, {
        attribution: base.attribution,
        maxZoom: 20,
        maxNativeZoom: base.maxNativeZoom,
        // Pinta mientras se arrastra en lugar de esperar a que el gesto pare
        updateWhenIdle: false,
        keepBuffer: 2,
      }).addTo(map);
      L.control.zoom({ position: 'topright' }).addTo(map);
      layerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setReady(true);
    })();
    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  // Cambio de capa base. Se recrea el layer en vez de `setUrl`: tileSize y
  // zoomOffset (Mapbox usa tiles de 512) no se pueden cambiar en caliente.
  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    if (!L || !map || !ready) return;

    const base = getBasemap(basemap, isDark());
    tileRef.current?.remove();
    tileRef.current = L.tileLayer(base.url, {
      attribution: base.attribution,
      maxZoom: 20,
      maxNativeZoom: base.maxNativeZoom,
      tileSize: base.tileSize ?? 256,
      zoomOffset: base.zoomOffset ?? 0,
      updateWhenIdle: false,
      keepBuffer: 2,
    }).addTo(map);
    // Los tiles van al fondo o taparían los pins al recrearse
    tileRef.current.bringToBack();
  }, [basemap, ready]);

  useEffect(() => {
    const L = LRef.current;
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!L || !map || !layer) return;

    layer.clearLayers();
    const located = properties.filter(p => p.lat != null && p.lng != null);

    for (const p of located) {
      const active = p.id === selectedId;
      const icon = L.divIcon({
        className: 'map-pin-wrap',
        html: `<div class="map-price-pin ${active ? 'map-price-pin--active' : ''}">${shortPrice(p.discount_price ?? p.price, p.currency, currency)}</div>`,
        iconSize: [0, 0],
      });
      const marker = L.marker([p.lat as number, p.lng as number], { icon, zIndexOffset: active ? 1000 : 0 });

      const { main } = priceParts(p.discount_price ?? p.price, p.currency, currency);
      const img = p.images?.[0]?.url ? optimizeCloudinaryUrl(p.images[0].url, 320) : '';
      const popupEl = document.createElement('div');
      popupEl.className = 'map-pop';
      popupEl.innerHTML = `
        ${img ? `<img src="${img}" alt="" />` : '<div class="map-pop__noimg">FOTO PENDIENTE</div>'}
        <div class="map-pop__body">
          <div class="map-pop__price">${main}</div>
          <div class="map-pop__title">${cleanTitle(p.title)}</div>
          <div class="map-pop__meta">${p.municipio}, ${p.departamento}${p.area_varas ? ` · ${p.area_varas}` : ''}</div>
          <button class="map-pop__cta" type="button">Ver ficha completa →</button>
        </div>`;
      popupEl.querySelector('.map-pop__cta')?.addEventListener('click', () => onOpen?.(p));

      marker.bindPopup(popupEl, { closeButton: true, offset: L.point(0, -18), minWidth: 236 });
      marker.on('click', () => onSelect?.(p));
      marker.addTo(layer);
    }

    if (located.length > 0 && !fittedRef.current) {
      const bounds = L.latLngBounds(located.map(p => [p.lat as number, p.lng as number] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
      fittedRef.current = true;
    }
  }, [properties, currency, selectedId, onSelect, onOpen, ready]);

  // Al seleccionar desde la lista, centra el mapa en el pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = properties.find(x => x.id === selectedId);
    if (p && p.lat != null && p.lng != null) {
      map.panTo([p.lat, p.lng], { animate: true });
    }
  }, [selectedId]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 0, background: 'var(--pub-border)' }} />
      {hasSatellite && (
        <div className="map-basemap-switch" role="group" aria-label="Vista del mapa">
          {(['mapa', 'satelite'] as const).map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setBasemap(id)}
              aria-pressed={basemap === id}
              className={basemap === id ? 'is-active' : ''}
            >
              {id === 'mapa' ? 'Mapa' : 'Satélite'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
