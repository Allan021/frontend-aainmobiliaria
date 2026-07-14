export interface Property {
  id: string;
  title: string;
  type: 'Terreno' | 'Lote' | 'Casa' | 'Comercial' | 'Propiedad';
  property_type?: 'independiente' | 'lotificadora';
  total_lots?: number;
  available_lots?: number;
  dimensions?: string;
  municipio: string;
  departamento: string;
  dep_code: string;
  price: number;
  discount_price?: number;
  currency: string;
  area_varas: string;
  area_m2: string;
  financing: boolean;
  description: string;
  highlights: string[];
  images: PropertyImage[];
  lotification_name?: string;
  lotification_id?: string;
  status: 'disponible' | 'apartado' | 'vendido' | 'borrador';
  payment_methods: string[];
  financing_prima?: number;
  financing_plazo_meses?: number;
  financing_tasa_anual?: number;
  prima_es_fija?: boolean;
  prima_monto?: number;
  precio_financiado?: number;
  plazo_anios?: number;
  map_url?: string;
  facebook_title?: string;
  facebook_description?: string;
  lat?: number | null;
  lng?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  parking?: number | null;
  has_water?: boolean;
  has_power?: boolean;
  has_deed?: boolean;
  house_preview_url?: string | null;
  created_at: string;
  updated_at: string;
}

/** Borrador de propiedad generado por IA desde un prompt libre */
export interface PropertyDraft {
  title: string;
  description: string;
  type: 'Casa' | 'Terreno' | 'Lote' | 'Comercial';
  price: number | null;
  currency: 'L' | '$' | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parking: number | null;
  area_varas: string | null;
  area_m2: string | null;
  has_water: boolean;
  has_power: boolean;
  has_deed: boolean;
  highlights: string[];
  municipio: string | null;
  departamento: string | null;
}

export interface Favorite {
  id: string;
  property_id: string;
  created_at: string;
  property?: Property;
}

export interface PropertyImage {
  id: string;
  url: string;
  public_id?: string;
  order: number;
  title?: string;
  description?: string;
  label?: string;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  property_id?: string;
  property_title?: string;
  status: 'pendiente' | 'en-conversacion' | 'agendado' | 'cerrado' | 'no-prospera';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  reference: string;
  property_id: string;
  property_title: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone?: string;
  price: number;
  payment_method: string;
  date: string;
  created_at: string;
}

export interface Lote {
  id: string;
  lotification_id: string;
  numero: number;
  nombre?: string | null;
  area_varas?: string | null;
  precio_contado?: number | null;
  precio_financiado?: number | null;
  prima_es_fija?: boolean | null;
  prima_monto?: number | null;
  plazo_meses?: number | null;
  status: 'disponible' | 'apartado' | 'vendido';
  buyer_name?: string | null;
  buyer_phone?: string | null;
  notes?: string | null;
  pagos?: Pago[];
  created_at: string;
  updated_at: string;
}

export interface Pago {
  id: string;
  lote_id: string;
  numero_recibo: string;
  monto: number;
  fecha: string;
  metodo_pago: string;
  concepto: string;
  notas?: string;
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PropertyFilters {
  dep?: string;
  pay?: string;
  status?: string;
  search?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  beds?: number;
  page?: number;
  limit?: number;
}

export interface PropertyStats {
  total: number;
  disponible: number;
  apartado: number;
  vendido: number;
}

export interface SaleMetrics {
  currentMonth: number;
  previousMonth: number;
  deltaPercent: number;
}

export interface Departamento {
  code: string;
  name: string;
}

export const DEPARTAMENTOS: Departamento[] = [
  { code: 'YO', name: 'Yoro' },
  { code: 'CO', name: 'Cortés' },
  { code: 'FM', name: 'Francisco Morazán' },
  { code: 'ATL', name: 'Atlántida' },
  { code: 'CM', name: 'Comayagua' },
  { code: 'CH', name: 'Choluteca' },
];

export function formatPrice(n: number, currency = 'L'): string {
  return `${currency} ${n.toLocaleString('en-US')}`;
}

export function cleanTitle(title: string): string {
  if (!title) return '';
  const emojiRegex = /^[\s\p{Emoji_Presentation}\p{Extended_Pictographic}]+|[\s\p{Emoji_Presentation}\p{Extended_Pictographic}]+$/gu;
  return title.replace(emojiRegex, '').trim();
}

/** Área en varas² lista para mostrar: agrega "v²" solo si el dato es numérico pelado */
export function fmtVaras(v?: string | null): string {
  if (!v) return '';
  return /[a-záéíóúº²]/i.test(v) ? v : `${v} v²`;
}

/** Quita TODOS los emojis y colapsa espacios — para meta tags / SERP */
export function stripEmojis(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}️]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export type DescBlock = { type: 'heading' | 'text' | 'bullet'; text: string };

/**
 * Convierte la descripción cruda del admin (llena de emojis y viñetas ✅/📍)
 * en bloques estructurados y limpios para renderizar como en Zillow:
 * subtítulos, párrafos y listas con checks — sin emojis sueltos.
 */
export function parseDescription(raw?: string | null): DescBlock[] {
  if (!raw) return [];
  const CHECK = /[✅☑✔✓]/u;
  const DASH_START = /^\s*[•·▪▸►◦‣▶✦❖◆➤➔➜✱\-–—*]/u;
  const blocks: DescBlock[] = [];

  for (const line of raw.split(/\r?\n/)) {
    const original = line.trim();
    if (!original) continue;
    const text = stripEmojis(original).replace(/^[•·▪▸►◦‣▶✦❖◆➤➔➜✱\-–—*]\s*/u, '').trim();
    if (!text) continue;

    const lead = original.slice(0, 4); // primeros chars para detectar la viñeta
    const isBullet = CHECK.test(lead) || DASH_START.test(original);
    const isHeading = !isBullet && text.length <= 60 && text.endsWith(':') && text === text.toUpperCase();

    blocks.push({ type: isHeading ? 'heading' : isBullet ? 'bullet' : 'text', text });
  }
  return blocks;
}

