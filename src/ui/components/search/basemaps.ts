// Capas base del mapa. Separado de MapView para que agregar una vista nueva
// no toque la lógica de pins ni de popups.

const MAPBOX_TOKEN = import.meta.env.PUBLIC_MAPBOX_TOKEN as string | undefined;

export type BasemapId = 'mapa' | 'satelite';

export interface Basemap {
  id: BasemapId;
  label: string;
  url: string;
  attribution: string;
  maxNativeZoom: number;
  /** Mapbox sirve tiles de 512px: hay que compensar el zoom o todo sale al doble */
  tileSize?: number;
  zoomOffset?: number;
}

const CARTO_ATTR =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

function carto(dark: boolean): Basemap {
  return {
    id: 'mapa',
    label: 'Mapa',
    // Un solo host: CARTO va por HTTP/2, repartir en a/b/c/d abre 4 conexiones TLS
    url: dark
      ? 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
      : 'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: CARTO_ATTR,
    // CARTO no tiene raster arriba de z19; sin esto el zoom máximo queda en gris
    maxNativeZoom: 19,
  };
}

// satellite-streets = foto aérea + nombres de calles encima. Sin las etiquetas
// la vista satelital es bonita pero no sirve para ubicarse.
const mapboxSatellite: Basemap = {
  id: 'satelite',
  label: 'Satélite',
  url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/512/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
  attribution: '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  maxNativeZoom: 22,
  tileSize: 512,
  zoomOffset: -1,
};

export const hasSatellite = Boolean(MAPBOX_TOKEN);

export function getBasemap(id: BasemapId, dark: boolean): Basemap {
  // Sin token no hay satélite — se cae a mapa en vez de pedir tiles que dan 401
  if (id === 'satelite' && hasSatellite) return mapboxSatellite;
  return carto(dark);
}
