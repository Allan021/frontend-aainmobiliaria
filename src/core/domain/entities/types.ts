export interface Property {
  id: string;
  title: string;
  type: 'Terreno' | 'Lote' | 'Casa' | 'Comercial';
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
  created_at: string;
  updated_at: string;
}

export interface PropertyImage {
  id: string;
  url: string;
  public_id?: string;
  order: number;
  title?: string;
  description?: string;
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
