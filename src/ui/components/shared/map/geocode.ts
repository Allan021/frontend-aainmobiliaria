// `import.meta.env` no existe fuera de Vite (p. ej. corriendo src/check.ts con node)
const TOKEN = import.meta.env?.PUBLIC_MAPBOX_TOKEN as string | undefined;

export interface GeocodeHit {
  lat: number;
  lng: number;
  /** Lo que devolvió el servicio, para mostrarlo y que la persona lo verifique */
  label: string;
  /** `address`/`street`/`neighborhood` = exacto · `place` = centro del pueblo */
  precision: string;
}

export const geocodeDisponible = Boolean(TOKEN);

/** Sin tildes, sin mayúsculas, sin ruido: "Departamento de Yoro" -> "yoro" */
export function normalizar(s: string) {
  return s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\b(departamento|de|del|la|el|los|las)\b/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * La cobertura de Mapbox en Honduras no llega a nivel de colonia. Cuando no
 * encuentra la referencia, devuelve igual el lugar que más se le parezca — y
 * eso miente: "Boulevard Morazán, Tegucigalpa" devuelve el pueblo de Morazán,
 * Yoro, a 150 km. Un pin equivocado es peor que ningún pin, así que se descarta
 * todo resultado que no caiga en el municipio o el departamento esperados.
 */
export function coincideConLoEsperado(
  contexto: Record<string, { name?: string } | undefined>,
  municipio?: string | null,
  departamento?: string | null,
): boolean {
  // Sin nada contra qué contrastar no se puede verificar: se acepta
  if (!municipio && !departamento) return true;

  const delContexto = [contexto.place?.name, contexto.locality?.name, contexto.district?.name]
    .filter(Boolean).map(v => normalizar(v!));
  const region = contexto.region?.name ? normalizar(contexto.region.name) : null;

  if (municipio && delContexto.includes(normalizar(municipio))) return true;
  if (departamento && region === normalizar(departamento)) return true;
  return false;
}

/**
 * Convierte una referencia de texto en coordenadas.
 * `municipio` y `departamento` no son solo parte de la búsqueda: se usan para
 * verificar que el resultado caiga donde corresponde.
 * Devuelve null si no hay token, si no hay qué buscar, si no hubo match o si el
 * match cayó en otro lado — quien llama deja el pin sin poner.
 */
export async function geocode(
  referencia: string | null | undefined,
  municipio?: string | null,
  departamento?: string | null,
): Promise<GeocodeHit | null> {
  if (!TOKEN) return null;

  const consulta = [referencia, municipio, departamento]
    .map(p => p?.trim()).filter(Boolean).join(', ');
  if (consulta.length < 3) return null;

  const url = new URL('https://api.mapbox.com/search/geocode/v6/forward');
  url.searchParams.set('q', `${consulta}, Honduras`);
  url.searchParams.set('country', 'hn');
  url.searchParams.set('language', 'es');
  // Varios candidatos: el primero puede fallar la verificación y el segundo no
  url.searchParams.set('limit', '5');
  url.searchParams.set('access_token', TOKEN);

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();

    for (const hit of data.features ?? []) {
      const coords = hit?.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;

      const props = hit.properties ?? {};
      if (!coincideConLoEsperado(props.context ?? {}, municipio, departamento)) continue;

      return {
        lng: coords[0],
        lat: coords[1],
        label: props.full_address || props.name || consulta,
        precision: props.feature_type || 'desconocida',
      };
    }
    return null;
  } catch {
    // Geocodificar es una ayuda, no un requisito: si falla, el pin se pone a mano
    return null;
  }
}

/** ¿El resultado es puerta a puerta, o apenas el centro del pueblo? */
export function esPrecisa(precision: string) {
  return precision === 'address' || precision === 'street' || precision === 'neighborhood';
}
