import { useEffect, useRef, useState } from 'react';
import type { Map as LeafletMap, TileLayer } from 'leaflet';
import { useLeaflet, useNearViewport } from '../../shared/map/useLeaflet';
import { BasemapSwitch } from '../../shared/map/BasemapSwitch';
import { getBasemap, type BasemapId } from '../../shared/map/basemaps';

interface Props {
  lat: number;
  lng: number;
  /** Radio del círculo de zona, en metros */
  radius?: number;
}

const isDark = () =>
  typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';

/**
 * Mapa de zona aproximada de la ficha. Arrastre bloqueado a propósito — se
 * muestra un área, no una dirección — pero el zoom sí funciona para que el
 * cliente ubique el barrio.
 */
export function ZoneMap({ lat, lng, radius = 420 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tileRef = useRef<TileLayer | null>(null);
  const [basemap, setBasemap] = useState<BasemapId>('mapa');

  // No se descarga Leaflet hasta que el mapa se acerca al viewport
  const near = useNearViewport(wrapRef);
  const L = useLeaflet(near);

  useEffect(() => {
    if (!L || !nodeRef.current || mapRef.current) return;

    const map = L.map(nodeRef.current, {
      zoomControl: true,
      scrollWheelZoom: false,   // no secuestra el scroll de la página
      dragging: false,
      // La atribución vuelve: OSM (ODbL) y CARTO exigen crédito visible.
      // Estaba en `false`, lo que incumple la licencia de los tiles.
      attributionControl: true,
    }).setView([lat, lng], 14);

    const base = getBasemap('mapa', isDark());
    tileRef.current = L.tileLayer(base.url, {
      attribution: base.attribution,
      maxZoom: 20,
      maxNativeZoom: base.maxNativeZoom,
    }).addTo(map);

    L.circle([lat, lng], { radius, color: '#C65D3B', weight: 2, fillColor: '#C65D3B', fillOpacity: 0.18 }).addTo(map);
    L.circleMarker([lat, lng], { radius: 7, color: '#FFFFFF', weight: 3, fillColor: '#C65D3B', fillOpacity: 1 }).addTo(map);

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; tileRef.current = null; };
  }, [L, lat, lng, radius]);

  // Cambio de capa: se recrea el layer porque tileSize/zoomOffset (Mapbox usa
  // tiles de 512) no se pueden cambiar en caliente.
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
    }).addTo(map);
    tileRef.current.bringToBack();
  }, [basemap, L]);

  return (
    <div ref={wrapRef} style={{ position: 'absolute', inset: 0 }}>
      <div ref={nodeRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
      <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 800 }}>
        <BasemapSwitch value={basemap} onChange={setBasemap} size="compact" />
      </div>
    </div>
  );
}
