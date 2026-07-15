import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';

interface LocationPickerProps {
  /** [lat, lng] inicial (modo edición) */
  initial?: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
  height?: number;
}

function tileUrl(): string {
  const dark = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  return dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
}

/**
 * Selector de ubicación en mapa (clic = marcar pin).
 * Leaflet se importa dinámicamente — seguro dentro de islas con SSR (client:load).
 */
export function LocationPicker({ initial, onPick, height = 280 }: LocationPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [L, leafletCss] = await Promise.all([
        import('leaflet').then(m => m.default),
        import('leaflet/dist/leaflet.css?inline').then(m => m.default),
      ]);
      if (!document.getElementById('leaflet-css')) {
        const style = document.createElement('style');
        style.id = 'leaflet-css';
        style.textContent = leafletCss;
        document.head.appendChild(style);
      }
      if (cancelled || !ref.current || mapRef.current) return;

      const map = L.map(ref.current).setView(initial || [15.35, -87.8], initial ? 15 : 9);
      L.tileLayer(tileUrl(), {
        attribution: '&copy; OpenStreetMap &copy; CARTO', subdomains: 'abcd', maxZoom: 20,
      }).addTo(map);

      const icon = L.divIcon({
        className: 'map-pin-wrap',
        html: '<div class="map-price-pin map-price-pin--active">Aquí</div>',
        iconSize: [0, 0],
      });
      if (initial) markerRef.current = L.marker(initial, { icon, draggable: true }).addTo(map);

      const place = (lat: number, lng: number) => {
        if (markerRef.current) markerRef.current.setLatLng([lat, lng]);
        else {
          markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
          markerRef.current.on('dragend', () => {
            const pos = markerRef.current!.getLatLng();
            onPickRef.current(pos.lat, pos.lng);
          });
        }
        onPickRef.current(lat, lng);
      };

      markerRef.current?.on('dragend', () => {
        const pos = markerRef.current!.getLatLng();
        onPickRef.current(pos.lat, pos.lng);
      });
      map.on('click', e => place(e.latlng.lat, e.latlng.lng));
      mapRef.current = map;
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: 'relative', height, borderRadius: 14, overflow: 'hidden',
        border: '1.5px solid var(--pub-border2, #E4DFD2)', zIndex: 0, cursor: 'crosshair',
        background: 'var(--pub-border, #EDE9DF)',
      }}
    />
  );
}
