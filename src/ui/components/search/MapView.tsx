import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { cleanTitle, type Property } from '../../../core/domain/entities/types';
import { shortPrice, priceParts, type Currency } from '../../hooks/useCurrency';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';

// Centro de Honduras (Yoro y alrededores)
const DEFAULT_CENTER: [number, number] = [15.35, -87.8];
const DEFAULT_ZOOM = 10;

interface MapViewProps {
  properties: Property[];
  currency: Currency;
  selectedId?: string | null;
  onSelect?: (p: Property) => void;
  onOpen?: (p: Property) => void;
}

/**
 * Mapa con tiles CARTO Voyager (look limpio y pro) y pins de precio.
 * Verde pino = normal · terracota = seleccionado. Solo montar con client:only.
 */
export function MapView({ properties, currency, selectedId, onSelect, onOpen }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);
  const fittedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current, { zoomControl: false }).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    // Tiles CARTO Voyager — más limpios que OSM estándar, gratis con atribución
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(map);
    L.control.zoom({ position: 'topright' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
      fittedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

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
  }, [properties, currency, selectedId, onSelect, onOpen]);

  // Al seleccionar desde la lista, centra el mapa en el pin
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;
    const p = properties.find(x => x.id === selectedId);
    if (p && p.lat != null && p.lng != null) {
      map.panTo([p.lat, p.lng], { animate: true });
    }
  }, [selectedId]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />;
}
