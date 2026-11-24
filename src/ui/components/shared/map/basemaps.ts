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

const MAPBOX_ATTR =
  '&copy; <a href="https://www.mapbox.com/about/maps/">Mapbox</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// CARTO empezó a exigir API key (los tiles salían con "API KEY REQUIRED"), así
// que el mapa base sale de Mapbox, que ya se usa para satélite. Tiles de 256
// para no depender de tileSize/zoomOffset en quien crea el layer.
function streets(dark: boolean): Basemap {
  if (!MAPBOX_TOKEN) {
    // ponytail: sin token cae a OSM estándar, que no tiene versión oscura
    return {
      id: 'mapa',
      label: 'Mapa',
      url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxNativeZoom: 19,
    };
  }
  return {
    id: 'mapa',
    label: 'Mapa',
    url: `https://api.mapbox.com/styles/v1/mapbox/${dark ? 'dark-v11' : 'streets-v12'}/tiles/256/{z}/{x}/{y}@2x?access_token=${MAPBOX_TOKEN}`,
    attribution: MAPBOX_ATTR,
    maxNativeZoom: 22,
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
  return streets(dark);
}
