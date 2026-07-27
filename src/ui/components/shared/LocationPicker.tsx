import { useEffect, useRef } from 'react';
import type { Map as LeafletMap, Marker } from 'leaflet';
import { useLeaflet } from './map/useLeaflet';
import { getBasemap } from './map/basemaps';

interface LocationPickerProps {
  /** [lat, lng] inicial (modo edición) */
  initial?: [number, number] | null;
  onPick: (lat: number, lng: number) => void;
  height?: number;
}

const CENTRO_HN: [number, number] = [15.35, -87.8];

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

/** Selector de ubicación en mapa (clic o arrastre del pin). */
export function LocationPicker({ initial, onPick, height = 280 }: LocationPickerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  // En un ref para que cambiar el callback no vuelva a crear el mapa
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;

  const L = useLeaflet();

  useEffect(() => {
    if (!L || !ref.current || mapRef.current) return;

    const map = L.map(ref.current).setView(initial || CENTRO_HN, initial ? 15 : 9);
    const base = getBasemap('mapa', isDark());
    L.tileLayer(base.url, {
      attribution: base.attribution,
      maxZoom: 20,
      maxNativeZoom: base.maxNativeZoom,
    }).addTo(map);

    const icon = L.divIcon({
      className: 'map-pin-wrap',
      html: '<div class="map-price-pin map-price-pin--active">Aquí</div>',
      iconSize: [0, 0],
    });

    const onDragEnd = () => {
      const pos = markerRef.current!.getLatLng();
      onPickRef.current(pos.lat, pos.lng);
    };

    const place = (lat: number, lng: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', onDragEnd);
      }
      onPickRef.current(lat, lng);
    };

    if (initial) {
      markerRef.current = L.marker(initial, { icon, draggable: true }).addTo(map);
      markerRef.current.on('dragend', onDragEnd);
    }

    map.on('click', e => place(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [L]);

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
