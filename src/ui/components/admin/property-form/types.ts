// Forma del formulario + valores por defecto. Un solo lugar donde vive la
// estructura: antes estaba duplicada tres veces dentro del componente
// (estado inicial, reset al abrir, reset al cerrar) y se desincronizaba.

export type PropertyKind = 'casa' | 'terreno' | 'lotificacion';

export interface ImageItem {
  type: 'existing' | 'file';
  id?: string;
  url?: string;
  file?: File;
  preview?: string;
  deleting?: boolean;
  label?: string;
}

export interface PropertyForm {
  title: string;
  departamento: string;
  dep_code: string;
  municipio: string;
  area_varas: string;
  area_m2: string;
  price: string;
  discount_price: string;
  financing: boolean;
  contado: boolean;
  financing_prima: string;
  prima_es_fija: boolean;
  prima_monto: string;
  plazo_anios: string;
  financing_tasa_anual: string;
  precio_financiado: string;
  description: string;
  dimensions: string;
  total_lots: string;
  available_lots: string;
  status: string;
  map_url: string;
  facebook_title: string;
  facebook_description: string;
  bedrooms: string;
  bathrooms: string;
  parking: string;
  has_water: boolean;
  has_power: boolean;
  has_deed: boolean;
  highlights: string[];
  lat: number | null;
  lng: number | null;
}

export const EMPTY_FORM: PropertyForm = {
  title: '', departamento: 'Yoro', dep_code: 'YO', municipio: 'El Progreso',
  area_varas: '', area_m2: '', price: '', discount_price: '',
  financing: true, contado: true,
  financing_prima: '20', prima_es_fija: false, prima_monto: '',
  plazo_anios: '10', financing_tasa_anual: '12', precio_financiado: '',
  description: '', dimensions: '', total_lots: '1', available_lots: '1',
  status: 'disponible', map_url: '',
  facebook_title: '', facebook_description: '',
  bedrooms: '', bathrooms: '', parking: '',
  has_water: false, has_power: false, has_deed: false,
  highlights: [],
  lat: null, lng: null,
};

/** Los pasos que ve el usuario. El paso 0 (IA) se puede saltar. */
export const STEPS = [
  { id: 'ia', label: 'Contanos' },
  { id: 'basico', label: 'Lo básico' },
  { id: 'ubicacion', label: 'Dónde queda' },
  { id: 'fotos', label: 'Fotos' },
  { id: 'revisar', label: 'Revisar' },
] as const;

export type StepId = typeof STEPS[number]['id'];

/** Traduce la elección del usuario a lo que espera la API. */
export function toBackendType(kind: PropertyKind) {
  return {
    type: kind === 'casa' ? 'Propiedad' : 'Terreno',
    property_type: kind === 'lotificacion' ? 'lotificadora' : 'independiente',
  };
}
