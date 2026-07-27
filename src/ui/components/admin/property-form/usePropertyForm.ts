import { useCallback, useEffect, useRef, useState } from 'react';
import type { Property } from '../../../../core/domain/entities/types';
import { EMPTY_FORM, type ImageItem, type PropertyForm, type PropertyKind } from './types';

const DRAFT_KEY = 'aa_property_draft';

function fromProperty(p: Property): PropertyForm {
  const plazoMeses = p.financing_plazo_meses || 120;
  const any = p as any;
  return {
    ...EMPTY_FORM,
    title: p.title || '',
    departamento: p.departamento || EMPTY_FORM.departamento,
    dep_code: p.dep_code || EMPTY_FORM.dep_code,
    municipio: p.municipio || EMPTY_FORM.municipio,
    area_varas: p.area_varas || '',
    area_m2: p.area_m2 || '',
    price: String(p.price || ''),
    discount_price: p.discount_price ? String(p.discount_price) : '',
    financing: p.financing ?? true,
    contado: p.payment_methods?.includes('contado') ?? true,
    financing_prima: String(p.financing_prima || '20'),
    prima_es_fija: any.prima_es_fija ?? false,
    prima_monto: any.prima_monto ? String(any.prima_monto) : '',
    plazo_anios: String(Math.round(plazoMeses / 12) || 10),
    financing_tasa_anual: String(p.financing_tasa_anual || '12'),
    precio_financiado: any.precio_financiado ? String(any.precio_financiado) : '',
    description: p.description || '',
    dimensions: any.dimensions || '',
    total_lots: String(any.total_lots || '1'),
    available_lots: String(any.available_lots || '1'),
    status: p.status || 'disponible',
    map_url: any.map_url || '',
    facebook_title: any.facebook_title || '',
    facebook_description: any.facebook_description || '',
    bedrooms: p.bedrooms != null ? String(p.bedrooms) : '',
    bathrooms: p.bathrooms != null ? String(p.bathrooms) : '',
    parking: p.parking != null ? String(p.parking) : '',
    has_water: !!p.has_water,
    has_power: !!p.has_power,
    has_deed: !!p.has_deed,
    highlights: p.highlights || [],
    lat: p.lat ?? null,
    lng: p.lng ?? null,
  };
}

function kindOf(p: Property): PropertyKind {
  if ((p as any).property_type === 'lotificadora') return 'lotificacion';
  return p.type === 'Terreno' ? 'terreno' : 'casa';
}

export function usePropertyForm(property: Property | null | undefined, open: boolean) {
  const [form, setForm] = useState<PropertyForm>(EMPTY_FORM);
  const [kind, setKind] = useState<PropertyKind>('casa');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [dirty, setDirty] = useState(false);
  const [draftFound, setDraftFound] = useState(false);
  const skipDraftSave = useRef(true);

  // Actualización funcional: con `setForm({...form})` dos teclas seguidas
  // dentro del mismo tick se pisaban entre sí.
  const set = useCallback(<K extends keyof PropertyForm>(key: K, value: PropertyForm[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const patch = useCallback((values: Partial<PropertyForm>) => {
    setForm(prev => ({ ...prev, ...values }));
    setDirty(true);
  }, []);

  // Reset al abrir/cambiar de propiedad
  useEffect(() => {
    if (!open) return;
    skipDraftSave.current = true;

    if (property) {
      setForm(fromProperty(property));
      setKind(kindOf(property));
      setImages((property.images || []).map(img => ({
        type: 'existing' as const,
        id: img.id, url: img.url, preview: img.url, label: img.label,
      })));
      setDraftFound(false);
    } else {
      setForm(EMPTY_FORM);
      setKind('casa');
      setImages([]);
      setDraftFound(hasDraft());
    }
    setDirty(false);
    // Un tick para que el efecto de guardado no dispare con el reset
    const t = setTimeout(() => { skipDraftSave.current = false; }, 0);
    return () => clearTimeout(t);
  }, [property, open]);

  // Autoguardado del borrador (solo en alta nueva: editar ya tiene respaldo en la DB)
  useEffect(() => {
    if (!open || property || skipDraftSave.current || !dirty) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, kind }));
      } catch { /* cuota llena: el borrador es un extra, no rompe el alta */ }
    }, 800);
    return () => clearTimeout(t);
  }, [form, kind, open, property, dirty]);

  const restoreDraft = useCallback(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as { form: PropertyForm; kind: PropertyKind };
      setForm({ ...EMPTY_FORM, ...saved.form });
      setKind(saved.kind || 'casa');
      setDraftFound(false);
      setDirty(true);
    } catch { setDraftFound(false); }
  }, []);

  const discardDraft = useCallback(() => {
    try { localStorage.removeItem(DRAFT_KEY); } catch { /* nada que limpiar */ }
    setDraftFound(false);
  }, []);

  return {
    form, set, patch, setForm,
    kind, setKind,
    images, setImages,
    dirty, setDirty,
    draftFound, restoreDraft, discardDraft,
  };
}

function hasDraft(): boolean {
  try { return Boolean(localStorage.getItem(DRAFT_KEY)); } catch { return false; }
}

export function clearDraft() {
  try { localStorage.removeItem(DRAFT_KEY); } catch { /* nada que limpiar */ }
}
