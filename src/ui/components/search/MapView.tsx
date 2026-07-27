import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, LayerGroup, TileLayer } from 'leaflet';
import { cleanTitle, type Property } from '../../../core/domain/entities/types';
import { shortPrice, priceParts, type Currency } from '../../hooks/useCurrency';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';
import { getBasemap, type BasemapId } from '../shared/map/basemaps';
import { BasemapSwitch } from '../shared/map/BasemapSwitch';
import { useLeaflet } from '../shared/map/useLeaflet';

// Centro de Honduras (Yoro y alrededores)
const DEFAULT_CENTER: [number, number] = [15.35, -87.8];
const DEFAULT_ZOOM = 10;

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

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
  const fittedRef = useRef(false);
  const [basemap, setBasemap] = useState<BasemapId>('mapa');
  const L = useLeaflet();
  const ready = Boolean(L && mapRef.current);

  useEffect(() => {
    if (!L || !containerRef.current || mapRef.current) return;

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

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      tileRef.current = null;
      fittedRef.current = false;
    };
  }, [L]);

  // Cambio de capa base. Se recrea el layer en vez de `setUrl`: tileSize y
  // zoomOffset (Mapbox usa tiles de 512) no se pueden cambiar en caliente.
  useEffect(() => {
    const map = mapRef.current;
    if (!L || !map) return;

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
  }, [basemap, L]);

  useEffect(() => {
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
          <button class="map-pop__cta" type="button">
            Ver ficha completa
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
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
  }, [properties, currency, selectedId, onSelect, onOpen, L]);

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
      <div style={{ position: 'absolute', left: 12, bottom: 12, zIndex: 800 }}>
        <BasemapSwitch value={basemap} onChange={setBasemap} />
      </div>
    </div>
  );
}
