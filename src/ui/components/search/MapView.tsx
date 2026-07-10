import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { formatPrice, cleanTitle, type Property } from '../../../core/domain/entities/types';
import { optimizeCloudinaryUrl } from '../../../core/utils/cloudinaryUtils';

// Centro de Honduras
const DEFAULT_CENTER: [number, number] = [14.75, -86.6];
const DEFAULT_ZOOM = 7;

function shortPrice(p: Property): string {
  const n = p.discount_price ?? p.price;
  const cur = p.currency || 'L';
  if (n >= 1_000_000) return `${cur} ${(n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1)}M`;
  if (n >= 1_000) return `${cur} ${Math.round(n / 1_000)}k`;
  return `${cur} ${n}`;
}

interface MapViewProps {
  properties: Property[];
  onSelect?: (p: Property) => void;
}

/**
 * Mapa OpenStreetMap con pins de precio estilo Zillow.
 * Solo montar con client:only (leaflet toca window al importarse).
 */
export function MapView({ properties, onSelect }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = L.map(containerRef.current).setView(DEFAULT_CENTER, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();
    const located = properties.filter(p => p.lat != null && p.lng != null);

    for (const p of located) {
      const icon = L.divIcon({
        className: 'map-pin-wrap',
        html: `<div class="map-price-pin">${shortPrice(p)}</div>`,
        iconSize: [0, 0],
      });
      const marker = L.marker([p.lat as number, p.lng as number], { icon });

      const img = p.images?.[0]?.url
        ? optimizeCloudinaryUrl(p.images[0].url, 320)
        : '/montana.jpg';
      const popupEl = document.createElement('div');
      popupEl.className = 'map-pop';
      popupEl.innerHTML = `
        <img src="${img}" alt="" />
        <div class="map-pop__body">
          <div class="map-pop__price">${formatPrice(p.discount_price ?? p.price, p.currency)}</div>
          <div class="map-pop__meta">${cleanTitle(p.title)}</div>
          <div class="map-pop__meta">${p.municipio}, ${p.departamento}</div>
        </div>`;
      popupEl.addEventListener('click', () => onSelect?.(p));

      marker.bindPopup(popupEl, { closeButton: true, offset: L.point(0, -18) });
      marker.addTo(layer);
    }

    if (located.length > 0) {
      const bounds = L.latLngBounds(located.map(p => [p.lat as number, p.lng as number] as [number, number]));
      map.fitBounds(bounds.pad(0.2), { maxZoom: 14 });
    }
  }, [properties, onSelect]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', zIndex: 0 }} />;
}
